import "reflect-metadata";
import {container, DependencyContainer, isClassProvider, ValueProvider, instanceCachingFactory} from "tsyringe";
import {
    Response,
    Request,
    Router,
    controllerRegistry,
    RouteMethodDecorator,
    RouterInterface,
    Route,
    HttpError,
} from "@pristine-ts/networking";
import {RequestInterface} from "@pristine-ts/common";
import {ConfigurationManager, ModuleConfigurationValue} from "@pristine-ts/configuration";
import {Event} from "@pristine-ts/event";
import {RuntimeError} from "./errors/runtime.error";
import {RequestInterceptorInterface} from "./interfaces/request-interceptor.interface";
import {ResponseInterceptorInterface} from "./interfaces/response-interceptor.interface";
import {ErrorResponseInterceptorInterface} from "./interfaces/error-response-interceptor.interface";
import {
    ServiceDefinitionTagEnum,
    ModuleInterface,
    ProviderRegistration,
    taggedProviderRegistrationsRegistry, moduleScopedServicesRegistry, TaggedRegistrationInterface
} from "@pristine-ts/common";
import {EventTransformer, EventDispatcher} from "@pristine-ts/event";
import util from "util";
import {mergeWith} from "lodash"
import {RequestHandlingError} from "./errors/request-handling.error";
import {ProviderRegistrationError} from "./errors/provider-registration.error";
import {KernelInitializationError} from "./errors/kernel-initialization.error";
import {ErrorResponseInterceptionExecutionError} from "./errors/error-response-interception-execution.error";
import {ResponseInterceptionExecutionError} from "./errors/response-interception-execution.error";
import {RequestInterceptionExecutionError} from "./errors/request-interception-execution.error";
import {EventInterceptionExecutionError} from "./errors/event-interception-execution.error";
import {EventInterceptorInterface} from "./interfaces/event-interceptor.interface";
import {Span, SpanKeynameEnum, TracingManagerInterface} from "@pristine-ts/telemetry";

/**
 * This is the central class that manages the lifecyle of this library.
 */
export class Kernel {
    /**
     * Contains a reference to the root Dependency Injection Container.
     */
    public container: DependencyContainer = container.createChildContainer();

    private instantiatedModules: { [id: string]: ModuleInterface } = {};

    private afterInstantiatedModules: { [id: string]: ModuleInterface } = {};

    /**
     * Contains a reference to the Router. It is undefined until this.setupRouter() is called.
     * @private
     */
    private router?: RouterInterface;

    private initializationSpan: Span = new Span(SpanKeynameEnum.KernelInitialization);

    public constructor() {
    }

    public async init(module: ModuleInterface, moduleConfigurationValues?: { [key: string]: ModuleConfigurationValue }) {
        await this.initModule(module);

        // Register all the service tags in the container.
        await this.registerServiceTags();

        // Register the configuration
        await this.initConfiguration(moduleConfigurationValues);

        await this.afterInitModule(module);

        this.initializationSpan.endDate = Date.now();
    }

    /**
     * Register the provider registration in the container.
     * @param providerRegistration
     * @private
     */
    private registerProviderRegistration(providerRegistration: ProviderRegistration) {
        const args = [
            providerRegistration.token,
            providerRegistration,
        ];

        if (providerRegistration.hasOwnProperty("options")) {
            // Ignore this since even if we check for the property to exist, it complains.
            // @ts-ignore
            args.push(providerRegistration.options);
        }

        try {
            // Register the provider in the container
            // @ts-ignore
            this.container.register.apply(this.container, args);
        } catch (e) {
            throw new ProviderRegistrationError("There was an registering the providerRegistration: ", providerRegistration, this);
        }
    }


    /**
     * This method receives a module and recursively calls back this method with the module dependencies
     * specified as imported by the module.
     *
     * This method also registers all the service definitions in the container.
     *
     * @param module
     * @param moduleConfigurations
     * @private
     */
    private async initModule(module: ModuleInterface) {
        if (module.importModules) {
            // Start by recursively importing all the packages
            for (let importedModule of module.importModules) {
                await this.initModule(importedModule);
            }
        }

        if (this.instantiatedModules.hasOwnProperty(module.keyname)) {
            // module already instantiated, we return
            return;
        }

        // Add all the providers to the container
        if (module.providerRegistrations) {
            module.providerRegistrations.forEach((providerRegistration: ProviderRegistration) => {
                this.registerProviderRegistration(providerRegistration);
            })
        }

        if (module.onInit) {
            await module.onInit(this.container);
        }

        this.instantiatedModules[module.keyname] = module;
    }

    private async initConfiguration(moduleConfigurationValues?: { [key: string]: ModuleConfigurationValue }) {
        const configurationManager: ConfigurationManager = this.container.resolve(ConfigurationManager);

        // Start by loading the configuration definitions of all the modules
        for (let key in this.instantiatedModules) {
            if (this.instantiatedModules.hasOwnProperty(key) === false) {
                continue;
            }

            const instantiatedModule: ModuleInterface = this.instantiatedModules[key];
            if (instantiatedModule.configurationDefinitions) {
                instantiatedModule.configurationDefinitions.forEach(configurationDefinition => configurationManager.register(configurationDefinition));
            }
        }

        // Load the configuration values passed by the app
        await configurationManager.load(moduleConfigurationValues ?? {}, this.container);
    }

    /**
     * This method receives a module and recursively calls back this method with the module dependencies
     * specified as imported by the module.
     *
     * @param module
     * @private
     */
    private async afterInitModule(module: ModuleInterface) {
        if (module.importModules) {
            // Start by recursively importing all the packages
            for (let importedModule of module.importModules) {
                await this.afterInitModule(importedModule);
            }
        }

        if (this.afterInstantiatedModules.hasOwnProperty(module.keyname)) {
            // module already instantiated, we return
            return;
        }

        if (module.afterInit) {
            await module.afterInit(this.container);
        }

        this.afterInstantiatedModules[module.keyname] = module;
    }

    /**
     * This method executes all the RequestInterceptors and returns the request updated by the interceptors.
     *
     * @param request
     * @param container
     * @private
     */
    private async executeRequestInterceptors(request: Request, container: DependencyContainer): Promise<Request> {
        // Execute all the request interceptors
        let interceptedRequest = request;

        // Check first if there are any RequestInterceptors
        if (container.isRegistered(ServiceDefinitionTagEnum.RequestInterceptor, true)) {
            const interceptors: any[] = container.resolveAll(ServiceDefinitionTagEnum.RequestInterceptor);

            for (const interceptor of interceptors) {
                // We don't have a guarantee that the request interceptors will implement the Interface, even though we specify it should.
                // So, we have to verify that the method exists, and if it doesn't we throw
                if (typeof interceptor.interceptRequest === "undefined") {
                    throw new RequestInterceptionExecutionError("The Request Interceptor doesn't have the 'interceptRequest' method. RequestInterceptors should implement the RequestInterceptor interface.", request, this);
                }

                try {
                    // https://stackoverflow.com/a/27760489/684101
                    interceptedRequest = await Promise.resolve((interceptor as RequestInterceptorInterface).interceptRequest(interceptedRequest));
                } catch (error) {
                    throw new RequestInterceptionExecutionError("There was an exception thrown while executing the 'interceptRequest' method of the RequestInterceptor.", request, this, error);
                }
            }
        }

        return interceptedRequest;
    }

    /**
     * This method executes all the EventInterceptors and returns the event updated by the interceptors.
     *
     * @param event
     * @param container
     * @private
     */
    private async executeRawEventInterceptors(event: any): Promise<any> {
        // Execute all the event interceptors
        let interceptedEvent = event;

        // Check first if there are any EventInterceptors
        if (this.container.isRegistered(ServiceDefinitionTagEnum.EventInterceptor, true)) {
            const interceptors: any[] = this.container.resolveAll(ServiceDefinitionTagEnum.EventInterceptor);

            for (const interceptor of interceptors) {
                // We don't have a guarantee that the event interceptors will implement the Interface, even though we specify it should.
                // So, we have to verify that the method exists, and if it doesn't we throw
                if (typeof interceptor.interceptRawEvent === "undefined") {
                    throw new EventInterceptionExecutionError("The Event Interceptor doesn't have the 'interceptRawEvent' method. EventInterceptors should implement the EventInterceptor interface.", event, this);
                }

                try {
                    // https://stackoverflow.com/a/27760489/684101
                    interceptedEvent = await Promise.resolve((interceptor as EventInterceptorInterface).interceptRawEvent(interceptedEvent));
                } catch (error) {
                    throw new EventInterceptionExecutionError("There was an exception thrown while executing the 'interceptRawEvent' method of the EventInterceptor.", event, this, error);
                }
            }
        }

        return interceptedEvent;
    }
    /**
     * This method executes all the EventInterceptors and returns the event updated by the interceptors.
     *
     * @param event
     * @param container
     * @private
     */
    private async executeEventInterceptors(event: Event<any>, container: DependencyContainer): Promise<Event<any>> {
        // Execute all the event interceptors
        let interceptedEvent = event;

        // Check first if there are any EventInterceptor
        if (container.isRegistered(ServiceDefinitionTagEnum.EventInterceptor, true)) {
            const interceptors: any[] = container.resolveAll(ServiceDefinitionTagEnum.EventInterceptor);

            for (const interceptor of interceptors) {
                // We don't have a guarantee that the event interceptors will implement the Interface, even though we specify it should.
                // So, we have to verify that the method exists, and if it doesn't we throw
                if (typeof interceptor.interceptEvent === "undefined") {
                    throw new EventInterceptionExecutionError("The Event Interceptor doesn't have the 'interceptEvent' method. EventInterceptors should implement the EventInterceptor interface.", event, this);
                }

                try {
                    // https://stackoverflow.com/a/27760489/684101
                    interceptedEvent = await Promise.resolve((interceptor as EventInterceptorInterface).interceptEvent(interceptedEvent));
                } catch (error) {
                    throw new EventInterceptionExecutionError("There was an exception thrown while executing the 'interceptRawEvent' method of the EventInterceptor.", event, this, error);
                }
            }
        }

        return interceptedEvent;
    }

    /**
     * This method executes all the response interceptors and returns the response updated by the interceptors.
     *
     * @param response
     * @param request
     * @param container
     * @private
     */
    private async executeResponseInterceptors(response: Response, request: Request, container: DependencyContainer): Promise<Response> {
        // Execute all the request interceptors
        let interceptedResponse = response;

        // Check first if there are any RequestInterceptors
        if (container.isRegistered(ServiceDefinitionTagEnum.ResponseInterceptor, true)) {
            const interceptors: any[] = container.resolveAll(ServiceDefinitionTagEnum.ResponseInterceptor);

            for (const interceptor of interceptors) {
                // We don't have a guarantee that the request interceptors will implement the Interface, even though we specify it should.
                // So, we have to verify that the method exists, and if it doesn't we throw
                if (typeof interceptor.interceptResponse === "undefined") {
                    throw new ResponseInterceptionExecutionError("The Response Interceptor doesn't have the 'interceptResponse' method. ResponseInterceptors should implement the ResponseInterceptor interface.", request, response, interceptor)
                }

                try {
                    // https://stackoverflow.com/a/27760489/684101
                    interceptedResponse = await Promise.resolve((interceptor as ResponseInterceptorInterface).interceptResponse(interceptedResponse, request));
                } catch (e) {
                    throw new ResponseInterceptionExecutionError("There was an exception thrown while executing the 'interceptResponse' method of the ResponseInterceptor.", request, response, interceptor, e);
                }
            }
        }

        return interceptedResponse;
    }

    /**
     * This method executes all the error response interceptors and returns the response updated by the interceptors.
     *
     * @param error
     * @param request
     * @param container
     * @private
     */
    private async executeErrorResponseInterceptors(error: Error, request: Request, container: DependencyContainer): Promise<Response> {
        // Execute all the request interceptors
        let interceptedErrorResponse = new Response();
        interceptedErrorResponse.request = request;

        interceptedErrorResponse.body = {
            name: error.name,
            message: error.message,
        };

        if (error instanceof HttpError) {
            const httpError: HttpError = error as HttpError;

            interceptedErrorResponse.status = httpError.httpStatus

            if(httpError.errors) {
                interceptedErrorResponse.body.errors = httpError.errors
            }
        } else {
            interceptedErrorResponse.status = 500;
        }

        // Check first if there are any RequestInterceptors
        if (container.isRegistered(ServiceDefinitionTagEnum.ErrorResponseInterceptor, true)) {
            const interceptors: any[] = container.resolveAll(ServiceDefinitionTagEnum.ErrorResponseInterceptor);

            for (const interceptor of interceptors) {
                // We don't have a guarantee that the request interceptors will implement the Interface, even though we specify it should.
                // So, we have to verify that the method exists, and if it doesn't we throw
                if (typeof interceptor.interceptError === "undefined") {
                    throw new ErrorResponseInterceptionExecutionError("The Error Response Interceptor doesn't have the 'interceptError' method. ErrorResponseInterceptors should implement the ErrorResponseInterceptor interface.", error, request, interceptor)
                }

                try {
                    // https://stackoverflow.com/a/27760489/684101
                    interceptedErrorResponse = await Promise.resolve((interceptor as ErrorResponseInterceptorInterface).interceptError(error, request, interceptedErrorResponse));
                } catch (e) {
                    throw new ErrorResponseInterceptionExecutionError("There was an exception thrown while executing the 'interceptError' method of the ErrorResponseInterceptors", error, request, interceptor, e)
                }
            }
        }

        return interceptedErrorResponse;
    }

    /**
     * This method can be used to test if a raw event is supported or not.
     * @param rawEvent
     */
    isRawEventSupported(rawEvent: object): boolean {
        // Start by creating a child container and we will use this container to instantiate the dependencies for this event
        const childContainer = this.container.createChildContainer();

        const eventTransformer: EventTransformer = childContainer.resolve(EventTransformer);

        return eventTransformer.isSupported(rawEvent);
    }

    /**
     *  This method takes the raw Event, transforms it into an Event object and then dispatches it to the Event Listeners
     *
     * @param rawEvent
     */
    public async handleRawEvent(rawEvent: object): Promise<void> {
        const tracingManager: TracingManagerInterface = this.container.resolve("TracingManagerInterface");
        tracingManager.startTracing();
        this.initializationSpan.trace = tracingManager.trace!;
        tracingManager.addSpan(this.initializationSpan);
        this.initializationSpan.end();

        const eventSpan = tracingManager.startSpan(SpanKeynameEnum.EventExecution);

        const interceptedRawEvent = await this.executeRawEventInterceptors(rawEvent);

        const eventTransformer: EventTransformer = this.container.resolve(EventTransformer);

        // Transform the raw event into an object
        let events: Event<any>[] = eventTransformer.transform(interceptedRawEvent);

        const promises: Promise<void>[] = [];
        for(let event of events) {
            promises.push(this.handleParsedEvent(event));
        }
        await Promise.allSettled(promises);

        eventSpan.end();
        tracingManager.endTrace();
    }

    /**
     *  This method takes the parsed Event, transforms it into an Event object and then dispatches it to the Event Listeners
     *
     * @param rawEvent
     */
    private async handleParsedEvent(parsedEvent: Event<any>) {
        // Start by creating a child container and we will use this container to instantiate the dependencies for this event
        const childContainer = this.container.createChildContainer();

        const eventDispatcher: EventDispatcher = childContainer.resolve(EventDispatcher);

        parsedEvent = await this.executeEventInterceptors(parsedEvent, childContainer);

        // Dispatch the Event to the EventListeners
        await eventDispatcher.dispatch(parsedEvent);
    }

    /**
     * This method receives a requestInterface, calls the router to execute the request and returns the response. This method
     * calls all the interceptors. This should be the only point with the outside world when dealing with requests.
     *
     * @param requestInterface
     */
    public async handleRequest(requestInterface: RequestInterface): Promise<Response> {
        // Setup the router
        this.setupRouter();

        const request = new Request(requestInterface);

        return new Promise(async (resolve) => {
            // Check for the router to not be undefined.
            if (this.router === undefined) {
                throw new RequestHandlingError("The Router is undefined", request, this);
            }

            // Start by creating a child container and we will use this container to instantiate the dependencies for this request
            const childContainer = this.container.createChildContainer();

            const tracingManager: TracingManagerInterface = childContainer.resolve("TracingManagerInterface");
            tracingManager.startTracing();
            tracingManager.addSpan(this.initializationSpan);
            this.initializationSpan.end();

            const requestSpan = tracingManager.startSpan(SpanKeynameEnum.RequestExecution);

            try {
                const interceptedRequest = await this.executeRequestInterceptors(request, childContainer);

                const response = await this.router.execute(interceptedRequest, childContainer);

                // Execute all the response interceptors
                const interceptedResponse = await this.executeResponseInterceptors(response, request, childContainer);

                requestSpan.end();
                tracingManager.endTrace();

                return resolve(interceptedResponse);
            } catch (error) {
                // Transform the error into a response object
                const errorResponse = await this.executeErrorResponseInterceptors(error, request, childContainer);

                // Execute all the response interceptors
                const interceptedResponse = await this.executeResponseInterceptors(errorResponse, request, childContainer);

                requestSpan.end();
                tracingManager.endTrace();

                return resolve(interceptedResponse);
            }
        })
    }

    /**
     * This method loops through the all the classes decorated with @controller, loops through all the methods decorated
     * with @route and builds the dependency tree of all the routes.
     *
     * @private
     */
    private setupRouter() {
        if(this.router) {
            return;
        }
        this.router = this.container.resolve(Router);

        // Init the controllers
        controllerRegistry.forEach(controller => {
            if (this.router === undefined) {
                throw new KernelInitializationError("The Router is undefined");
            }

            if (controller.hasOwnProperty("__metadata__") === false) {
                return;
            }

            let basePath: string = controller.__metadata__?.controller?.basePath;

            if (basePath.endsWith("/")) {
                basePath = basePath.slice(0, basePath.length - 1);
            }

            for (const methodPropertyKey in controller.__metadata__?.methods) {
                if (controller.__metadata__?.methods?.hasOwnProperty(methodPropertyKey) === false) {
                    continue;
                }

                const method = controller.__metadata__?.methods[methodPropertyKey];

                if (method.hasOwnProperty("route") === false) {
                    continue;
                }

                // Retrieve the "RouteMethodDecorator" object assigned by the @route decorator at .route
                const routeMethodDecorator: RouteMethodDecorator = method.route;

                // Build the Route object that will be used the the router to dispatch a request to
                // the appropriate controller method
                const route = new Route(controller.constructor, routeMethodDecorator.methodKeyname);
                route.methodArguments = method.arguments ?? [];
                route.context = mergeWith({}, controller.__metadata__?.controller?.__routeContext__ , method.__routeContext__);

                // Build the proper path
                let path = routeMethodDecorator.path;

                // Clean the path by removing the first and trailing slashes.
                if (path.startsWith("/")) {
                    path = path.slice(1, path.length);
                }

                if (path.endsWith("/")) {
                    path = path.slice(0, path.length - 1);
                }

                // Build the proper path
                const routePath = basePath + "/" + path;

                // Register the route
                this.router.register(routePath, routeMethodDecorator.httpMethod, route);
            }
        })
    }

    /**
     * This method loops through the service tag decorators defined in the taggedProviderRegistrationsRegistry and simply add
     * all the entry to the container.
     * @private
     */
    private registerServiceTags() {
        taggedProviderRegistrationsRegistry.forEach((taggedRegistrationType: TaggedRegistrationInterface) => {
            // Verify that if the constructor is moduleScoped, we only load it if its corresponding module is initialized.
            // If the module is not initialized, we do not load the tagged service.
            const moduleScopedRegistration = moduleScopedServicesRegistry[taggedRegistrationType.constructor];
            if (moduleScopedRegistration && this.instantiatedModules.hasOwnProperty(moduleScopedRegistration.moduleKeyname) === false) {
                return;
            }

            this.registerProviderRegistration(taggedRegistrationType.providerRegistration);
        })
    }
}

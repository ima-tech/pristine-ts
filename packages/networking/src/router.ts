import {DependencyContainer, singleton, inject} from "tsyringe";
import {HttpMethod} from "./enums/http-method.enum";
import {Request} from "./models/request";
import {Response} from "./models/response";
import {UrlUtil} from "./utils/url.util";
import {NotFoundHttpError} from "./errors/not-found.http-error";
import {RouterInterface} from "./interfaces/router.interface";
import {RouterNode} from "./nodes/router.node";
import {PathRouterNode} from "./nodes/path-router.node";
import {Route} from "./models/route";
import {MethodRouterNode} from "./nodes/method-router.node";
import {ForbiddenHttpError} from "./errors/forbidden.http-error";
import {ControllerMethodParameterDecoratorResolver} from "./resolvers/controller-method-parameter-decorator.resolver";
import Url from 'url-parse';
import {IdentityInterface} from "@pristine-ts/common";
import {AuthorizerManagerInterface} from "@pristine-ts/security";
import {AuthenticationManagerInterface} from "@pristine-ts/security";

@singleton()
export class Router implements RouterInterface {
    private root: RouterNode = new PathRouterNode("/");

    public constructor(private readonly controllerMethodParameterDecoratorResolver: ControllerMethodParameterDecoratorResolver,
                       @inject("AuthorizerManagerInterface") private readonly authorizerManager: AuthorizerManagerInterface,
                       @inject("AuthenticationManagerInterface") private readonly authenticationManager: AuthenticationManagerInterface) {
    }

    /**
     * This method registers a Route into the Route Tree maintained by the router.
     *
     * @param path
     * @param method
     * @param route
     */
    public register(path: string, method: HttpMethod | string, route: Route) {
        const splitPaths = UrlUtil.splitPath(path);

        this.root.add(splitPaths, method, route);
    }

    /**
     * This method receives a Request object, identifies the "path" its trying to hit, navigates the internally
     * maintained Route Tree, identifies the method in the controller that represents this "path", and calls the
     * method with the specified parameters.
     *
     * @param request
     * @param container
     */
    public execute(request: Request, container: DependencyContainer): Promise<Response> {
        return new Promise<Response>(async (resolve, reject) => {
            // Start by decomposing the URL. Set second parameter to true since we want to parse the query strings
            const url = new Url(request.url, false);

            // Split the path name
            const splitPath = UrlUtil.splitPath(url.pathname);

            // Retrieve the node to have information about the controller
            const methodNode: MethodRouterNode = this.root.find(splitPath, request.httpMethod) as MethodRouterNode;

            // If node doesn't exist, throw a 404 error
            if(methodNode === null) {
                return reject(new NotFoundHttpError("No route found for path: '" + url.pathname + "'."));
            }

            // Get the route parameters
            const routeParameters = (methodNode.parent as PathRouterNode).getRouteParameters(splitPath.reverse());

            // Instantiate the controller
            const controller: any = container.resolve(methodNode.route.controllerInstantiationToken);

            let identity: IdentityInterface | undefined;

            try {
                identity = await this.authenticationManager.authenticate(request, methodNode.route.context, container);
            } catch (e) {
                // Todo: check if the error is an UnauthorizedHttpError, else create one.
                return reject(e);
            }

            const resolvedMethodArguments: any[] = [];

            for (const methodArgument of methodNode.route.methodArguments) {
                resolvedMethodArguments.push(await this.controllerMethodParameterDecoratorResolver.resolve(methodArgument, request, routeParameters, identity));
            }

            // Call the controller with the resolved Method arguments
            try {

                if(await this.authorizerManager.isAuthorized(request, methodNode.route.context, container, identity) === false) {
                    return reject(new ForbiddenHttpError("You are not allowed to access this."));
                }

                const controllerResponse = controller[methodNode.route.methodPropertyKey].apply(controller, resolvedMethodArguments);

                // This resolves the promise if it's a promise or promisifies the value
                // https://stackoverflow.com/a/27760489/684101
                Promise.resolve(controllerResponse).then((response) => {
                    // If the response is already a Response object, return the response
                    if(response instanceof Response) {
                        return resolve(response);
                    }

                    // If the response is not a response object, but the method hasn't thrown an error, assume the
                    // returned response is directly the body. Also assume an Http Status code of 200.
                    const returnedResponse = new Response();
                    returnedResponse.status = 200;
                    returnedResponse.body = response;

                    return resolve(returnedResponse);
                })
            }
            catch (e) {
                return reject(e);
            }
        })
    }
}

import {RequestInterceptorInterface} from "../interfaces/request-interceptor.interface";
import {ResponseInterceptorInterface} from "../interfaces/response-interceptor.interface";
import {ErrorResponseInterceptorInterface} from "../interfaces/error-response-interceptor.interface";
import {injectable, inject} from "tsyringe";
import {LoggableError, moduleScoped, ServiceDefinitionTagEnum, tag} from "@pristine-ts/common";
import {CoreModuleKeyname} from "../core.module.keyname";
import {Request, Response} from "@pristine-ts/networking";
import {LogHandlerInterface} from "@pristine-ts/logging";

@injectable()
@moduleScoped(CoreModuleKeyname)
@tag(ServiceDefinitionTagEnum.RequestInterceptor)
@tag(ServiceDefinitionTagEnum.ResponseInterceptor)
@tag(ServiceDefinitionTagEnum.ErrorResponseInterceptor)
export class RequestLoggingInterceptor implements RequestInterceptorInterface, ResponseInterceptorInterface, ErrorResponseInterceptorInterface {
    constructor(@inject("LogHandlerInterface") private readonly logHandler: LogHandlerInterface) {
    }

    async interceptError(error: Error, request: Request, response: Response): Promise<Response> {
        let extra = {
            stack: error.stack,
            name: error.name,
        };

        if(error instanceof LoggableError) {
            extra = {
                ...error.extra,
                ...extra,
            };
        }

        this.logHandler.error(error.message, extra);

        return response;
    }

    async interceptRequest(request: Request): Promise<Request> {
        this.logHandler.info(request.url, request);
        return request;
    }

    async interceptResponse(response: Response, request: Request): Promise<Response> {
        this.logHandler.info(request.url, response);
        return response;
    }

}
import {injectable} from "tsyringe";
import {ControllerMethodParameterDecoratorResolverInterface} from "../interfaces/controller-method-parameter-decorator-resolver.interface";
import {Request} from "../models/request";

import {moduleScoped, ServiceDefinitionTagEnum, tag} from "@pristine-ts/common";
import {NetworkingModuleKeyname} from "../networking.module.keyname";
import Url from 'url-parse';

console.log(NetworkingModuleKeyname)
@moduleScoped(NetworkingModuleKeyname)
@tag(ServiceDefinitionTagEnum.MethodParameterDecoratorResolver)
@injectable()
export class QueryParameterDecoratorResolver implements ControllerMethodParameterDecoratorResolverInterface {
    resolve(methodArgument: any,
            request: Request,
            routeParameters: { [p: string]: string }):  Promise<any> {
        const url = new Url(request.url, true);

        return Promise.resolve(url.query[methodArgument.queryParameterName] ?? null);
    }

    supports(methodArgument: any): boolean {
        return methodArgument && methodArgument.hasOwnProperty("type") && methodArgument.type === "queryParameter";
    }
}

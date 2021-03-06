import "reflect-metadata"
import {injectable} from "tsyringe";
import {ControllerMethodParameterDecoratorResolverInterface} from "../interfaces/controller-method-parameter-decorator-resolver.interface";
import {Request} from "../models/request";
import {ServiceDefinitionTagEnum, tag} from "@pristine-ts/common";

@tag(ServiceDefinitionTagEnum.MethodParameterDecoratorResolver)
@injectable()
export class BodyParameterDecoratorResolver implements ControllerMethodParameterDecoratorResolverInterface {
    resolve(methodArgument: any,
            request: Request,
            routeParameters: { [p: string]: string }): Promise<any> {
        return Promise.resolve(request.body ?? null);
    }

    supports(methodArgument: any): boolean {
        return methodArgument && methodArgument.hasOwnProperty("type") && methodArgument.type === "body";
    }
}
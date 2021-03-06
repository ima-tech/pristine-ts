import {RequestInterface} from "@pristine-ts/common";
import {ApiGatewayRequest} from "../types/api-gateway-request.type";

export interface RequestMapperInterface {
    map(request: ApiGatewayRequest): RequestInterface;
}

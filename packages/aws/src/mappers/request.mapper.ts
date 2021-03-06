import {injectable, inject} from "tsyringe";

import {RequestInterface} from "@pristine-ts/common";
import {ApiGatewayRequest} from "../types/api-gateway-request.type";
import {RequestMapperFactory} from "../factories/request-mapper.factory";
import {LogHandlerInterface} from "@pristine-ts/logging";

@injectable()
export class RequestMapper {
    constructor(private readonly requestMapperFactory: RequestMapperFactory, @inject("LogHandlerInterface") private readonly loghandler: LogHandlerInterface) {
    }

    map(request: ApiGatewayRequest): RequestInterface {
        this.loghandler.debug("Mapping the request mapper.", {
            request,
        })

        const mappedRequest = this.requestMapperFactory.getRequestMapper(request).map(request);

        this.loghandler.debug("Mapped request", {
            mappedRequest,
        })

        return mappedRequest;
    }
}

import {RestApiRequestContextModel} from "./rest-api-request-context.model";

export class RestApiRequestModel {
    version: string;
    resource: string;
    path: string;
    httpMethod: string;
    requestContext: RestApiRequestContextModel;
    headers: {[key: string]: string};
    multiValueHeaders: {[key: string]: string[]};
    queryStringParameters?: {[key: string]: string};
    multiValueQueryStringParameters?: {[key: string]: string[]};
    pathParameters?: {[key: string]: string};
    stageVariables?: {[key: string]: string};
    body?: string;
    isBase64Encoded: boolean;
}

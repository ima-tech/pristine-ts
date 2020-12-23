/**
 * This enum defines the default service definition tags. A definition tag is an array of class that can be registered
 * in the container and can be retrieved as an array. For example, if you need to retrieve all the voters, this enum provides
 * an easy way for someone to register a Voter class by simply adding a VOTER token in the container. Then, you can
 * resolve all the voters by requesting the VOTER token and asking the container for a resolveAll.
 */
export enum ServiceDefinitionTagEnum {
    RequestInterceptor = "REQUEST_INTERCEPTOR",
    ResponseInterceptor = "RESPONSE_INTERCEPTOR",
    ErrorResponseInterceptor = "ERROR_RESPONSE_INTERCEPTOR",
    Voter = "VOTER"
}
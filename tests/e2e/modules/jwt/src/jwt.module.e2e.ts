import "reflect-metadata"
import {container} from "tsyringe";
import {Kernel} from "@pristine-ts/core";
import {controller, guards, HttpMethod, NetworkingModule, RequestInterface, route} from "@pristine-ts/networking";
import {ConfigurationDefinitionInterface, JwtModule, jwtPayload, JwtProtectedGuard} from "@pristine-ts/jwt";
import {CoreModule} from "@pristine-ts/core";
import {JWTKeys} from "./jwt.keys";

describe("JWT Module instantiation in the Kernel", () => {

    beforeEach(async () => {
        // Very import to clear the instances in between executions.
        container.clearInstances();
    })

    @guards(JwtProtectedGuard)
    @controller("/api/2.0/jwt")
    class JwtTestController {
        @route(HttpMethod.Get, "/services")
        public route(@jwtPayload() jwtPayload) {
            return jwtPayload;
        }
    }

    it("should properly route a request, pass the decoded jwtPayload when a controller method has the @jwtPayload decorator, and return a successful response when the JWT is valid.", async () => {
        const jwtConfiguration: ConfigurationDefinitionInterface = {
            algorithm: "RS256",
            publicKey: JWTKeys.RS256.withoutPassphrase.public,
        }

        const kernel = new Kernel();
        await kernel.init({
            keyname: "jwt.test",
            importServices: [
                JwtTestController,
            ],
            importModules: [CoreModule, NetworkingModule, JwtModule],
            providerRegistrations: []
        }, [{
            moduleKeyname: JwtModule.keyname,
            configuration: jwtConfiguration,
        }]);

        const request: RequestInterface = {
            httpMethod: HttpMethod.Get,
            url: "http://localhost:8080/api/2.0/jwt/services",
            headers: {
                "Authorization": "Bearer " + JWTKeys.token.valid,
            }
        };

        const response = await kernel.handleRequest(request);

        expect(response.status).toBe(200);
        expect(response.body).toStrictEqual({
            "sub": "1234567890",
            "name": "Etienne Noel",
            "iat": 1516239022
        })
    })

    it("should throw an error when the configuration is not defined properly", () => {

    })

    it("should return a forbidden exception when the JWT is invalid", async () => {
        const jwtConfiguration: ConfigurationDefinitionInterface = {
            algorithm: "RS256",
            publicKey: JWTKeys.RS256.withoutPassphrase.public,
        }

        const kernel = new Kernel();
        await kernel.init({
            keyname: "jwt.test",
            importServices: [
                JwtTestController,
            ],
            importModules: [CoreModule, NetworkingModule, JwtModule],
            providerRegistrations: []
        }, [{
            moduleKeyname: JwtModule.keyname,
            configuration: jwtConfiguration,
        }]);

        const request: RequestInterface = {
            httpMethod: HttpMethod.Get,
            url: "http://localhost:8080/api/2.0/jwt/services",
            headers: {
                "Authorization": "Bearer dfsadfdsafdsfdsafds",
            }
        };

        const response = await kernel.handleRequest(request);

        expect(response.status).toBe(403);
    })
})
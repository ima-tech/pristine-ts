import "reflect-metadata"
import {createServer} from "http";
import {createServer as createServerHttps, globalAgent} from "https";
import {HttpClient, ResponseTypeEnum} from "@pristine-ts/http";
import {HttpMethod} from "@pristine-ts/common";
import {readFileSync} from "fs";

describe("Http Client", () => {

    const runTest = async (server, protocolName) => {

        describe(`${protocolName} protocol`, () => {
            const host = 'localhost';
            const port = 0;

            server.on("request", (req, res) => {
                let data = '';

                req.on('data', chunk => {
                    data += chunk;
                });

                req.on('end', () => {
                    res.writeHead(200);
                    const responseBody = {
                        headers: req.headers,
                        method: req.method,
                        body: data,
                    };

                    res.write(JSON.stringify(responseBody))
                    res.end();
                });

            })

            it("should make the request with the '" + protocolName + "' protocol", async () => {
                await new Promise<void>(resolve => {
                    server.listen(port, host, async () => {
                        // Make an HTTP call using the httpClient
                        const httpClient = new HttpClient(ResponseTypeEnum.Raw)
                        const requestBody = JSON.stringify({
                            keyname: "Value",
                        });
                        const response = await httpClient.request({
                            // @ts-ignore
                            url: `${protocolName}://localhost:` + server.address()!.port,
                            httpMethod: HttpMethod.Put,
                            headers: {
                                "Content-Type": "application/json",
                                "X-Token": "AuthorizationToken",
                            },
                            body: requestBody,
                        });

                        expect(response.status).toBe(200)

                        const parsedBody = JSON.parse(response.body);

                        expect(parsedBody.method).toBe(HttpMethod.Put);
                        expect(parsedBody.body).toBe(requestBody);
                        expect(parsedBody.headers["content-type"]).toBe("application/json");
                        expect(parsedBody.headers["x-token"]).toBe("AuthorizationToken");

                        server.close();
                        return resolve();
                    });
                })

                expect.assertions(5)
            })

            it("should return a JSON response type", async () => {
                await new Promise<void>(resolve => {
                    server.listen(port, host, async () => {
                        // Make an HTTP call using the httpClient
                        const httpClient = new HttpClient(ResponseTypeEnum.Json)
                        const requestBody = JSON.stringify({
                            keyname: "Value",
                        });
                        const response = await httpClient.request({
                            // @ts-ignore
                            url: `${protocolName}://localhost:` + server.address()!.port,
                            httpMethod: HttpMethod.Put,
                            headers: {
                                "Content-Type": "application/json",
                                "X-Token": "AuthorizationToken",
                            },
                            body: requestBody,
                        });

                        expect(response.status).toBe(200)

                        const parsedBody = response.body;

                        expect(parsedBody.method).toBe(HttpMethod.Put);
                        expect(JSON.parse(parsedBody.body).keyname).toBe("Value");
                        expect(parsedBody.headers["content-type"]).toBe("application/json");
                        expect(parsedBody.headers["x-token"]).toBe("AuthorizationToken");

                        server.close();
                        return resolve();
                    });
                })

                expect.assertions(5)
            })

        })

    }

    runTest(createServer(), 'http');

    // Https Tests
    globalAgent.options.rejectUnauthorized = false
    runTest(createServerHttps({
        key: readFileSync(__dirname + '/../files/localhost.key'),
        cert: readFileSync(__dirname + '/../files/localhost.crt'),
        rejectUnauthorized: false,
    }), 'https');

})
import "reflect-metadata"
import {container} from "tsyringe";
import {Kernel} from "@pristine-ts/core";
import {controller, guards, HttpMethod, NetworkingModule, RequestInterface, route} from "@pristine-ts/networking";
import {CoreModule} from "@pristine-ts/core";
import {LoggingModule, LogHandler, ConfigurationDefinitionInterface} from "@pristine-ts/logging";


// @ts-ignore
global.console = {
    info: jest.fn(),
    debug: jest.fn(),
    error: jest.fn()
}

describe("Logging Module instantiation in the Kernel", () => {

    beforeEach(async () => {
        // Very import to clear the instances in between executions.
        container.clearInstances();
    })

    it("should log properly", async () => {
        const loggingConfiguration: ConfigurationDefinitionInterface = {
            numberOfStackedLogs: 10,
            logSeverityLevelConfiguration: 0,
            logDebugDepthConfiguration: 10,
            logInfoDepthConfiguration: 10,
            logWarningDepthConfiguration: 10,
            logErrorDepthConfiguration: 10,
            logCriticalDepthConfiguration: 10,
        }
        const kernel = new Kernel();
        await kernel.init({
            keyname: "logging.test",
            importModules: [CoreModule, NetworkingModule, LoggingModule],
            importServices: [],
            providerRegistrations: []
        }, [{
            moduleKeyname: LoggingModule.keyname,
            configuration: loggingConfiguration,
        }]);

        const logHandler: LogHandler = await kernel.container.resolve(LogHandler);

        logHandler.info("Allo", {al:{bob:12}});

        await new Promise(res => setTimeout(res, 1000));

        expect(global.console.log).toHaveBeenCalledWith("Allo - Extra: { al: { bob: 12 } }");

    })

})
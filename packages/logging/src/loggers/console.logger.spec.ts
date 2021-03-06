import "reflect-metadata"
import {ConsoleLogger} from "./console.logger";
import {SeverityEnum} from "../enums/severity.enum";
import {LogModel} from "../models/log.model";
import {OutputModeEnum} from "../enums/output-mode.enum";


describe("Console writer", () => {

    beforeEach(async () => {
        // @ts-ignore
        global.console = {
            info: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
            error: jest.fn()
        }

    })

    it("should log if configuration level is info and severity is higher", async () => {
        const consoleWriter = new ConsoleLogger(
            0,
            SeverityEnum.Info,
            3,
            3,
            3,
            3,
            3,
            true,
            OutputModeEnum.Json
        );

        const logInfo = new LogModel();
        logInfo.message = "Log info";
        logInfo.severity = SeverityEnum.Info;
        logInfo.extra = {
            extra: "extra 1"
        };
        consoleWriter.readableStream.push(logInfo);

        const logDebug = new LogModel();
        logDebug.message = "Log debug";
        logDebug.severity = SeverityEnum.Debug;
        logDebug.extra = {
            extra: "extra 1"
        };
        consoleWriter.readableStream.push(logDebug);

        const logWarning = new LogModel();
        logWarning.message = "Log warning";
        logWarning.severity = SeverityEnum.Warning;
        logWarning.extra = {
            extra: "extra 1"
        };
        consoleWriter.readableStream.push(logWarning);

        const logError = new LogModel();
        logError.message = "Log error";
        logError.severity = SeverityEnum.Error;
        logError.extra = {
            extra: "extra 1"
        };
        consoleWriter.readableStream.push(logError);

        const logCritical = new LogModel();
        logCritical.message = "Log critical";
        logCritical.severity = SeverityEnum.Critical;
        logCritical.extra = {
            extra: "extra 1"
        };
        consoleWriter.readableStream.push(logCritical);

        await new Promise(res => setTimeout(res, 1000));

        expect(global.console.debug).not.toHaveBeenCalledWith(JSON.stringify(logDebug));
        expect(global.console.info).toHaveBeenCalledWith(JSON.stringify(logInfo));
        expect(global.console.warn).toHaveBeenCalledWith(JSON.stringify(logWarning));
        expect(global.console.error).toHaveBeenCalledWith(JSON.stringify(logError));
        expect(global.console.error).toHaveBeenCalledWith(JSON.stringify(logCritical));
    });

    it("should log if configuration level is debug and severity is higher", async () => {
        const consoleWriter = new ConsoleLogger(
            0,
            SeverityEnum.Debug,
            3,
            3,
            3,
            3,
            3,
            true,
            OutputModeEnum.Json
        );

        const logInfo = new LogModel();
        logInfo.message = "Log info";
        logInfo.severity = SeverityEnum.Info;
        logInfo.extra = {
            extra: "extra 1"
        };
        consoleWriter.readableStream.push(logInfo);

        const logDebug = new LogModel();
        logDebug.message = "Log debug";
        logDebug.severity = SeverityEnum.Debug;
        logDebug.extra = {
            extra: "extra 1"
        };
        consoleWriter.readableStream.push(logDebug);

        const logWarning = new LogModel();
        logWarning.message = "Log warning";
        logWarning.severity = SeverityEnum.Warning;
        logWarning.extra = {
            extra: "extra 1"
        };
        consoleWriter.readableStream.push(logWarning);

        const logError = new LogModel();
        logError.message = "Log error";
        logError.severity = SeverityEnum.Error;
        logError.extra = {
            extra: "extra 1"
        };
        consoleWriter.readableStream.push(logError);

        const logCritical = new LogModel();
        logCritical.message = "Log critical";
        logCritical.severity = SeverityEnum.Critical;
        logCritical.extra = {
            extra: "extra 1"
        };
        consoleWriter.readableStream.push(logCritical);

        await new Promise(res => setTimeout(res, 1000));

        expect(global.console.info).toHaveBeenCalledWith(JSON.stringify(logInfo));
        expect(global.console.debug).toHaveBeenCalledWith(JSON.stringify(logDebug));
        expect(global.console.warn).toHaveBeenCalledWith(JSON.stringify(logWarning));
        expect(global.console.error).toHaveBeenCalledWith(JSON.stringify(logError));
        expect(global.console.error).toHaveBeenCalledWith(JSON.stringify(logCritical));
    });

    it("should log if configuration level is warning and severity is higher", async () => {
        const consoleWriter = new ConsoleLogger(
            0,
            SeverityEnum.Warning,
            3,
            3,
            3,
            3,
            3,
            true,
            OutputModeEnum.Json
        );

        const logInfo = new LogModel();
        logInfo.message = "Log info";
        logInfo.severity = SeverityEnum.Info;
        logInfo.extra = {
            extra: "extra 1"
        };
        consoleWriter.readableStream.push(logInfo);

        const logDebug = new LogModel();
        logDebug.message = "Log debug";
        logDebug.severity = SeverityEnum.Debug;
        logDebug.extra = {
            extra: "extra 1"
        };
        consoleWriter.readableStream.push(logDebug);

        const logWarning = new LogModel();
        logWarning.message = "Log warning";
        logWarning.severity = SeverityEnum.Warning;
        logWarning.extra = {
            extra: "extra 1"
        };
        consoleWriter.readableStream.push(logWarning);

        const logError = new LogModel();
        logError.message = "Log error";
        logError.severity = SeverityEnum.Error;
        logError.extra = {
            extra: "extra 1"
        };
        consoleWriter.readableStream.push(logError);

        const logCritical = new LogModel();
        logCritical.message = "Log critical";
        logCritical.severity = SeverityEnum.Critical;
        logCritical.extra = {
            extra: "extra 1"
        };
        consoleWriter.readableStream.push(logCritical);

        await new Promise(res => setTimeout(res, 1000));

        expect(global.console.info).not.toHaveBeenCalledWith(JSON.stringify(logInfo));
        expect(global.console.debug).not.toHaveBeenCalledWith(JSON.stringify(logDebug));
        expect(global.console.warn).toHaveBeenCalledWith(JSON.stringify(logWarning));
        expect(global.console.error).toHaveBeenCalledWith(JSON.stringify(logError));
        expect(global.console.error).toHaveBeenCalledWith(JSON.stringify(logCritical));
    });

    it("should log if configuration level is error and severity is higher", async () => {
        const consoleWriter = new ConsoleLogger(
            0,
            SeverityEnum.Error,
            3,
            3,
            3,
            3,
            3,
            true,
            OutputModeEnum.Json
        );

        const logInfo = new LogModel();
        logInfo.message = "Log info";
        logInfo.severity = SeverityEnum.Info;
        logInfo.extra = {
            extra: "extra 1"
        };
        consoleWriter.readableStream.push(logInfo);

        const logDebug = new LogModel();
        logDebug.message = "Log debug";
        logDebug.severity = SeverityEnum.Debug;
        logDebug.extra = {
            extra: "extra 1"
        };
        consoleWriter.readableStream.push(logDebug);

        const logWarning = new LogModel();
        logWarning.message = "Log warning";
        logWarning.severity = SeverityEnum.Warning;
        logWarning.extra = {
            extra: "extra 1"
        };
        consoleWriter.readableStream.push(logWarning);

        const logError = new LogModel();
        logError.message = "Log error";
        logError.severity = SeverityEnum.Error;
        logError.extra = {
            extra: "extra 1"
        };
        consoleWriter.readableStream.push(logError);

        const logCritical = new LogModel();
        logCritical.message = "Log critical";
        logCritical.severity = SeverityEnum.Critical;
        logCritical.extra = {
            extra: "extra 1"
        };
        consoleWriter.readableStream.push(logCritical);

        await new Promise(res => setTimeout(res, 1000));

        expect(global.console.info).not.toHaveBeenCalledWith(JSON.stringify(logInfo));
        expect(global.console.debug).not.toHaveBeenCalledWith(JSON.stringify(logDebug));
        expect(global.console.warn).not.toHaveBeenCalledWith(JSON.stringify(logWarning));
        expect(global.console.error).toHaveBeenCalledWith(JSON.stringify(logError));
        expect(global.console.error).toHaveBeenCalledWith(JSON.stringify(logCritical));
    });


    it("should log if configuration level is critical and severity is higher", async () => {
        const consoleWriter = new ConsoleLogger(
            0,
            SeverityEnum.Critical,
            3,
            3,
            3,
            3,
            3,
            true,
            OutputModeEnum.Json
        );

        const logInfo = new LogModel();
        logInfo.message = "Log info";
        logInfo.severity = SeverityEnum.Info;
        logInfo.extra = {
            extra: "extra 1"
        };
        consoleWriter.readableStream.push(logInfo);

        const logDebug = new LogModel();
        logDebug.message = "Log debug";
        logDebug.severity = SeverityEnum.Debug;
        logDebug.extra = {
            extra: "extra 1"
        };
        consoleWriter.readableStream.push(logDebug);

        const logWarning = new LogModel();
        logWarning.message = "Log warning";
        logWarning.severity = SeverityEnum.Warning;
        logWarning.extra = {
            extra: "extra 1"
        };
        consoleWriter.readableStream.push(logWarning);

        const logError = new LogModel();
        logError.message = "Log error";
        logError.severity = SeverityEnum.Error;
        logError.extra = {
            extra: "extra 1"
        };
        consoleWriter.readableStream.push(logError);

        const logCritical = new LogModel();
        logCritical.message = "Log critical";
        logCritical.severity = SeverityEnum.Critical;
        logCritical.extra = {
            extra: "extra 1"
        };
        consoleWriter.readableStream.push(logCritical);

        await new Promise(res => setTimeout(res, 1000));

        expect(global.console.info).not.toHaveBeenCalledWith(JSON.stringify(logInfo));
        expect(global.console.debug).not.toHaveBeenCalledWith(JSON.stringify(logDebug));
        expect(global.console.warn).not.toHaveBeenCalledWith(JSON.stringify(logWarning));
        expect(global.console.error).not.toHaveBeenCalledWith(JSON.stringify(logError));
        expect(global.console.error).toHaveBeenCalledWith(JSON.stringify(logCritical));
    });

    it("should log stacked logs if log something", async () => {
        const consoleWriter = new ConsoleLogger(
            5,
            SeverityEnum.Critical,
            3,
            3,
            3,
            3,
            3,
            true,
            OutputModeEnum.Json
        );

        const logInfo = new LogModel();
        logInfo.message = "Log info";
        logInfo.severity = SeverityEnum.Info;
        logInfo.extra = {
            extra: "extra 1"
        };
        consoleWriter.readableStream.push(logInfo);

        const logDebug = new LogModel();
        logDebug.message = "Log debug";
        logDebug.severity = SeverityEnum.Debug;
        logDebug.extra = {
            extra: "extra 1"
        };
        consoleWriter.readableStream.push(logDebug);

        const logWarning = new LogModel();
        logWarning.message = "Log warning";
        logWarning.severity = SeverityEnum.Warning;
        logWarning.extra = {
            extra: "extra 1"
        };
        consoleWriter.readableStream.push(logWarning);

        const logError = new LogModel();
        logError.message = "Log error";
        logError.severity = SeverityEnum.Error;
        logError.extra = {
            extra: "extra 1"
        };
        consoleWriter.readableStream.push(logError);

        const logCritical = new LogModel();
        logCritical.message = "Log critical";
        logCritical.severity = SeverityEnum.Critical;
        logCritical.extra = {
            extra: "extra 1"
        };
        consoleWriter.readableStream.push(logCritical);

        await new Promise(res => setTimeout(res, 1000));

        expect(global.console.info).toHaveBeenCalledWith(JSON.stringify(logInfo));
        expect(global.console.debug).toHaveBeenCalledWith(JSON.stringify(logDebug));
        expect(global.console.warn).toHaveBeenCalledWith(JSON.stringify(logWarning));
        expect(global.console.error).toHaveBeenCalledWith(JSON.stringify(logError));
        expect(global.console.error).toHaveBeenCalledWith(JSON.stringify(logCritical));
    });

});

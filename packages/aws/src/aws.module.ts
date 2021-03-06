import {ModuleInterface} from "@pristine-ts/common";
import {dynamicTableNameRegistry} from "./decorators/dynamic-table-name.decorator";
import {DynamoDbTable} from "@awslabs-community-fork/dynamodb-data-mapper";
import {LoggingModule, LogHandlerInterface} from "@pristine-ts/logging";
import {DependencyContainer} from "tsyringe";
import {AwsModuleKeyname} from "./aws.module.keyname";
import {EnvironmentVariableResolver} from "@pristine-ts/configuration";

export * from "./clients/clients";
export * from "./decorators/decorators";
export * from "./enums/enums";
export * from "./errors/errors";
export * from "./event-parsers/event-parsers";
export * from "./event-payloads/event-payloads";
export * from "./factories/factories";
export * from "./interfaces/interfaces";
export * from "./mappers/mappers";
export * from "./models/models";
export * from "./resolvers/resolvers";
export * from "./types/types";

export * from "./aws.module.keyname";

export const AwsModule: ModuleInterface = {
    keyname: AwsModuleKeyname,
    configurationDefinitions: [
        {
            parameterName: AwsModuleKeyname + ".region",
            isRequired: false,
            defaultValue: "us-east-1",
            defaultResolvers: [
                new EnvironmentVariableResolver("AWS_REGION"),
            ]
        }
    ],
    importModules: [LoggingModule],
    providerRegistrations: [
    ],
    async afterInit(container): Promise<void> {
        await registerDynamicTableNames(container);
    }
}

const registerDynamicTableNames = async (container: DependencyContainer) => {
    for (const dynamicTableName of dynamicTableNameRegistry) {
        if(container.isRegistered(dynamicTableName.tokenName) === false) {
            const logHandler: LogHandlerInterface = container.resolve("LogHandlerInterface");
            try {
                logHandler.debug("The table token name was not registered, trying to load default.", {tokenName: dynamicTableName.tokenName})
                const value = await new EnvironmentVariableResolver(dynamicTableName.tokenName).resolve();
                container.registerInstance(dynamicTableName.tokenName, value);
                logHandler.debug("Successfully registered table name.", {tokenName: dynamicTableName.tokenName, value})
            } catch (e) {
                logHandler.warning("The table token name does not exist in the container.", {tokenName: dynamicTableName.tokenName});
                continue;
            }
        }
        try {
            dynamicTableName.classConstructor.prototype[DynamoDbTable] = container.resolve(dynamicTableName.tokenName);
        } catch (error){
            const logHandler: LogHandlerInterface = container.resolve("LogHandlerInterface");
            logHandler.error("Error resolving the dynamic table token name", {error, tokenName: dynamicTableName.tokenName});
            continue;
        }
    }
}

import {ResolvedClassModel} from "./models/resolved-class.model";
import {CoreModule} from "../../../packages/core/src/core.module";
import {ModuleInterface} from "../../../packages/common/src/interfaces/module.interface";
import {InjectedClass} from "./models/injected-class.model";
import {Voter1Model} from "./models/voter1.model";
import {Voter2Model} from "./models/voter2.model";
import {TestController} from "./controllers/test.controller";
import {TestGuard} from "./guards/test.guard";

export const testModule: ModuleInterface = {
    keyname: "test",
    importServices: [TestController],
    importModules: [CoreModule],
    providerRegistrations: [
        {
            token: "voter",
            useToken: Voter1Model,
        }
    ]
}
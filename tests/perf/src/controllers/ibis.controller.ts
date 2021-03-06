import {singleton} from "tsyringe";
import {controller, HttpMethod, route, body, routeParameter} from "@pristine-ts/networking";

@controller("/api/1.0")
@singleton()
export class IbisController {
    constructor() {
    }

    @route(HttpMethod.Get, "/ibiss")
    public list() {
    }

    @route(HttpMethod.Post, "/ibiss")
    public add(@body() body: any) {
    }

    @route(HttpMethod.Get, "/ibiss/:id")
    public get(@routeParameter("id") id: string) {
    }

    @route(HttpMethod.Put, "/ibiss/:id")
    public update(@body() body: any, @routeParameter("id") id: string) {
    }

    @route(HttpMethod.Patch, "/ibiss/:id")
    public partialUpdate(@body() body: any, @routeParameter("id") id: string) {
    }

    @route(HttpMethod.Delete, "/ibiss/:id")
    public delete(@routeParameter("id") id: string) {
    }
}
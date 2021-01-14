import {singleton} from "tsyringe";
import {controller, HttpMethod, route, body, routeParameter} from "@pristine-ts/networking";

@controller("/api/1.0")
@singleton()
export class LeopardController {
    constructor() {
    }

    @route(HttpMethod.Get, "/leopards")
    public list() {
    }

    @route(HttpMethod.Post, "/leopards")
    public add(@body() body: any) {
    }

    @route(HttpMethod.Get, "/leopards/:id")
    public get(@routeParameter("id") id: string) {
    }

    @route(HttpMethod.Put, "/leopards/:id")
    public update(@body() body: any, @routeParameter("id") id: string) {
    }

    @route(HttpMethod.Patch, "/leopards/:id")
    public partialUpdate(@body() body: any, @routeParameter("id") id: string) {
    }

    @route(HttpMethod.Delete, "/leopards/:id")
    public delete(@routeParameter("id") id: string) {
    }
}
import {singleton} from "tsyringe";
import {controller, route, body, routeParameter} from "@pristine-ts/networking";
import {HttpMethod} from "@pristine-ts/common";

@controller("/api/1.0")
@singleton()
export class SalamanderController {
    constructor() {
    }

    @route(HttpMethod.Get, "/salamanders")
    public list() {
    }

    @route(HttpMethod.Post, "/salamanders")
    public add(@body() body: any) {
    }

    @route(HttpMethod.Get, "/salamanders/:id")
    public get(@routeParameter("id") id: string) {
    }

    @route(HttpMethod.Put, "/salamanders/:id")
    public update(@body() body: any, @routeParameter("id") id: string) {
    }

    @route(HttpMethod.Patch, "/salamanders/:id")
    public partialUpdate(@body() body: any, @routeParameter("id") id: string) {
    }

    @route(HttpMethod.Delete, "/salamanders/:id")
    public delete(@routeParameter("id") id: string) {
    }
}

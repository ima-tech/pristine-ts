import {singleton} from "tsyringe";
import {controller, HttpMethod, route, body, routeParameter} from "@pristine-ts/networking";

@controller("/api/1.0")
@singleton()
export class StingrayController {
    constructor() {
    }

    @route(HttpMethod.Get, "/stingrays")
    public list() {
    }

    @route(HttpMethod.Post, "/stingrays")
    public add(@body() body: any) {
    }

    @route(HttpMethod.Get, "/stingrays/:id")
    public get(@routeParameter("id") id: string) {
    }

    @route(HttpMethod.Put, "/stingrays/:id")
    public update(@body() body: any, @routeParameter("id") id: string) {
    }

    @route(HttpMethod.Patch, "/stingrays/:id")
    public partialUpdate(@body() body: any, @routeParameter("id") id: string) {
    }

    @route(HttpMethod.Delete, "/stingrays/:id")
    public delete(@routeParameter("id") id: string) {
    }
}
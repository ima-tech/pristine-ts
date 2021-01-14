import {singleton} from "tsyringe";
import {controller, HttpMethod, route, body, routeParameter} from "@pristine-ts/networking";

@controller("/api/1.0")
@singleton()
export class JaguarController {
    constructor() {
    }

    @route(HttpMethod.Get, "/jaguars")
    public list() {
    }

    @route(HttpMethod.Post, "/jaguars")
    public add(@body() body: any) {
    }

    @route(HttpMethod.Get, "/jaguars/:id")
    public get(@routeParameter("id") id: string) {
    }

    @route(HttpMethod.Put, "/jaguars/:id")
    public update(@body() body: any, @routeParameter("id") id: string) {
    }

    @route(HttpMethod.Patch, "/jaguars/:id")
    public partialUpdate(@body() body: any, @routeParameter("id") id: string) {
    }

    @route(HttpMethod.Delete, "/jaguars/:id")
    public delete(@routeParameter("id") id: string) {
    }
}
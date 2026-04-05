import { MapRouteFromBackend, TCreateRoute, TRouteBackend, TUpdateRoute } from "../adapters/Route.adapter"
import { Route } from "../models/Route"
import { axiosInstance } from "./axiosInstance"



export class RouteService {

    private static readonly RESOURCE_NAME = 'route' 

    static async CreateRoute( body : TCreateRoute) : Promise<Route> {
        const { data } = await axiosInstance.post(`/${this.RESOURCE_NAME}`, body )
        return MapRouteFromBackend(data?.message as TRouteBackend)
    }

    static async FindRouteByID( routeId : string ) : Promise<Route> {
        const { data } = await axiosInstance.get(`/${this.RESOURCE_NAME}/${routeId}`)
        return MapRouteFromBackend(data?.message as TRouteBackend)
    }

    static async FindAllRoute() : Promise<Route[]> {
        const { data } = await axiosInstance.get(`/${this.RESOURCE_NAME}`)
        if(data?.message === null) return []
        return (data?.message as TRouteBackend[]).map(( route => (
            MapRouteFromBackend( route )
        )))
    }

    static async UpdateRoute( uptRoute : TUpdateRoute) : Promise<Route> {
        const { data } = await axiosInstance.put(`/${this.RESOURCE_NAME}/${uptRoute._id}`, uptRoute)
        return MapRouteFromBackend( data?.message as TRouteBackend)
    }

    static async GetRoutesByUserId( userId : string) : Promise<Route[]>{
        const routes = await RouteService.FindAllRoute()
        return routes.reduce<Route[]>((call : Route[], route) => {
            if(route.routeLeader === userId || (route.team as string[]).includes(userId) ) {
                call.push(route)
            }
            return call
        }, [])
    }

    static async JoinRoute( inviteCode : string ) : Promise<Route> {
        const { data } = await axiosInstance.post(`/${this.RESOURCE_NAME}/join/${inviteCode}`)
        return MapRouteFromBackend(data?.message as TRouteBackend)
    }

    static async FinishRoute( routeId : string ) : Promise<string> {
        const { data } = await axiosInstance.patch(`/${this.RESOURCE_NAME}/${routeId}`)
        return data?.message
    }
}
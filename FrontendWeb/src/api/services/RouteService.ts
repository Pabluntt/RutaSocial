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

    static async DeleteRoute( routeId : string ) : Promise<void> {
        await axiosInstance.delete(`/${this.RESOURCE_NAME}/${routeId}`)
    }

    static async GetRoutesByUserId( userId : string) : Promise<Route[]>{
        const routes = await RouteService.FindAllRoute()
        return routes.reduce<Route[]>((call : Route[], route) => {
            if(route.routeLeader === userId || (route.team).includes(userId) ) {
                call.push(route)
            }
            return call
        }, [])
    }

    static async LeaveRoute( routeId : string ) : Promise<string> {
        const { data } = await axiosInstance.post(`/${this.RESOURCE_NAME}/leave/${routeId}`)
        return data?.message
    }

    static async JoinRoute( inviteCode : string ) : Promise<Route> {
        const { data } = await axiosInstance.post(`/${this.RESOURCE_NAME}/join/${inviteCode}`)
        return MapRouteFromBackend(data?.message as TRouteBackend)
    }

    static async FinishRoute( routeId : string ) : Promise<string> {
        const { data } = await axiosInstance.patch(`/${this.RESOURCE_NAME}/${routeId}`)
        return data?.message
    }

    static async StartRoute( routeId : string ) : Promise<Route> {
        const { data } = await axiosInstance.patch(`/${this.RESOURCE_NAME}/${routeId}/start`)
        return MapRouteFromBackend(data?.message as TRouteBackend)
    }

    static async FindByInstitutionId(institutionId: string): Promise<Route[]> {
        const { data } = await axiosInstance.get(`/${this.RESOURCE_NAME}/institution/${institutionId}`)
        if (data?.message === null) return []
        return (data?.message as TRouteBackend[]).map((route) =>
            MapRouteFromBackend(route)
        )
    }

    static async GetAdminUserRoutes(userId: string): Promise<Route[]> {
        const { data } = await axiosInstance.get(`/route/user/${userId}`)
        if (data?.message === null) return []
        return (data?.message as TRouteBackend[]).map((route) =>
            MapRouteFromBackend(route)
        )
    }

    static async DownloadRouteReport( routeId : string, routeTitle : string ) : Promise<void> {
        const response = await axiosInstance.get(`/${this.RESOURCE_NAME}/${routeId}/report`, {
            responseType: 'blob'
        })
        const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `informe_ruta_${routeTitle}.xlsx`
        document.body.appendChild(a)
        a.click()
        a.remove()
        window.URL.revokeObjectURL(url)
    }
}

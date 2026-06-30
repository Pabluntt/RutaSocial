import { useMutation, useQuery } from "@tanstack/react-query"
import { RouteService } from "../services/RouteService"
import { Route } from "../models/Route"
import { MapRouteToCreateRequest, MapRouteToUpdateRequest } from "../adapters/Route.adapter"




export function useCreateRoute() {
    return useMutation({
        mutationFn : ( route : Pick<Route, 'description' | 'title' | 'routeLeader'>) => (RouteService.CreateRoute(MapRouteToCreateRequest(route)))
    })
}

export function useRoutes( enabled ?: boolean )  {
    return useQuery({
        queryKey: ['routes'],
        queryFn: () => (RouteService.FindAllRoute()),
        enabled
    })
}

export function useRoute( routeId : string, enabled ?: boolean ) {
    return useQuery({
        queryKey : ['route', routeId],
        queryFn : () => (RouteService.FindRouteByID(routeId)),
        enabled
    })
}

export function useUpdateRoute() {
    return useMutation({
        mutationFn : ( route : Omit<Route, 'status' | 'invite_code'>) => (RouteService.UpdateRoute(MapRouteToUpdateRequest(route)))
    })
} 

export function useRoutesByUser(userId ?: string, enabled ?: boolean) {
    return useQuery({
        queryKey : ['routeByUserID', userId],
        queryFn : () => (RouteService.GetRoutesByUserId(userId!)),
        enabled  
    })
}

export function useAdminUserRoutes(userId: string, enabled?: boolean) {
    return useQuery({
        queryKey: ['adminUserRoutes', userId],
        queryFn: () => RouteService.GetAdminUserRoutes(userId),
        enabled: !!userId && enabled !== false,
    })
}

export function useJoinRoute() {
    return useMutation({
        mutationFn : (inviteCode : string) => (RouteService.JoinRoute(inviteCode)) 
    })
}

export function useLeaveRoute() {
    return useMutation({
        mutationFn : (routeId : string) => (RouteService.LeaveRoute(routeId))
    })
}

export function useFinishRoute() {
    return useMutation({
        mutationFn : (routeId : string) => (RouteService.FinishRoute(routeId))
    })
}

export function useStartRoute() {
    return useMutation({
        mutationFn : (routeId : string) => (RouteService.StartRoute(routeId))
    })
}

export function useDeleteRoute() {
    return useMutation({
        mutationFn: (routeId: string) => RouteService.DeleteRoute(routeId),
    })
}


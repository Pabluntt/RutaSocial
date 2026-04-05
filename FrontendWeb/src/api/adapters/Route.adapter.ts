import { Route } from "../models/Route"



export type TRouteBackend = {
    _id : string 
    title : string 
    description : string 
    route_leader : string 
    invite_code : string 
    team : string[]
    status : string 
    date_created : string 
    date_finished : string
}

export type TCreateRoute = Pick<TRouteBackend, 
    'description' |
    'title' |
    'route_leader'
>

export type TUpdateRoute = Omit<TRouteBackend,
    'status' |
    'invite_code' |
    'date_created' |
    'date_finished'
>

export function MapRouteFromBackend( data : Partial<TRouteBackend> ) : Route {
    const route : Partial<Route> = {
        id : data._id,
        title : data.title,
        description : data.description,
        routeLeader : data.route_leader,
        inviteCode : data.invite_code,
        team : data.team,
        status : data.status,
        dateCreated : (data.date_created === undefined ? undefined : new Date(data.date_created)),
        dateFinished : (data.date_finished === undefined ? undefined : new Date(data.date_finished))
    }
    Object.entries(route).forEach(( entry ) => {
        const [ key, value ]  =  entry
        if(value === undefined) {
            throw Error(`Missing required field: ${key}`)
        }
    })
    return route as Route
}

export function MapRouteToCreateRequest( data :
    Pick<Route,
        'description'  |
        'title' |
        'routeLeader'
    >) : TCreateRoute {
        return {
            title : data.title,
            description : data.description,
            route_leader : data.routeLeader
        }
}


export function MapRouteToUpdateRequest( data : 
    Omit<Route, 'status' | 'invite_code'>
) : TUpdateRoute {
    return {
        _id : data.id,
        title : data.title,
        description : data.description,
        route_leader : data.routeLeader,
        team : data.team
    }
}
import { RiskStatus } from "../../Enums/RiskStatus"
import { Risk } from "../models/Risk"


export type TRiskBackend = {
    _id : string 
    author_id : string 
    coords : number[]
    Status : RiskStatus
    date_register : string 
    description : string
}


export type TCreateRisk = Omit<TRiskBackend, 
    '_id' |
    'date_register'
>

export type TUpdateRisk = TRiskBackend


export function MapRiskFromBackend( data : Partial<TRiskBackend> ) : Risk {
    const risk : Partial<Risk> = {
        id : data._id,
        authorID : data.author_id,
        coords : data.coords,
        description : data.description,
        status : data.Status,
        createdAt : data.date_register === undefined ? undefined : new Date(data.date_register)
    }
    Object.entries(risk).forEach(( entry ) => {
        const [ key, value ] = entry 
        if(value === undefined) {
            throw Error(`Missing required filed: ${key}`)
        }
    })
    return risk as Risk
}


export function MapRiskToCreateRequest( data : 
    Omit<Risk,
        'id' |
        'createdAt'
    >) : TCreateRisk {
        return {
            description : data.description,
            author_id : data.authorID,
            Status : data.status,
            coords : data.coords
    }
}

export function MapRiskToUpdateRequest( data : Risk ) : TUpdateRisk {
    return {
        _id : data.id,
        description : data.description,
        Status : data.status,
        date_register : data.createdAt.toISOString(),
        coords : data.coords,
        author_id : data.authorID
    }
}
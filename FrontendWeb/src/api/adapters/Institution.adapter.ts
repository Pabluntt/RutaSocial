import { Institution } from "../models/Institution"


export type TInstitutionBackend = {
    _id : string 
    name : string 
    color : string
}


export function MapInstitutionFromBackend( data : Partial<TInstitutionBackend>) {
    const institution : Partial<Institution> = {
        id : data._id,
        name : data.name,
        color : data.color
    }
    
    Object.entries(institution).forEach(( entry ) => {
        const [ key, value ]  =  entry
        if(value === undefined) {
            throw Error(`Missing required field: ${key}`)
        }
    })
    return institution as Institution
}


export type HelpedPerson = {
    age : number
    gender : string 
    name : string 
    rut?: string
    personaID?: string
}


export interface HelpPoint {
    id : string 
    authorID : string
    routeID : string 
    coords : number[]
    dateRegister : Date 
    comment : string
    people : HelpedPerson[]
    peopleHelped? : HelpedPerson
    personaID? : string
    disabled : boolean
} 

export type HelpedPerson = {
    age : number
    gender : string 
    name : string 
}


export interface HelpPoint {
    id : string 
    authorID : string
    routeID : string 
    coords : number[]
    dateRegister : Date 
    peopleHelped : HelpedPerson
    disabled : boolean
} 
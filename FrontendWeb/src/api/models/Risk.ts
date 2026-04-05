import { RiskStatus } from "../../Enums/RiskStatus"


export interface Risk {
    id : string 
    description : string
    authorID : string 
    coords : number[]
    createdAt : Date
    status : RiskStatus
}


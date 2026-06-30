

export interface Route {
    id : string 
    title : string 
    description : string 
    routeLeader : string 
    routeLeaderName?: string
    inviteCode : string
    team : string[]
    status : string
    dateCreated : Date
    dateFinished?: Date
    institutionID?: string
}


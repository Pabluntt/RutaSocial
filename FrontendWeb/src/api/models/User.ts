
export interface IUser {
    id: string
    name: string
    phone: string
    email: string
    password: string
    institutionID : string
    role: string 
    completedRoutes : number 
    listRoutes : string[]
    dateRegister : Date
}
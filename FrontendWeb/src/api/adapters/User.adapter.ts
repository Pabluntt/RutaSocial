import { IUser } from "../models/User"



export type TUserBackend = {
    _id : string 
    name : string 
    email : string 
    password : string 
    phone : string 
    completed_routes : number 
    list_routes : string[]
    role : string 
    institutionID : string 
    date_register : string 
}


export type TLoginRequest = Pick<TUserBackend,
    'email' |
    'password'
>

export type TRegisterRequest = Pick<TUserBackend, 
    'email' |
    'password' |
    'phone' | 
    'institutionID' | 
    'name' |
    'role'
>

export type TUpdateUserRequest = Pick<TUserBackend,
    'name' |
    'phone' |
    'institutionID'
> | {
    newPassword ?: string
    currentPassword ?: string
    confirmNewPassword ?: string
}


export function MapUserFromBackend( data : Partial<TUserBackend>) : IUser {
    const user : Partial<IUser> = {
        id : data._id,
        name : data.name,
        phone : data.phone,
        email : data.email,
        institutionID : data.institutionID,
        role: data.role,
        completedRoutes : data.completed_routes,
        listRoutes : data.list_routes,
        dateRegister : data.date_register === undefined ? undefined : new Date(data.date_register)
    }

    for (const [key, value] of Object.entries(user)) {
        if (value === undefined) {
            throw new Error(`Missing required field: ${key}`);
        }
    }
    return user as IUser
}


export function MapUserToLoginRequest(data : Pick<IUser, 'email' | 'password'>) : TLoginRequest {
    return {
        email : data.email,
        password : data.password
    }
}

export function MapUserToCreateRequest( data : 
    Pick<IUser, 
        'email'         |
        'password'      |
        'phone'         | 
        'institutionID' | 
        'role'          |
        'name'>
    ) : TRegisterRequest {
        return {
            name : data.name,
            email : data.email,
            password : data.password,
            phone : data.phone,
            institutionID : data.institutionID,
            role: data.role
        }
}

export function MapUserToUpdateRequest( data : 
    Partial<Pick<IUser,
        'name' |
        'phone' |
        'institutionID'
    >> & {
    newPassword ?: string
    currentPassword ?: string
    confirmNewPassword ?: string
}) : TUpdateUserRequest {
    return {
        ...data,
        name : data?.name,
        phone : data?.phone,
        institutionID : data.institutionID,
    }
}

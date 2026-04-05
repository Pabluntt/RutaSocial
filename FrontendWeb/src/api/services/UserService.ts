import { MapUserFromBackend, TLoginRequest, TRegisterRequest, TUpdateUserRequest, TUserBackend } from "../adapters/User.adapter"
import { IUser } from "../models/User"
import { axiosInstance } from "./axiosInstance"



export type TParticipationRespone = {
    total_routes : number,
    total_helpingpoints : number
}


export class UserService {

    static async Login( body : TLoginRequest) : Promise<string> {
        const { data } = await axiosInstance.post(`/login`, body)
        return  data?.token
    }

    static async Register(user : TRegisterRequest) : Promise<string> {
        const { data } = await axiosInstance.post(`/register`, user)
        return data?.token
    }

    static async GetProfile() : Promise<IUser> {
        const { data } = await axiosInstance.get('/user/profile')
        return MapUserFromBackend(data?.message as TUserBackend)
    }

    static async UpdateProfile(user : TUpdateUserRequest) : Promise<IUser> {
        const { data } = await axiosInstance.put(`/user/update`, user)
        return MapUserFromBackend(data?.message as TUserBackend)
    }

    static async FindAllUsers() : Promise<IUser[]> {
        const { data } = await axiosInstance.get(`/user/`)
        return (data?.message as TUserBackend[]).map((user, _) => (
            MapUserFromBackend(user)
        ))
    }

    static async FindUserById(id : string) : Promise<IUser> {
        const { data } = await axiosInstance.get(`/user/${id}`)
        return MapUserFromBackend(data?.message as TUserBackend)
    }

    static async GetParticipationUser(id : string) : Promise<TParticipationRespone> {
        const { data } = await axiosInstance.get(`/route/participation/${id}`)
        return data?.message as TParticipationRespone
    }
} 
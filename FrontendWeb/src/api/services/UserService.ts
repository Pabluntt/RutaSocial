import { MapUserFromBackend, TAdminCreateUserRequest, TLoginRequest, TRegisterRequest, TUpdateUserRequest, TUserBackend } from "../adapters/User.adapter"
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

    static async CreateUserByAdmin(user : TAdminCreateUserRequest) : Promise<IUser> {
        const { data } = await axiosInstance.post(`/user`, user)
        return MapUserFromBackend(data?.message as TUserBackend)
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

    static async GetPublicInfoByID(id: string): Promise<{ name: string; institutionID: string; phone: string }> {
        const { data } = await axiosInstance.get(`/user/public-info/${id}`)
        return data?.message as { name: string; institutionID: string; phone: string }
    }

    static async FindUserById(id : string) : Promise<IUser> {
        const { data } = await axiosInstance.get(`/user/${id}`)
        return MapUserFromBackend(data?.message as TUserBackend)
    }

    static async GetParticipationUser(id : string) : Promise<TParticipationRespone> {
        const { data } = await axiosInstance.get(`/route/participation/${id}`)
        return data?.message as TParticipationRespone
    }

    static async AdminUpdateUser(id: string, data: Partial<Pick<IUser, 'name' | 'phone' | 'email' | 'role' | 'institutionID'>>): Promise<IUser> {
        const { data: response } = await axiosInstance.put(`/user/${id}`, data)
        return MapUserFromBackend(response?.message as TUserBackend)
    }

    static async DeleteUser(id : string) : Promise<void> {
        await axiosInstance.delete(`/user/${id}`)
    }
} 
import { MapUserFromBackend, TAdminCreateUserRequest, TLoginRequest, TRegisterRequest, TUpdateUserRequest, TUserBackend } from "../adapters/User.adapter"
import { IUser } from "../models/User"
import { axiosInstance } from "./axiosInstance"



export type TParticipationRespone = {
    total_routes : number,
    total_helpingpoints : number
}

export type TPublicUserInfo = { name: string; institutionID: string; phone: string }


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

    static async FindUsersBatch(ids: string[]): Promise<(TPublicUserInfo & { id: string })[]> {
        const uniqueIds = [...new Set(ids.filter(Boolean))]
        if (uniqueIds.length === 0) return []
        if (import.meta.env.VITE_ENABLE_USER_BATCH !== 'true') {
            const users = await Promise.all(uniqueIds.map(async (id) => {
                try {
                    const user = await UserService.GetPublicInfoByID(id)
                    return { id, ...user }
                } catch {
                    return undefined
                }
            }))
            return users.filter((user): user is TPublicUserInfo & { id: string } => Boolean(user))
        }

        try {
            const { data } = await axiosInstance.get(`/user/batch`, {
                params: { ids: uniqueIds.join(',') }
            })
            return (data?.message as (TPublicUserInfo & { _id: string })[]).map((user) => ({
                id: user._id,
                name: user.name,
                institutionID: user.institutionID,
                phone: user.phone,
            }))
        } catch {
            const users = await Promise.all(uniqueIds.map(async (id) => {
                try {
                    const user = await UserService.GetPublicInfoByID(id)
                    return { id, ...user }
                } catch {
                    return undefined
                }
            }))
            return users.filter((user): user is TPublicUserInfo & { id: string } => Boolean(user))
        }
    }

    static async GetPublicInfoByID(id: string): Promise<TPublicUserInfo> {
        const { data } = await axiosInstance.get(`/user/public-info/${id}`)
        return data?.message as TPublicUserInfo
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

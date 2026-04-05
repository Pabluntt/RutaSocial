import { useMutation, useQuery } from "@tanstack/react-query";
import { UserService } from "../services/UserService";
import useSessionStore from "../../stores/useSessionStore";
import { MapUserToCreateRequest, MapUserToLoginRequest, MapUserToUpdateRequest } from "../adapters/User.adapter";
import { IUser } from "../models/User";


const setToken = useSessionStore.getState().setAccessToken


export function useLogin() {
    return useMutation({
        mutationFn: ({ email, password } : { email : string, password : string}) => UserService.Login(MapUserToLoginRequest({ email, password })),
        onSuccess(data) {
            setToken(data as string)
        },
    })
}

export function useRegister() {
    return useMutation({
        mutationFn: ( user : Pick<IUser, 'email' | 'password' | 'phone' | 'institutionID' | 'name' | 'role'>) => (UserService.Register(MapUserToCreateRequest(user)))
    })
}

export function useProfile(enabled ?: boolean ) {
    return useQuery({
        queryKey : ['profile'],
        queryFn : () => (UserService.GetProfile()),
        enabled,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        staleTime: Infinity, 
    })
}

export function useUsers( enabled ?: boolean) {
    return useQuery({
        queryKey : ['users'],
        queryFn : () => (UserService.FindAllUsers()),
        enabled
    })
}

export function useUpdateUser() {
    return useMutation({
        mutationFn: (
            user : Partial<Pick<IUser, 'name' | 'phone' | 'institutionID'>> & {
            newPassword ?: string
            currentPassword ?: string
            confirmNewPassword ?: string
        }) => (UserService.UpdateProfile(MapUserToUpdateRequest(user))),
    })
}

export function useUser( id : string) {
    return useQuery({
        queryKey : ['findUserId', id],
        queryFn : () => (UserService.FindUserById(id)),
    })
}

export function useUserParticipation( id: string) {
    return useQuery({
        queryKey: ['participation', id],
        queryFn: () => (UserService.GetParticipationUser(id))
    })
}


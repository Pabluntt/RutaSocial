import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserService } from "../services/UserService";
import useSessionStore from "../../stores/useSessionStore";
import { MapUserToAdminCreateRequest, MapUserToLoginRequest, MapUserToUpdateRequest } from "../adapters/User.adapter";
import { IUser } from "../models/User";


const setToken = useSessionStore.getState().setAccessToken


export function useLogin() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ email, password } : { email : string, password : string}) => UserService.Login(MapUserToLoginRequest({ email, password })),
        onSuccess(data) {
            queryClient.clear()
            setToken(data)
        },
    })
}

export function useAdminCreateUser() {
    return useMutation({
        mutationFn: (user : {
            email : string
            password : string
            institutionID : string
            name ?: string
            phone ?: string
            role ?: string
        }) => (UserService.CreateUserByAdmin(MapUserToAdminCreateRequest(user)))
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

export function useAdminUpdateUser() {
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Pick<IUser, 'name' | 'phone' | 'email' | 'role' | 'institutionID'>> }) =>
            UserService.AdminUpdateUser(id, data),
    })
}

export function useDeleteUser() {
    return useMutation({
        mutationFn: (id: string) => (UserService.DeleteUser(id)),
    })
}


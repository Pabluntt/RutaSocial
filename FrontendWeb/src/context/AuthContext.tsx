import React, { useEffect } from 'react';
import { createContext, useState, use } from 'react';
import useSessionStore from '../stores/useSessionStore';
import { useProfile } from '../api/hooks/UserHooks';


interface AuthContextProps {
    role : string 
    loading : boolean
}


export const AuthContext = createContext<AuthContextProps | null>(null);

export function AuthProvider({ children } : { children : React.ReactNode}) {

    const [ role, setRole ] = useState('')
 
    const { accessToken } = useSessionStore()
    const { isLoading, data, isSuccess, isError } = useProfile(!!accessToken)
    
    useEffect(() => {
        if (!accessToken) {
            setRole('')
            return
        }

        if(isSuccess) {
            setRole(data.role)
        }

        // Evita pantalla en blanco por throw global cuando el perfil falla.
        if(isError) {
            setRole('')
        }
    }, [accessToken, isSuccess, isError, data])

    return (
        <AuthContext value={{role, loading : isLoading}}>
        {children}
        </AuthContext>
    )
};

export const useAuth = () => {
    const state  = use(AuthContext)
    if(!state) {
        throw new Error("useAuth has to be used within AuthProvider");
    }
    return state
}
import {  useMutation, useQuery } from "@tanstack/react-query";
import { InstitutionService, TRegisterInstitution, TUpdateInstitution } from "../services/InstitutionService";




export function useInstitutions() {
    return useQuery({
        queryKey : ['institutions'],
        queryFn : () => InstitutionService.FindAll()
    })
}

export function useInstitution( id : string) {
    return useQuery({
        queryKey : ['institution', id],
        queryFn : () => InstitutionService.FindByID(id)
    })
}

export function useCreateInstitution() {
    return useMutation({
        mutationFn : ( instituton : TRegisterInstitution) => InstitutionService.CreateInstitution(instituton) 
    })
}

export function useUpdateInstitution() {
    return useMutation({
        mutationFn : ( institution : TUpdateInstitution) => InstitutionService.UpdateInstitution(institution)
    })
}
import { MapInstitutionFromBackend, TInstitutionBackend } from "../adapters/Institution.adapter";
import { Institution } from "../models/Institution";
import { axiosInstance } from "./axiosInstance";


export type TRegisterInstitution = Omit<TInstitutionBackend, '_id'>
export type TUpdateInstitution = TInstitutionBackend


export class InstitutionService {

    private static readonly RESOURCE_NAME = 'institution'

    static async FindAll() : Promise<Institution[]> {
        const { data } = await axiosInstance.get(`/${this.RESOURCE_NAME}/`)
        return (data?.message as TInstitutionBackend[]).map((ins => (
            MapInstitutionFromBackend(ins)
        )))
    }

    static async FindByID( id : string) : Promise<Institution> {
        const { data } = await axiosInstance.get(`/${this.RESOURCE_NAME}/${id}`)
        return MapInstitutionFromBackend(data?.message as TInstitutionBackend)
    } 

    static async CreateInstitution( institution : TRegisterInstitution ) : Promise<Institution> {
        const { data } = await axiosInstance.post(`/${this.RESOURCE_NAME}/`, institution)
        return data?.message
    }

    static async UpdateInstitution( updateInstitution : TUpdateInstitution) : Promise<Institution> {
        const { data } = await axiosInstance.put(`/${this.RESOURCE_NAME}/${updateInstitution._id}`, updateInstitution)
        return MapInstitutionFromBackend(data?.message as TInstitutionBackend)
    }
}
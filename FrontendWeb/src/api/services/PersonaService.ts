import { axiosInstance } from "./axiosInstance"
import { TPersonaBackend, TPersonaCreateRequest, TPersonaUpdateRequest, MapPersonaFromBackend } from "../adapters/Persona.adapter"
import { Persona } from "../models/Persona"

export class PersonaService {
    private static readonly RESOURCE_NAME = 'personas'

    static async GetAll(query?: string): Promise<Persona[]> {
        const params = query ? { q: query } : {}
        const { data } = await axiosInstance.get(`/${this.RESOURCE_NAME}`, { params })
        return (data?.message as TPersonaBackend[]).map(MapPersonaFromBackend)
    }

    static async Search(query: string): Promise<Persona[]> {
        const { data } = await axiosInstance.get(`/${this.RESOURCE_NAME}/search`, { params: { q: query } })
        return (data?.message as TPersonaBackend[]).map(MapPersonaFromBackend)
    }

    static async GetByID(id: string): Promise<Persona> {
        const { data } = await axiosInstance.get(`/${this.RESOURCE_NAME}/${id}`)
        return MapPersonaFromBackend(data?.message as TPersonaBackend)
    }

    static async Create(persona: TPersonaCreateRequest): Promise<Persona> {
        const { data } = await axiosInstance.post(`/${this.RESOURCE_NAME}`, persona)
        return MapPersonaFromBackend(data?.message as TPersonaBackend)
    }

    static async Update(id: string, persona: TPersonaUpdateRequest): Promise<Persona> {
        const { data } = await axiosInstance.put(`/${this.RESOURCE_NAME}/${id}`, persona)
        return MapPersonaFromBackend(data?.message as TPersonaBackend)
    }

    static async Delete(id: string): Promise<string> {
        const { data } = await axiosInstance.delete(`/${this.RESOURCE_NAME}/${id}`)
        return data?.message
    }

    static async AddAntecedente(personaID: string, descripcion: string): Promise<Persona> {
        const { data } = await axiosInstance.post(`/${this.RESOURCE_NAME}/${personaID}/antecedentes`, { descripcion })
        return MapPersonaFromBackend(data?.message as TPersonaBackend)
    }

    static async DeleteAntecedente(personaID: string, entryID: string): Promise<Persona> {
        const { data } = await axiosInstance.delete(`/${this.RESOURCE_NAME}/${personaID}/antecedentes/${entryID}`)
        return MapPersonaFromBackend(data?.message as TPersonaBackend)
    }

    static async AddInfoMedica(personaID: string, descripcion: string): Promise<Persona> {
        const { data } = await axiosInstance.post(`/${this.RESOURCE_NAME}/${personaID}/info-medica`, { descripcion })
        return MapPersonaFromBackend(data?.message as TPersonaBackend)
    }

    static async DeleteInfoMedica(personaID: string, entryID: string): Promise<Persona> {
        const { data } = await axiosInstance.delete(`/${this.RESOURCE_NAME}/${personaID}/info-medica/${entryID}`)
        return MapPersonaFromBackend(data?.message as TPersonaBackend)
    }
}

import { AntecedenteEntry, Persona } from "../models/Persona"

export interface TAntecedenteEntryBackend {
    _id: string
    fecha: string
    descripcion: string
}

export interface TPersonaBackend {
    _id: string
    nombre: string
    rut?: string
    edad: number
    genero: string
    antecedentes?: TAntecedenteEntryBackend[]
    info_medica?: TAntecedenteEntryBackend[]
    antecedentes_count?: number
    info_medica_count?: number
    fecha_creacion: string
    fecha_actualizacion: string
}

export interface TPersonaCreateRequest {
    nombre: string
    rut?: string
    edad: number
    genero: string
}

export type TPersonaUpdateRequest = Partial<TPersonaCreateRequest>

export function MapAntecedenteEntryFromBackend(data: TAntecedenteEntryBackend): AntecedenteEntry {
    return {
        id: data._id,
        fecha: new Date(data.fecha),
        descripcion: data.descripcion,
    }
}

export function MapPersonaFromBackend(data: TPersonaBackend): Persona {
    const antecedentes = (data.antecedentes || []).map(MapAntecedenteEntryFromBackend)
    const infoMedica = (data.info_medica || []).map(MapAntecedenteEntryFromBackend)

    antecedentes.sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
    infoMedica.sort((a, b) => b.fecha.getTime() - a.fecha.getTime())

    return {
        id: data._id,
        nombre: data.nombre,
        rut: data.rut,
        edad: data.edad,
        genero: data.genero,
        antecedentes,
        infoMedica,
        antecedentesCount: data.antecedentes_count ?? antecedentes.length,
        infoMedicaCount: data.info_medica_count ?? infoMedica.length,
        fechaCreacion: new Date(data.fecha_creacion),
        fechaActualizacion: new Date(data.fecha_actualizacion),
    }
}

export function MapPersonaToCreateRequest(data: TPersonaCreateRequest): TPersonaCreateRequest {
    return data
}

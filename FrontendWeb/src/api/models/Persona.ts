export interface AntecedenteEntry {
    id: string
    fecha: Date
    descripcion: string
}

export interface Persona {
    id: string
    nombre: string
    rut?: string
    edad: number
    genero: string
    antecedentes: AntecedenteEntry[]
    infoMedica: AntecedenteEntry[]
    antecedentesCount: number
    infoMedicaCount: number
    fechaCreacion: Date
    fechaActualizacion: Date
}

export type AntecedenteEntry = {
    id: string
    fecha: Date
    descripcion: string
}

export type Persona = {
    id: string
    nombre: string
    rut?: string
    edad: number
    genero: string
    antecedentes: AntecedenteEntry[]
    infoMedica: AntecedenteEntry[]
    fechaCreacion: Date
    fechaActualizacion: Date
}

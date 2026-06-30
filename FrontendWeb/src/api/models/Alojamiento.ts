export interface Alojamiento {
    _id: string
    author_id: string
    coords: number[]
    name: string
    cupos: number
    date_register: string
}

export interface AlojamientoData {
    id: string
    coords: [number, number]
    name: string
    cupos: number
}

import { axiosInstance } from "./axiosInstance"

export interface CreateAlojamientoRequest {
    coords: number[]
    name: string
    cupos: number
    author_id: string
}

export interface UpdateAlojamientoRequest {
    _id: string
    cupos?: number
    name?: string
}

const BASE_URL = '/alojamiento'

export async function getAllAlojamientos() {
    const response = await axiosInstance.get(BASE_URL)
    return response.data.message
}

export async function createAlojamiento(data: CreateAlojamientoRequest) {
    const response = await axiosInstance.post(BASE_URL, data)
    return response.data.message
}

export async function updateAlojamiento(id: string, data: Partial<UpdateAlojamientoRequest>) {
    const response = await axiosInstance.put(`${BASE_URL}/${id}`, data)
    return response.data.message
}

export async function deleteAlojamiento(id: string) {
    const response = await axiosInstance.delete(`${BASE_URL}/${id}`)
    return response.data.message
}

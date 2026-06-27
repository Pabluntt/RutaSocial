import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getAllAlojamientos, createAlojamiento, updateAlojamiento } from "../services/AlojamientoService"
import type { CreateAlojamientoRequest } from "../services/AlojamientoService"

export function useAlojamientos() {
    return useQuery({
        queryKey: ["alojamientos"],
        queryFn: getAllAlojamientos,
    })
}

export function useCreateAlojamiento() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (data: CreateAlojamientoRequest) => createAlojamiento(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["alojamientos"] })
        },
    })
}

export function useUpdateAlojamiento() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<{ cupos: number; name: string }> }) =>
            updateAlojamiento(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["alojamientos"] })
        },
    })
}

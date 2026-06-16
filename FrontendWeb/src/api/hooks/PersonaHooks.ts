import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { PersonaService } from "../services/PersonaService"
import { TPersonaCreateRequest, TPersonaUpdateRequest } from "../adapters/Persona.adapter"

export function usePersonas(query?: string) {
    return useQuery({
        queryKey: ['personas', query],
        queryFn: () => query ? PersonaService.Search(query) : PersonaService.GetAll(),
    })
}

export function usePersona(id: string) {
    return useQuery({
        queryKey: ['persona', id],
        queryFn: () => PersonaService.GetByID(id),
        enabled: !!id,
    })
}

export function useCreatePersona() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (body: TPersonaCreateRequest) => PersonaService.Create(body),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['personas'] }),
    })
}

export function useUpdatePersona() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: TPersonaUpdateRequest }) => PersonaService.Update(id, data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['personas'] })
            qc.invalidateQueries({ queryKey: ['persona'] })
        },
    })
}

export function useDeletePersona() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => PersonaService.Delete(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['personas'] }),
    })
}

export function useAddAntecedente() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ personaID, descripcion }: { personaID: string; descripcion: string }) =>
            PersonaService.AddAntecedente(personaID, descripcion),
        onSuccess: (_data, variables) => qc.invalidateQueries({ queryKey: ['persona', variables.personaID] }),
    })
}

export function useDeleteAntecedente() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ personaID, entryID }: { personaID: string; entryID: string }) =>
            PersonaService.DeleteAntecedente(personaID, entryID),
        onSuccess: (_data, variables) => qc.invalidateQueries({ queryKey: ['persona', variables.personaID] }),
    })
}

export function useAddInfoMedica() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ personaID, descripcion }: { personaID: string; descripcion: string }) =>
            PersonaService.AddInfoMedica(personaID, descripcion),
        onSuccess: (_data, variables) => qc.invalidateQueries({ queryKey: ['persona', variables.personaID] }),
    })
}

export function useDeleteInfoMedica() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ personaID, entryID }: { personaID: string; entryID: string }) =>
            PersonaService.DeleteInfoMedica(personaID, entryID),
        onSuccess: (_data, variables) => qc.invalidateQueries({ queryKey: ['persona', variables.personaID] }),
    })
}

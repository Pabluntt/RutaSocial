import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { HelpPointService } from "../services/HelpPointService"
import { HelpPoint } from "../models/HelpPoint"
import { MapHelpPointToCreateRequest, MapHelpPointToUpdateRequest } from "../adapters/HelpPoint.adapter"


export function useCreateHelpPoint() {
    return useMutation({
        mutationFn : (body : Omit<HelpPoint, 'id' | 'dateRegister'>) => (HelpPointService.CreateHelpPoint(MapHelpPointToCreateRequest(body)))
    })
}

export function useHelpPoints()  {
    return useQuery({
        queryKey: ['help-points'],
        queryFn: () => (HelpPointService.FindAllHelpPoint())
    })
}

export function useUpdateHelpPoint() {
    return useMutation({
        mutationFn : (body : HelpPoint) => (HelpPointService.UpdateHelpPoint(MapHelpPointToUpdateRequest(body)))
    })
}

export function useLinkPersonaToHelpPoint() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn : ({ helpPointID, personaID }: { helpPointID: string; personaID: string }) =>
            HelpPointService.LinkPersonaToHelpPoint(helpPointID, personaID),
        onSuccess: (_data, variables) => {
            qc.invalidateQueries({ queryKey: ['help-points'] })
            qc.invalidateQueries({ queryKey: ['persona', variables.personaID] })
        }
    })
}

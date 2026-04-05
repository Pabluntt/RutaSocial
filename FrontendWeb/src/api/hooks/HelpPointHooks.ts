import { useMutation, useQuery } from "@tanstack/react-query"
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

export function useDeleteHelpPoint() {
    return useMutation({
        mutationFn : (helpPointID : string) => (HelpPointService.DeleteHelpPoint(helpPointID))
    })
}

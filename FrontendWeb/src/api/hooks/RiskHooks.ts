import { useMutation, useQuery } from "@tanstack/react-query";
import { RiskService } from "../services/RiskService";
import { Risk } from "../models/Risk";
import { MapRiskToCreateRequest, MapRiskToUpdateRequest } from "../adapters/Risk.adapter";



export function useCreateRisk() {
    return useMutation({
        mutationFn: (risk : Omit<Risk, 'id' | 'createdAt'>) => (RiskService.CreateRisk(MapRiskToCreateRequest(risk))),
    })
}

export function useRisks() {
    return useQuery({
        queryKey : ['risks'],
        queryFn: () => (RiskService.FindAll())
    })
}

export function useUpdateRisk() {
    return useMutation({
        mutationFn : (risk : Risk) => (RiskService.UpdateRisk(MapRiskToUpdateRequest(risk)))
    })
}

export function useDeleteRisk( riskId : string ) {
    return useMutation({
        mutationFn : () => (RiskService.DeleteRisk( riskId ))
    })
}

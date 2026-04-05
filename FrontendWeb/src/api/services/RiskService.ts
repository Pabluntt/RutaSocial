import { MapRiskFromBackend, TCreateRisk, TRiskBackend, TUpdateRisk } from "../adapters/Risk.adapter"
import { Risk } from "../models/Risk"
import { axiosInstance } from "./axiosInstance"



export class RiskService {

    private static readonly RESOURCE_NAME = 'risk'

    static async CreateRisk( body : TCreateRisk ) : Promise<Risk> {
        const { data } = await axiosInstance.post(`/${this.RESOURCE_NAME}`, body)
        console.log(data)
        return MapRiskFromBackend(data?.message as TRiskBackend)
    }

    static async FindAll() : Promise<Risk[]> {
        const { data } = await axiosInstance.get(`/${this.RESOURCE_NAME}`)
        return (data?.message as TRiskBackend[]).map( risk => (
            MapRiskFromBackend(risk)
        ))
    }

    static async UpdateRisk( body: TUpdateRisk) : Promise<Risk> {
        console.log(body)
        const { data } = await axiosInstance.put(`/${this.RESOURCE_NAME}/${body._id}`, body)
        return MapRiskFromBackend(data?.message as TRiskBackend)
    }

    static async DeleteRisk( riskId : string ) : Promise<string> {
        const { data } = await axiosInstance.delete(`/${this.RESOURCE_NAME}/${riskId}`)
        return data?.message
    }
} 
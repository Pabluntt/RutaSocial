import { MapHelpPointFromBackend, THelpPointBackend, THelpPointCreateRequest, THelpPointUpdateRequest } from "../adapters/HelpPoint.adapter"
import { HelpPoint } from "../models/HelpPoint"
import { axiosInstance } from "./axiosInstance"



export class HelpPointService {

    private static readonly RESOURCE_NAME = 'helping-point'

    static async CreateHelpPoint( helpPoint : THelpPointCreateRequest ) : Promise<HelpPoint> {
        const { data } =  await axiosInstance.post(`/${this.RESOURCE_NAME}`, helpPoint) 
        return MapHelpPointFromBackend(data?.message as THelpPointBackend)
    }

    static async FindAllHelpPoint() : Promise<HelpPoint[]> {
        const { data } = await axiosInstance.get(`/${this.RESOURCE_NAME}`)
        return (data?.message as THelpPointBackend[]).map((hp, _) => (
            MapHelpPointFromBackend(hp)
        ))
    }

    static async UpdateHelpPoint( helpPoint : THelpPointUpdateRequest ) : Promise<HelpPoint> {
        const { data } = await axiosInstance.put(`/${this.RESOURCE_NAME}/${helpPoint._id}`, helpPoint)
        console.log(data)
        return MapHelpPointFromBackend(data?.message as THelpPointBackend)
    }

    static async DeleteHelpPoint( helpPointID : string ) : Promise<string> {
        const { data } = await axiosInstance.delete(`/${this.RESOURCE_NAME}/${helpPointID}`)
        return data?.message
    }
}
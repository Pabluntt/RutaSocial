import { MapCalendarEventFromBackend, TCalendarEventBackend, TCalendarEventCreateRequest, TCalendarEventUpdateRequest } from "../adapters/CalendarEvent.adapter"
import { CalendarEvent } from "../models/Calendar"
import { axiosInstance } from "./axiosInstance"


export class CalendarService {

    public static readonly RESOURCE_NAME = 'calendar-event'

    static async GetEvents() : Promise<CalendarEvent[]> {
        const { data } = await axiosInstance.get(`/${this.RESOURCE_NAME}`)
        console.log(data)
        return await Promise.all((data as TCalendarEventBackend[]).map(async (event, _) => (
           await MapCalendarEventFromBackend(event as TCalendarEventBackend) 
        )))
    }

    static async AddEvent( event : TCalendarEventCreateRequest) : Promise<CalendarEvent> {
        const { data } = await axiosInstance.post(`/${this.RESOURCE_NAME}`, event)
        return await MapCalendarEventFromBackend(data as TCalendarEventBackend)
    }

    static async DeleteEvent( eventID : string) : Promise<string> {
        const { data } = await axiosInstance.delete(`/${this.RESOURCE_NAME}/${eventID}`)
        return data?.message
    }

    static async UpdateEvent( eventUpdate : TCalendarEventUpdateRequest) : Promise<string> {
        console.log(eventUpdate)
        const { data } = await axiosInstance.put(`/${this.RESOURCE_NAME}/${eventUpdate._id}`, eventUpdate)
        return data?.message
    }

} 
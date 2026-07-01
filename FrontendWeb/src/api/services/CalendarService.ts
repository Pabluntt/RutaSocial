import { MapCalendarEventFromBackend, TCalendarEventBackend, TCalendarEventCreateRequest, TCalendarEventUpdateRequest } from "../adapters/CalendarEvent.adapter"
import { CalendarEvent } from "../models/Calendar"
import { UserService } from "./UserService"
import { axiosInstance } from "./axiosInstance"


export class CalendarService {

    public static readonly RESOURCE_NAME = 'calendar-event'

    static async GetEvents() : Promise<CalendarEvent[]> {
        const { data } = await axiosInstance.get(`/${this.RESOURCE_NAME}`)
        const events = Array.isArray(data) ? data as TCalendarEventBackend[] : []
        const cache = await CalendarService.buildEventCache(events)
        return await Promise.all(events.map(async (event, _) => (
           await MapCalendarEventFromBackend(event, cache) 
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
        const { data } = await axiosInstance.put(`/${this.RESOURCE_NAME}/${eventUpdate._id}`, eventUpdate)
        return data?.message
    }

    static async GetUserCalendarEvents(userId: string): Promise<CalendarEvent[]> {
        const { data } = await axiosInstance.get(`/${this.RESOURCE_NAME}/user/${userId}`)
        const events = Array.isArray(data?.message) ? data.message as TCalendarEventBackend[] : []
        const cache = await CalendarService.buildEventCache(events)
        return await Promise.all(events.map(async (event) =>
            await MapCalendarEventFromBackend(event, cache)
        ))
    }

    private static async buildEventCache(events: TCalendarEventBackend[]) {
        const usersById = new Map()
        const users = await UserService.FindUsersBatch(events.map((event) => event.author_id))
        users.forEach((user) => usersById.set(user.id, { name: user.name, institutionID: user.institutionID, phone: user.phone }))
        return { users: new Map(), usersById, institutions: new Map() }
    }

} 

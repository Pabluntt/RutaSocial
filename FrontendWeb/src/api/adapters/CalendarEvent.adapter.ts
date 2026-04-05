import { CalendarEvent } from "../models/Calendar"
import { InstitutionService } from "../services/InstitutionService"
import { UserService } from "../services/UserService"

export type TCalendarEventBackend = {
    _id: string
    title: string
    description: string
    date_start: string
    author_id: string
    time_start: string
    time_end: string
}

export type TCalendarEventCreateRequest = Omit<
    TCalendarEventBackend,
    '_id'
>


export type TCalendarEventUpdateRequest = TCalendarEventBackend

export async function MapCalendarEventFromBackend(
    data: Partial<TCalendarEventBackend>
): Promise<CalendarEvent> {

    let authorName = 'Usuario Eliminado'
    let colorInstitution = '#000000'
    try {
        const user = (await UserService.FindUserById(data.author_id as string))
        colorInstitution = (await InstitutionService.FindByID(user.institutionID)).color
        authorName = user.name
    } catch(e) {
        console.log(e)
    }

    const event: Partial<CalendarEvent> = {
        id: data._id,
        title: data.title,
        description: data.description,
        dateStart: data.date_start ? new Date(data.date_start) : undefined,
        authorID: data.author_id,
        authorName: authorName,
        timeStart: data.time_start,
        timeEnd: data.time_end,
        colorInstitution : colorInstitution
    }
    Object.entries(event).forEach(([key, value]) => {
        if (value === undefined) {
            throw new Error(`Missing required field in CalendarEvent: ${key}`);
        }
    })
    return event as CalendarEvent
}

export function MapCalendarEventToCreateRequest(
    data: Omit<CalendarEvent, 'id' | 'authorName' | 'colorInstitution'>
): TCalendarEventCreateRequest {
    return {
        title: data.title,
        description: data.description,
        date_start: data.dateStart.toISOString(),
        time_start: data.timeStart,
        time_end: data.timeEnd,
        author_id: data.authorID
    }
}

export function MapCalendarEventToUpdateRequest(
    data: CalendarEvent
): TCalendarEventUpdateRequest {
    return {
        _id: data.id,
        title: data.title,
        description: data.description,
        date_start: data.dateStart.toISOString(),
        author_id: data.authorID,
        time_start: data.timeStart,
        time_end: data.timeEnd,
    }
}

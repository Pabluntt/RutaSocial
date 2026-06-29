import { CalendarEvent } from "../models/Calendar"
import { Institution } from "../models/Institution"
import { InstitutionService } from "../services/InstitutionService"
import { TPublicUserInfo, UserService } from "../services/UserService"

export type TCalendarEventBackend = {
    _id: string
    title: string
    description: string
    date_start: string
    author_id: string
    time_start: string
    time_end: string
    route_id?: string
}

export type TCalendarEventCreateRequest = Omit<
    TCalendarEventBackend,
    '_id' | 'author_id'
>


export type TCalendarEventUpdateRequest = TCalendarEventBackend

export type TCalendarEventMapCache = {
    users?: Map<string, Promise<TPublicUserInfo>>
    usersById?: Map<string, TPublicUserInfo>
    institutions?: Map<string, Promise<Institution>>
}

export async function MapCalendarEventFromBackend(
    data: Partial<TCalendarEventBackend>,
    cache?: TCalendarEventMapCache
): Promise<CalendarEvent> {

    let authorName = 'Usuario Eliminado'
    let colorInstitution = '#000000'
    try {
        const authorID = data.author_id as string
        let user = cache?.usersById?.get(authorID)
        if (!user) {
            let userPromise = cache?.users?.get(authorID)
            if (!userPromise) {
                userPromise = UserService.GetPublicInfoByID(authorID)
                cache?.users?.set(authorID, userPromise)
            }
            user = await userPromise
        }

        let institutionPromise = cache?.institutions?.get(user.institutionID)
        if (!institutionPromise) {
            institutionPromise = InstitutionService.FindByID(user.institutionID)
            cache?.institutions?.set(user.institutionID, institutionPromise)
        }
        colorInstitution = (await institutionPromise).color
        authorName = user.name
    } catch(error) {
        console.error('No se pudo obtener autor o institución del evento', error)
    }

    // Parsear fecha correctamente sin problemas de timezone
    let dateStart: Date | undefined
    if (data.date_start) {
        const dateStr = data.date_start
        // Si es formato ISO como "2026-05-05T00:00:00Z", extraer solo la fecha
        const datePart = dateStr.split('T')[0] // "2026-05-05"
        const [year, month, day] = datePart.split('-').map(Number)
        // Crear fecha usando hora local para evitar offset de timezone
        dateStart = new Date(year, month - 1, day)
    }

    const event: Partial<CalendarEvent> = {
        id: data._id,
        title: data.title,
        description: data.description,
        dateStart: dateStart,
        authorID: data.author_id,
        authorName: authorName,
        timeStart: data.time_start,
        timeEnd: data.time_end,
        routeID: data.route_id && data.route_id !== '000000000000000000000000' ? data.route_id : undefined,
        colorInstitution : colorInstitution
    }
    const requiredKeys: (keyof CalendarEvent)[] = ['id', 'title', 'description', 'dateStart', 'authorID', 'authorName', 'timeStart', 'timeEnd', 'colorInstitution']
    requiredKeys.forEach((key) => {
        if (event[key] === undefined) {
            throw new Error(`Missing required field in CalendarEvent: ${key}`);
        }
    })
    return event as CalendarEvent
}

export function MapCalendarEventToCreateRequest(
    data: Omit<CalendarEvent, 'id' | 'authorName' | 'colorInstitution'>
): TCalendarEventCreateRequest {
    const req: TCalendarEventCreateRequest = {
        title: data.title,
        description: data.description,
        date_start: data.dateStart.toISOString(),
        time_start: data.timeStart,
        time_end: data.timeEnd,
    }
    if (data.routeID && data.routeID !== '000000000000000000000000') {
        req.route_id = data.routeID
    }
    return req
}

export function MapCalendarEventToUpdateRequest(
    data: CalendarEvent
): TCalendarEventUpdateRequest {
    const req: TCalendarEventUpdateRequest = {
        _id: data.id,
        title: data.title,
        description: data.description,
        date_start: data.dateStart.toISOString(),
        author_id: data.authorID,
        time_start: data.timeStart,
        time_end: data.timeEnd,
    }
    if (data.routeID && data.routeID !== '000000000000000000000000') {
        req.route_id = data.routeID
    }
    return req
}

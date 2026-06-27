import { useMutation, useQuery } from "@tanstack/react-query"
import { MapCalendarEventToCreateRequest, MapCalendarEventToUpdateRequest } from "../adapters/CalendarEvent.adapter"
import { CalendarService } from "../services/CalendarService"
import { CalendarEvent } from "../models/Calendar"





export function useCalendarEvents() {
    return useQuery({
        queryKey : ['events'],
        queryFn : () => CalendarService.GetEvents()
    })
}

export function useUserCalendarEvents(userId: string, enabled?: boolean) {
    return useQuery({
        queryKey: ['userCalendarEvents', userId],
        queryFn: () => CalendarService.GetUserCalendarEvents(userId),
        enabled: !!userId && enabled !== false,
    })
}

export function useCreateCalendarEvent() {
    return useMutation({
        mutationFn : ( event : Omit<CalendarEvent, 'id' | 'authorName' | 'colorInstitution'>) => CalendarService.AddEvent(MapCalendarEventToCreateRequest(event)),
        onError(_error, _variables, _context) {
        },
    })
}

export function useDeleteCalendarEvent() {
    return useMutation({
        mutationFn: ( calendarID : string) => CalendarService.DeleteEvent(calendarID)
    })
}

export function useUpdateCalendarEvent() {
    return useMutation({
        mutationFn: ( event : CalendarEvent ) => CalendarService.UpdateEvent(MapCalendarEventToUpdateRequest(event)) 
    })
}
    

import React from 'react';
import { createContext, useState, useContext } from 'react';
import { CalendarEvent } from '../api/models/Calendar';


// Si EventCalendar es undefined entonces openDialog = false
// lo contrario es openDialog = true

type StateEventCalendarUpdateContext = [ CalendarEvent | undefined, React.Dispatch<React.SetStateAction<CalendarEvent | undefined>> ]


export const EventCalendarUpdateContext = createContext<StateEventCalendarUpdateContext | null>(null);

export function EventCalendarUpdateProvider({ children } : { children : React.ReactNode}) {

    const stateEventCalendarUpdate = useState<CalendarEvent | undefined>()

    return (
        <EventCalendarUpdateContext.Provider value={stateEventCalendarUpdate}>
        {children}
        </EventCalendarUpdateContext.Provider>
    )
};

export const useEventCalendarUpdateDialog = () => {
    const state  = useContext(EventCalendarUpdateContext)
    if(!state) {
        throw new Error("useZoom has to be used within ZoomProvider");
    }
    return state
}

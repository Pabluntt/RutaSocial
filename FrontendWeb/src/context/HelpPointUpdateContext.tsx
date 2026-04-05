import React from 'react';
import { createContext, useState, useContext } from 'react';
import { HelpPoint } from '../api/models/HelpPoint';

// Si HelpPoint es undefined entonces openDialgo = false
// lo contrario es openDialog = true

type StateHelpPointsUpdateContext = [ HelpPoint | undefined, React.Dispatch<React.SetStateAction<HelpPoint | undefined>> ]


export const HelpPointUpdateContext = createContext<StateHelpPointsUpdateContext | null>(null);

export function HelpPointUpdateProvider({ children } : { children : React.ReactNode}) {

    const stateHelpPointUpdate = useState<HelpPoint | undefined>()

    return (
        <HelpPointUpdateContext.Provider value={stateHelpPointUpdate}>
        {children}
        </HelpPointUpdateContext.Provider>
    )
};

export const useHelpPointUpdateDialog = () => {
    const state  = useContext(HelpPointUpdateContext)
    if(!state) {
        throw new Error("useZoom has to be used within ZoomProvider");
    }
    return state
}

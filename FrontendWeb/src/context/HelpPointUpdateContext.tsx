import React from 'react';
import { createContext, useState, use } from 'react';
import { HelpPoint } from '../api/models/HelpPoint';

// Si HelpPoint es undefined entonces openDialgo = false
// lo contrario es openDialog = true

type StateHelpPointsUpdateContext = [ HelpPoint | undefined, React.Dispatch<React.SetStateAction<HelpPoint | undefined>> ]


export const HelpPointUpdateContext = createContext<StateHelpPointsUpdateContext | null>(null);

export function HelpPointUpdateProvider({ children } : { children : React.ReactNode}) {

    const stateHelpPointUpdate = useState<HelpPoint | undefined>()

    return (
        <HelpPointUpdateContext value={stateHelpPointUpdate}>
        {children}
        </HelpPointUpdateContext>
    )
};

export const useHelpPointUpdateDialog = () => {
    const state  = use(HelpPointUpdateContext)
    if(!state) {
        throw new Error("useHelpPointUpdateDialog has to be used within HelpPointUpdateProvider");
    }
    return state
}

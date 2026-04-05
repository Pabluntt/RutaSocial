import React from 'react';
import { createContext, useState, useContext } from 'react';
import { Risk } from '../api/models/Risk';

// Si Alert es undefined entonces openDialog = false
// lo contrario es openDialog = true

type StateRiskUpdateContext = [ Risk | undefined, React.Dispatch<React.SetStateAction<Risk | undefined>> ]


export const RiskUpdateContext = createContext<StateRiskUpdateContext | null>(null);

export function RiskUpdateProvider({ children } : { children : React.ReactNode}) {

    const stateRiskUpdate = useState<Risk | undefined>()

    return (
        <RiskUpdateContext.Provider value={stateRiskUpdate}>
        {children}
        </RiskUpdateContext.Provider>
    )
};

export const useRiskUpdateDialog = () => {
    const state  = useContext(RiskUpdateContext)
    if(!state) {
        throw new Error("useZoom has to be used within ZoomProvider");
    }
    return state
}

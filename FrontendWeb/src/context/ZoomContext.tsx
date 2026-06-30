import React from 'react';
import { createContext, useState, use } from 'react';


type StateZoomContext = [ boolean, React.Dispatch<React.SetStateAction<boolean>> ]


export const ZoomContext = createContext<StateZoomContext | null>(null);

export function ZoomProvider({ children } : { children : React.ReactNode}) {

    const [isZooming, setIsZooming] = useState(false);
    return (
        <ZoomContext value={[isZooming, setIsZooming]}>
        {children}
        </ZoomContext>
    )
};

export const useZoom = () => {
    const state  = use(ZoomContext)
    if(!state) {
        throw new Error("useZoom has to be used within ZoomProvider");
    }
    return state
}

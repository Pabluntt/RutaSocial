import { LatLngExpression } from "leaflet"
import { useEffect } from "react"
import { useMap } from "react-leaflet"




type LocationHandlerHistoryProps = {
    stateShowLocation : [ boolean, React.Dispatch<React.SetStateAction<boolean>> ]
    stateLocation : [ number[], React.Dispatch<React.SetStateAction<number[]>> ]
}


export default function HandlerLocationHistory({ stateLocation, stateShowLocation } : LocationHandlerHistoryProps) {
    
    const map = useMap()
    const [ showLocation, setShowLocation ] = stateShowLocation
    const [ location, _ ] = stateLocation

    useEffect(() => {
        if(showLocation) {
            map.flyTo(location as LatLngExpression, 18, {
                duration : 1
            })
            setShowLocation(false)
        }
    }, [showLocation])
    
    return null
};

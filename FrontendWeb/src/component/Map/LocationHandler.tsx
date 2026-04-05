import { useEffect } from "react"
import { Circle, LayerGroup, Marker, useMap } from "react-leaflet"
import { Position } from "../../utils/getCurrentLocation"
import { useZoom } from "../../context/ZoomContext"
import useSessionStore from "../../stores/useSessionStore"



type LocationHandlerProps = {
    stateShowLocation : [ boolean, React.Dispatch<React.SetStateAction<boolean>> ]
    stateCurrentLocation : [ Position, React.Dispatch<React.SetStateAction<Position>> ]
    stateErrorGeolocation : [GeolocationPositionError | undefined, React.Dispatch<React.SetStateAction<GeolocationPositionError | undefined>>]
}

export default function LocationHandler({ stateShowLocation, stateCurrentLocation, stateErrorGeolocation } : LocationHandlerProps)  {


    const map = useMap()
    const [ errorGeolocation, setErrorGeolocation ] = stateErrorGeolocation
    const { enableGPS, countRetryGPS } = useSessionStore()
    const [ showLocation, setShowLocation ] = stateShowLocation
    const [ currentLocation, setCurrentLocation ] = stateCurrentLocation
    const [ isZooming, ] = useZoom()

    useEffect(() => {

        if(!enableGPS) return 
        
        const handleSuccess = ( position : GeolocationPosition) => {
            setCurrentLocation({latitude : position.coords.latitude, longitude : position.coords.longitude})
            setErrorGeolocation(undefined)
        }
        const handleError = ( error : GeolocationPositionError) => {
            setErrorGeolocation(error)
        }
        const id = navigator.geolocation.watchPosition( handleSuccess, handleError, {
            enableHighAccuracy : true,
        })

        return () => {
            navigator.geolocation.clearWatch(id)
        }
    }, [enableGPS, countRetryGPS])


    useEffect(() => {
        if(showLocation && currentLocation.latitude) {
            map.flyTo([currentLocation.latitude, currentLocation.longitude], 17, {
                duration: 1,
            })
        }
    }, [showLocation, currentLocation])


    return (
        <>
            { enableGPS && !errorGeolocation ? 
                <LayerGroup>
                    <Marker position={[currentLocation.latitude, currentLocation.longitude]} zIndexOffset={100} />
                    { isZooming ? <></> : <Circle center={[currentLocation.latitude, currentLocation.longitude]} radius={30} /> }
                </LayerGroup>
                : 
                null
            }
        </>
    )
};

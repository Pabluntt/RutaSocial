import L from "leaflet"
import { useEffect } from "react"
import { Circle, LayerGroup, Marker, useMap } from "react-leaflet"
import { Position } from "../../utils/getCurrentLocation"
import { useZoom } from "../../context/ZoomContext"
import useSessionStore from "../../stores/useSessionStore"



interface LocationHandlerProps {
    stateShowLocation : [ boolean, React.Dispatch<React.SetStateAction<boolean>> ]
    stateCurrentLocation : [ Position, React.Dispatch<React.SetStateAction<Position>> ]
    stateErrorGeolocation : [GeolocationPositionError | undefined, React.Dispatch<React.SetStateAction<GeolocationPositionError | undefined>>]
}

const currentLocationIcon = L.divIcon({
    className: '',
    html: '<div style="width:22px;height:22px;border-radius:9999px;background:#2563eb;border:3px solid white;box-shadow:0 0 0 2px rgba(37,99,235,.25),0 2px 8px rgba(0,0,0,.35);"></div>',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
})

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
            maximumAge : 10000,
        })

        return () => {
            navigator.geolocation.clearWatch(id)
        }
    }, [enableGPS, countRetryGPS])


    useEffect(() => {
        if(showLocation && (currentLocation.latitude !== 0 || currentLocation.longitude !== 0)) {
            map.flyTo([currentLocation.latitude, currentLocation.longitude], 17, {
                duration: 1,
            })
        }
    }, [showLocation, currentLocation])


    return (
        <>
            { enableGPS && !errorGeolocation ? 
                <LayerGroup>
                    <Marker icon={currentLocationIcon} position={[currentLocation.latitude, currentLocation.longitude]} zIndexOffset={100} />
                    { isZooming ? <></> : <Circle center={[currentLocation.latitude, currentLocation.longitude]} radius={30} /> }
                </LayerGroup>
                : 
                null
            }
        </>
    )
};

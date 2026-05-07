import { useMapEvents } from "react-leaflet";
import { useEffect, useState } from "react";
import { Position } from "../../utils/getCurrentLocation";


type MapEventsProps = {
    setLocation : (coords : Position) => void, 
    stateOnSelectLocationMap : [ boolean, (value: boolean) => void ]
    stateDialogAttended : [ boolean, (value: boolean) => void ],
    stateDialogRisk : [ boolean, (value: boolean) => void ],
    stateAlojamientoSelection?: [ boolean, (value: boolean) => void ],
    stateDialogAlojamiento?: [ boolean, (value: boolean) => void ],
}

export default function MapEvents({setLocation, stateOnSelectLocationMap, stateDialogAttended, stateDialogRisk, stateAlojamientoSelection, stateDialogAlojamiento} : MapEventsProps) {
    
    const [ flag, setFlag ] = useState('')
    const [ openDialogAttended, setOpenDialogAttended ] = stateDialogAttended
    const [ openDialogRisk, setOpenDialogRisk ] = stateDialogRisk
    const [ selectingAlojamiento, setSelectingAlojamiento ] = stateAlojamientoSelection ?? [false, () => {}]
    const [ openDialogAlojamiento, setOpenDialogAlojamiento ] = stateDialogAlojamiento ?? [false, () => {}]
    const [ onSelectLocationMap, setOnSelectLocationMap ] = stateOnSelectLocationMap


    useEffect(() => {
        if(openDialogAttended) {
            setFlag('attended')
        } else if(openDialogRisk) {
            setFlag('risk')
        } else if(selectingAlojamiento) {
            setFlag('alojamiento')
        } else {
            setFlag('')
        }
    }, [ openDialogAttended, openDialogRisk, selectingAlojamiento])
    
    useMapEvents( {
        click(e: { latlng: { lat: number; lng: number } }) {
            setLocation({latitude: e.latlng.lat, longitude: e.latlng.lng})
            setOnSelectLocationMap(false)
            if(flag == 'risk') {
                setOpenDialogRisk(true)
                setFlag('')
            } else if(flag == 'attended') {
                setOpenDialogAttended(true)
                setFlag('')
            } else if(flag == 'alojamiento') {
                setOpenDialogAlojamiento(true)
                setSelectingAlojamiento(false)
                setFlag('')
            }
        },
    });
    return false
}
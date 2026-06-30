import { useMapEvents } from "react-leaflet";
import { useEffect, useState } from "react";
import { Position } from "../../utils/getCurrentLocation";


interface MapEventsProps {
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
        // Usar onSelectLocationMap para determinar el flag si estamos en modo selección
        if(onSelectLocationMap) {
            // Determinar qué diálogo estaba abierto antes
            if(openDialogAttended) {
                setFlag('attended')
            } else if(openDialogRisk) {
                setFlag('risk')
            } else if(selectingAlojamiento) {
                setFlag('alojamiento')
            }
        } else if(openDialogAttended) {
            setFlag('attended')
        } else if(openDialogRisk) {
            setFlag('risk')
        } else if(selectingAlojamiento) {
            setFlag('alojamiento')
        } else {
            setFlag('')
        }
    }, [ openDialogAttended, openDialogRisk, selectingAlojamiento, onSelectLocationMap])
    
    useMapEvents( {
        click(e: { latlng: { lat: number; lng: number } }) {
            setLocation({latitude: e.latlng.lat, longitude: e.latlng.lng})
            setOnSelectLocationMap(false)
            
            if(flag == 'risk') {
                setOpenDialogRisk(false)
                setTimeout(() => {
                    setOpenDialogRisk(true)
                }, 50)
            } else if(flag == 'attended') {
                setOpenDialogAttended(false)
                setTimeout(() => {
                    setOpenDialogAttended(true)
                }, 50)
            } else if(flag == 'alojamiento') {
                setOpenDialogAlojamiento(false)
                setTimeout(() => {
                    setOpenDialogAlojamiento(true)
                    setSelectingAlojamiento(false)
                }, 50)
            }
            setFlag('')
        },
    });
    return false
}

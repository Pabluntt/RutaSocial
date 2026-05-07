import { useMapEvents } from "react-leaflet";
import { useEffect, useState } from "react";
import { Position } from "../../utils/getCurrentLocation";


type MapEventsProps = {
    setLocation : (coords : Position) => void, 
    stateOnSelectLocationMap : [ boolean, React.Dispatch<React.SetStateAction<boolean>> ]
    stateDialogAttended : [ boolean, React.Dispatch<React.SetStateAction<boolean>> ],
    stateDialogRisk : [ boolean, React.Dispatch<React.SetStateAction<boolean>> ],
    stateDialogAlojamiento?: [ boolean, React.Dispatch<React.SetStateAction<boolean>> ],
}

export default function MapEvents({setLocation, stateOnSelectLocationMap, stateDialogAttended, stateDialogRisk, stateDialogAlojamiento} : MapEventsProps) {
    
    const [ flag, setFlag ] = useState('')
    const [ openDialogAttended, setOpenDialogAttended ] = stateDialogAttended
    const [ openDialogRisk, setOpenDialogRisk ] = stateDialogRisk
    const [ openDialogAlojamiento, setOpenDialogAlojamiento ] = stateDialogAlojamiento ?? [false, () => {}]
    const [ onSelectLocationMap, setOnSelectLocationMap ] = stateOnSelectLocationMap


    useEffect(() => {
        if(openDialogAttended) {
            setFlag('attended')
        } else if(openDialogRisk) {
            setFlag('risk')
        } else if(openDialogAlojamiento) {
            setFlag('alojamiento')
        }
    }, [ openDialogAttended, openDialogRisk, openDialogAlojamiento])
    
    useMapEvents( {
        click(e) {
            setLocation({latitude: e.latlng.lat, longitude: e.latlng.lng})
            setOnSelectLocationMap(false)
            if(flag == 'risk') {
                setOpenDialogRisk(true)
            } else if(flag == 'attended') {
                setOpenDialogAttended(true)
            } else if(flag == 'alojamiento') {
                setOpenDialogAlojamiento(true)
            }
        },
    });
    return false
}
import { useMapEvent } from "react-leaflet";
import { useZoom } from "../../context/ZoomContext";





export default function ZoomHandler() {

    const [ , setIsZooming ] = useZoom()

    useMapEvent('zoomstart', () => {setIsZooming(true)})
    useMapEvent('zoomend', () => {setIsZooming(false)})

    return null
};

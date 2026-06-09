import L, { LatLngExpression } from "leaflet";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap, ZoomControl } from "react-leaflet";
import { Button, Divider, Chip, Paper, Box, Typography } from "@mui/material";
import { format } from 'date-fns';
import { Position } from "../../utils/getCurrentLocation";
import { useEffect, useState } from "react";
import ZoomHandler from "./ZoomHandler";
import { useRiskUpdateDialog } from "../../context/RiskUpdateContext";
import { HelpPoint } from "../../api/models/HelpPoint";
import { Risk } from "../../api/models/Risk";
import { es } from "date-fns/locale";
import { RiskStatus } from "../../Enums/RiskStatus";
import 'leaflet.heat'

var redIcon = new L.Icon({
    iconUrl: 'marker-icon-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });


var alertIcon = new L.Icon({
    iconUrl: 'warning-alert-green.svg',
    iconSize: [30, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
})


const iconsMap = {
    [RiskStatus.Severe]: new L.Icon({ iconUrl : 'warning-alert-severe.svg', iconSize: [30, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowAnchor: [41, 41]}),
    [RiskStatus.Warning]: new L.Icon({ iconUrl : 'warning-alert-warning.svg', iconSize: [30, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowAnchor: [41, 41]}),
    [RiskStatus.Completed]: new L.Icon({ iconUrl : 'warning-alert-completed.svg', iconSize: [41,61], iconAnchor: [12, 41], popupAnchor: [8, -34], shadowAnchor: [41, 41]}),
    [RiskStatus.Enviroment]: new L.Icon({ iconUrl : 'warning-alert-enviroment.svg', iconSize: [30, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowAnchor: [41, 41]}),
} satisfies Record<RiskStatus, L.Icon>;

function HeatmapLayer({ helpPoints, showHeatmap }: { helpPoints: HelpPoint[], showHeatmap: boolean }) {
    const map = useMap();
    const [heatmapLayer, setHeatmapLayer] = useState<any>(null);

    useEffect(() => {

        if (heatmapLayer) {
            map.removeLayer(heatmapLayer);
            setHeatmapLayer(null);
        }

        if (showHeatmap && helpPoints.length > 0) {
            const heatData = helpPoints
                .filter(hp => !hp.disabled)
                .map(hp => [hp.coords[0], hp.coords[1], 1]);

            const heat = (L as any).heatLayer(heatData, {
                radius: 25,
                blur: 15,
                maxZoom: 17,
                max: 1.0,
                gradient: {
                    0.1: 'blue',
                    0.2: 'cyan',
                    0.4: 'lime',
                    0.6: 'yellow',
                    0.8: 'orange',
                    1.0: 'red'
                }
            });

            map.addLayer(heat);
            setHeatmapLayer(heat);
        }

        return () => {
            if (heatmapLayer) {
                map.removeLayer(heatmapLayer);
                setHeatmapLayer(null);
            }
        };
    }, [map, helpPoints, showHeatmap]);

    useEffect(() => {
        return () => {
            if (heatmapLayer) {
                map.removeLayer(heatmapLayer);
            }
        };
    }, [heatmapLayer, map]);

    return null;
}

function getPointPeople(helpPoint: HelpPoint) {
    return helpPoint.people.length > 0
        ? helpPoint.people
        : helpPoint.peopleHelped
            ? [helpPoint.peopleHelped]
            : []
}

type MapaProps = {
    stateCurrentLocation : [ Position, React.Dispatch<React.SetStateAction<Position>> ]
    helpPoints : HelpPoint[]
    risks : Risk[]
    children ?: React.ReactNode
    enableTraceLine ?: boolean
    showHeatmap ?: boolean
} 


export default function Mapa({ stateCurrentLocation, risks, helpPoints, children, enableTraceLine, showHeatmap } : MapaProps) {

    const [ currentLocation,  ] = stateCurrentLocation
    const [ mapTracedLineRoute, setMapTracedLineRoute ] = useState<Map<string, LatLngExpression[]>>(new Map<string, LatLngExpression[]>())


    useEffect(() => {
        if(enableTraceLine) {
            const map = helpPoints.reduce<Map<string, LatLngExpression[]>>((acc : Map<string, LatLngExpression[]>, hp) => {
                if(hp.disabled) return acc 

                if(!acc.has(hp.routeID)) {
                    acc.set(hp.routeID, [])
                }
                acc.set(hp.routeID, [...(acc.get(hp.routeID) as LatLngExpression[]), [hp.coords[0], hp.coords[1]] ])
                return acc
            }, new Map<string, LatLngExpression[]>())
            setMapTracedLineRoute(map)
        } 
    }, [enableTraceLine, helpPoints])



    const [ _, setRiskUpdate] = useRiskUpdateDialog()
    
    return (
        <>
            <MapContainer 
                center={ [currentLocation.latitude || -29.959003986327698, currentLocation.longitude || -71.34176826076656] } 
                zoom={ 30 } 
                scrollWheelZoom={true} 
                className="h-full w-full z-0"
                zoomControl={false}
                preferCanvas
            >
                <ZoomControl position="bottomleft" />
                <TileLayer
                    attribution="Google Maps"
                    url="https://www.google.cn/maps/vt?lyrs=m@189&gl=cn&x={x}&y={y}&z={z}"
                />
                
                <ZoomHandler />
                <HeatmapLayer helpPoints={helpPoints} showHeatmap={showHeatmap as boolean} />

                {!showHeatmap && helpPoints.map((helpPoint, index) => (
                    helpPoint.disabled ? null : 
                    <Marker key={helpPoint.id ?? index} icon={redIcon} position={(helpPoint.coords as L.LatLngExpression)} >
                        <Popup >
                            <Paper elevation={0} sx={{ minWidth: 240, p: 1 }}>
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <Chip label="Punto de registro" size="small" color="error" variant="outlined" sx={{ fontWeight: 600, fontSize: 11 }} />
                                    </div>
                                    <Divider />
                                    <div className="flex flex-col gap-1.5 text-sm">
                                        <div className="flex items-start gap-1">
                                            <span className="font-semibold text-gray-600 min-w-20">Comentario:</span>
                                            <span>{helpPoint.comment?.trim() || 'Sin comentario'}</span>
                                        </div>
                                        <div className="flex items-start gap-1">
                                            <span className="font-semibold text-gray-600 min-w-20">Fecha:</span>
                                            <span>{format(helpPoint.dateRegister, 'dd-MM-yyyy', {locale : es})}</span>
                                        </div>
                                    </div>
                                    <Divider />
                                    <div className="flex flex-col gap-2">
                                        <span className="font-semibold text-sm text-gray-700">Personas vistas</span>
                                        {getPointPeople(helpPoint).length > 0 ? getPointPeople(helpPoint).map((person, personIndex) => (
                                            <Paper key={`${helpPoint.id}-${personIndex}`} variant="outlined" sx={{ p: 1.5, borderRadius: 1.5, bgcolor: '#fafafa' }}>
                                                <div className="flex flex-col gap-1 text-sm">
                                                    <div className="flex items-start gap-1">
                                                        <span className="font-semibold text-gray-500 min-w-14">Nombre:</span>
                                                        <span>{person.name || 'Sin especificar'}</span>
                                                    </div>
                                                    <div className="flex items-start gap-1">
                                                        <span className="font-semibold text-gray-500 min-w-14">Edad:</span>
                                                        <span>{person.age > 0 ? person.age : 'N/A'}</span>
                                                    </div>
                                                    <div className="flex items-start gap-1">
                                                        <span className="font-semibold text-gray-500 min-w-14">RUT:</span>
                                                        <span>{person.rut || 'Sin especificar'}</span>
                                                    </div>
                                                    <div className="flex items-start gap-1">
                                                        <span className="font-semibold text-gray-500 min-w-14">Género:</span>
                                                        <span>{person.gender || 'Sin especificar'}</span>
                                                    </div>
                                                </div>
                                            </Paper>
                                        )) : (
                                            <span className="text-sm text-gray-500 italic">Sin personas registradas en este punto</span>
                                        )}
                                    </div>
                                </div>
                            </Paper>
                        </Popup>
                    </Marker>
                ))}

                {!showHeatmap && Array.from(mapTracedLineRoute.entries()).map(([routeId, coords ], index) => (
                    <Polyline 
                        key={index}
                        pathOptions={{
                            color : '#800022',
                            opacity : 0.5,
                            weight : 3,
                            dashArray: '5, 10'
                        }} 
                        positions={coords}
                    />
                ))}

                {risks.map((risk, index) => (
                    <Marker key={risk.id ?? index} icon={iconsMap[risk.status]} position={(risk.coords as L.LatLngExpression)}>
                        <Popup>
                            <Paper elevation={0} sx={{ minWidth: 200, p: 1 }}>
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <Chip 
                                            label={risk.status} 
                                            size="small" 
                                            color={
                                                risk.status === RiskStatus.Severe ? 'error' :
                                                risk.status === RiskStatus.Warning ? 'warning' :
                                                risk.status === RiskStatus.Completed ? 'success' : 'info'
                                            }
                                            variant="outlined"
                                            sx={{ fontWeight: 600, fontSize: 11 }}
                                        />
                                    </div>
                                    <Typography className="text-sm font-medium">{risk.description}</Typography>
                                    <Divider />
                                    <div className="flex flex-col gap-1 text-xs text-gray-500">
                                        <span>Última modificación: {format(new Date(risk.createdAt), 'dd-MM-yyyy')}</span>
                                    </div>
                                    <Button 
                                        variant="contained" 
                                        size="small"
                                        sx={{ alignSelf: 'flex-start', textTransform: 'none' }}
                                        onClick={() => setRiskUpdate(risk)}
                                    >
                                        Editar
                                    </Button>
                                </div>
                            </Paper>
                        </Popup>
                    </Marker>
                ))}
                {children}
            </MapContainer>
        </>
    )
};

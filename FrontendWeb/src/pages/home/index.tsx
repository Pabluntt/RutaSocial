import { useEffect, useState } from "react";
import DrawerList from "../../component/DrawerList";
import CustomDrawer from "../../component/CustomDrawer";
import { Backdrop, Card, Typography, useMediaQuery, useTheme, Fab, Tooltip } from "@mui/material";
import MensajesFijados from "../../component/MensajesFijados";
import DialogCreateRoute from "../../component/Dialog/DialogCreateRoute";
import useSessionStore from "../../stores/useSessionStore";
import ButtonFinalizarRuta from "../../component/Button/ButtonFinalizarRuta";
import SpeedDialRoute from "../../component/Button/SpeedDialRoute";
import { Position } from "../../utils/getCurrentLocation";
import DialogCreateAttended from "../../component/Dialog/DialogCreateAttended";
import DialogCreateRisk from "../../component/Dialog/DialogCreateRisk";
import DialogResumeRoute from "../../component/Dialog/DialogResumeRoute";
import MapEvents from "../../component/Map/MapEvents";
import Mapa from "../../component/Map/Mapa";
import ButtonCurrentLocation from "../../component/Map/ButtonCurrentLocation";
import LocationHandler from "../../component/Map/LocationHandler";
import SpeedDialCreateRoute from "../../component/Button/SpeedDialCreateRoute";
import DialogJoinRoute from "../../component/Dialog/DialogJoinRoute";
import DialogCreateAlojamiento from "../../component/Dialog/DialogCreateAlojamiento";
import HotelIcon from '@mui/icons-material/Hotel';
import { Marker, Popup } from 'react-leaflet'
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../component/Sidebar";
import DialogUpdateRisk from "../../component/Dialog/DialogUpdateRisk";
import { LocationMethod } from "../../Enums/LocationMethod";
import { Risk } from "../../api/models/Risk";
import { HelpPoint } from "../../api/models/HelpPoint";
import { useRisks } from "../../api/hooks/RiskHooks";
import { useHelpPoints } from "../../api/hooks/HelpPointHooks";
import type { AlojamientoData } from "../../component/Dialog/DialogCreateAlojamiento";



export type TUserRegister = {
    name : string
    age : number 
    gender: string
}

const ALOJAMIENTOS_STORAGE_KEY = 'rutasocial-alojamientos'

export default function Home() {

    const { role, loading } = useAuth()
    const { accessToken } = useSessionStore()
    const { routeStatus, routeId } = useSessionStore()
    const [ openDialRoute, setOpenDialRoute ] = useState(false)
    const [ onSelectLocationMap, setOnSelectLocationMap ] = useState(false)

    const [ openDialogRoute, setOpenDialogRoute ] = useState(false)
    const [ openDialogResumeRoute, setOpenDialogResumeRoute ] = useState(false)
    const [ openDialogAttended, setOpenDialogAttended] = useState(false) 
    const [ openDialogRisk, setOpenDialogRisk ] = useState(false)

    const stateDescriptionRisk = useState('')
    const [ attendedP, setAttendedP ] = useState<TUserRegister>({
        name: 'Sin especificar',
        age: -1,
        gender : 'Sin especificar'
    })
    const [ locationMethod, setLocationMethod ] = useState<LocationMethod>(LocationMethod.None)
    
    // Estado para personas en el diálogo de punto de atención
    // Se mantiene en el padre para no perderse si el diálogo se desmonta
    const [ attendedPeople, setAttendedPeople ] = useState<{ id: string; name: string; rut: string; age: string }[]>(() => [
        { id: `${Date.now()}-${Math.random()}`, name: '', rut: '', age: '' }
    ])
    
    // Estado para coordenadas del diálogo de punto de atención
    const [ attendedCoords, setAttendedCoords ] = useState<number[]>([])

    const [ risks, setRisks ] = useState<Risk[]>([])
    const [ helpPoints, setHelpPoints ] = useState<HelpPoint[]>([])

    const riskQuery = useRisks()
    const helpPointQuery = useHelpPoints()


    const [ location, setLocation ] = useState<Position>({latitude : 0, longitude : 0})
    const [ currentLocation, setCurrentLocation ] = useState<Position>({latitude : 0, longitude : 0})
    const [ showLocation, setShowLocation ] = useState(false)

    const [ errorGeolocation, setErrorGeolocation ] = useState<GeolocationPositionError | undefined>()


    const [ openSpeedCreateRoute, setOpenSpeedCreateRoute ] = useState(false)
    const stateOpenCreateRoute = useState(false)
    const stateOpenJoinRoute = useState(false)
    const [ openDialogAlojamiento, setOpenDialogAlojamiento ] = useState(false)
    const [ selectingAlojamiento, setSelectingAlojamiento ] = useState(false)
    const [ alojamientos, setAlojamientos ] = useState<AlojamientoData[]>([])

    useEffect(() => {
        const storedAlojamientos = localStorage.getItem(ALOJAMIENTOS_STORAGE_KEY)

        if(!storedAlojamientos) {
            return
        }

        try {
            const parsedAlojamientos = JSON.parse(storedAlojamientos) as AlojamientoData[]
            if(Array.isArray(parsedAlojamientos)) {
                setAlojamientos(parsedAlojamientos)
            }
        } catch {
            localStorage.removeItem(ALOJAMIENTOS_STORAGE_KEY)
        }
    }, [])

    useEffect(() => {
        localStorage.setItem(ALOJAMIENTOS_STORAGE_KEY, JSON.stringify(alojamientos))
    }, [alojamientos])

    const handleCreateAlojamiento = (data: AlojamientoData) => {
        setAlojamientos(prev => [...prev, data])
    }

    const handleUpdateAlojamientoCupos = (id: string, cupos: number) => {
        setAlojamientos(prev => prev.map((alojamiento) => (
            alojamiento.id === id
                ? { ...alojamiento, cupos: Math.max(0, cupos) }
                : alojamiento
        )))
    }

    useEffect(() => {
        if(riskQuery.data) {
            setRisks(riskQuery.data)
        }
        if(helpPointQuery.data) {
            // Si hay una ruta activa, filtrar solo los puntos de esa ruta
            if(routeStatus && routeId) {
                const filteredPoints = helpPointQuery.data.filter(hp => hp.routeID === routeId)
                setHelpPoints(filteredPoints)
            } else {
                setHelpPoints(helpPointQuery.data)
            }
        }
    }, [riskQuery.data, helpPointQuery.data, routeStatus, routeId])

    useEffect(() => {
        console.log("ROL DEL USUARIO: ", role)
    }, [loading])



    const theme = useTheme();
    const computerDevice = useMediaQuery(theme.breakpoints.up('sm'));

    return (
        <div className="flex flex-grow">
            { !onSelectLocationMap ?
                computerDevice ? 
                    <div className="flex z-20">
                        <Sidebar />
                    </div>
                    :
                    <div className="absolute top-4 z-20 left-2">
                        <CustomDrawer DrawerList={DrawerList} />
                    </div>
                :
                <></>
            }
            <div className={`relative flex grow flex-col justify-between`}>
                <Mapa
                    stateCurrentLocation={[currentLocation, setCurrentLocation]}
                    helpPoints={helpPoints}
                    risks={risks}
                >
                    {alojamientos.map((a, i) => (
                        <Marker key={a.id ?? i} position={[a.coords[0], a.coords[1]]}>
                            <Popup>
                                <div className="flex min-w-44 flex-col items-start gap-2">
                                    <b>{a.name}</b>
                                    <div className="flex w-full flex-col gap-1">
                                        <span>Cupos disponibles</span>
                                        <input
                                            className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                                            type="number"
                                            min={0}
                                            value={a.cupos}
                                            onChange={(event: { target: { value: string } }) => handleUpdateAlojamientoCupos(a.id, Number(event.target.value) || 0)}
                                        />
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                    <MapEvents 
                        setLocation={setLocation}
                        stateOnSelectLocationMap={[onSelectLocationMap, setOnSelectLocationMap]}
                        stateDialogAttended={[openDialogAttended, setOpenDialogAttended]}
                        stateDialogRisk={[openDialogRisk, setOpenDialogRisk]}
                        stateAlojamientoSelection={[selectingAlojamiento, setSelectingAlojamiento]}
                        stateDialogAlojamiento={[openDialogAlojamiento, setOpenDialogAlojamiento]}
                    />
                    <LocationHandler 
                        stateErrorGeolocation={[errorGeolocation, setErrorGeolocation]}
                        stateShowLocation={[showLocation, setShowLocation]}
                        stateCurrentLocation={[currentLocation, setCurrentLocation]}                        
                    />
                </Mapa>
                <ButtonCurrentLocation stateShowLocation={[ showLocation, setShowLocation ]} stateErrorGeolocation={[errorGeolocation, setErrorGeolocation]}/>

                { !onSelectLocationMap ?
                    <>
                        <MensajesFijados />
                        <Backdrop open={openDialRoute} className="z-10"/>
                        <Backdrop open={openSpeedCreateRoute} className="z-10"/>
                        { routeStatus ? 
                            <ButtonFinalizarRuta /> 
                            : 
                            null
                        }
                        <div className={"absolute bottom-16 z-20 flex flex-row items-end gap-3 " + (computerDevice ? "right-16" : "right-8")}>
                            {!routeStatus ? 
                                <>
                                    <SpeedDialCreateRoute
                                        stateOpen={[openSpeedCreateRoute, setOpenSpeedCreateRoute]}
                                        stateOpenCreateRoute={stateOpenCreateRoute}
                                        stateOpenJoinRoute={stateOpenJoinRoute}
                                    >
                                        <DialogCreateRoute stateOpen={stateOpenCreateRoute} />
                                        <DialogJoinRoute stateOpen={stateOpenJoinRoute} />
                                    </SpeedDialCreateRoute>
                                    <Tooltip title="Crear alojamiento">
                                        <Fab 
                                            color="secondary" 
                                            size="large"
                                            onClick={() => {
                                                setOnSelectLocationMap(true)
                                                setSelectingAlojamiento(true)
                                                setOpenDialogAlojamiento(false)
                                            }}
                                        >
                                            <HotelIcon />
                                        </Fab>
                                    </Tooltip>
                                </>
                                :
                                <SpeedDialRoute 
                                    stateOpen={[ openDialRoute, setOpenDialRoute ]}
                                    stateOpenDialogAttended={[ openDialogAttended, setOpenDialogAttended ]}
                                    stateOpenDialogRisk={[ openDialogRisk, setOpenDialogRisk ]}
                                    stateOpenDialogRoute={[ openDialogResumeRoute, setOpenDialogResumeRoute ]}
                                >
                                    <DialogCreateAttended 
                                        stateAttended={[attendedP, setAttendedP]}
                                        stateOpen={[openDialogAttended, setOpenDialogAttended]} 
                                        stateOnSelectLocationMap={[ onSelectLocationMap, setOnSelectLocationMap]} 
                                        stateLocationMethod={[locationMethod, setLocationMethod]}
                                        statePeople={[attendedPeople, setAttendedPeople]}
                                        stateCoords={[attendedCoords, setAttendedCoords]}
                                        location={location}
                                    />
                                    <DialogCreateRisk 
                                        stateOpen={[openDialogRisk, setOpenDialogRisk]} 
                                        stateOnSelectLocationMap={[ onSelectLocationMap, setOnSelectLocationMap]}
                                        stateLocationMethod={[ locationMethod, setLocationMethod ]}
                                        location={location}
                                        stateDescription={stateDescriptionRisk}
                                    />
                                    <DialogResumeRoute 
                                        stateOpen={[ openDialogResumeRoute, setOpenDialogResumeRoute ]} 
                                    />
                                </SpeedDialRoute>
                            }
                        </div>
                    </>
                    :
                    <Card
                        sx={{
                            position: "absolute", top: "10%", left: "50%", transform: "translate(-50%, -50%)",
                            bgcolor: "rgba(46, 46, 46, 0.9)", px: 3, py: 2, borderRadius: 2, boxShadow: 3,
                            zIndex: 1000, display: "flex", alignItems: "center", gap: 1,
                        }}
                        >
                        <Typography color="white" variant="h6" fontWeight={500}>
                            Selecciona un punto en el mapa
                        </Typography>
                    </Card>
                }
            </div>
            <DialogCreateAlojamiento stateOpen={[openDialogAlojamiento, setOpenDialogAlojamiento]} location={location} onCreate={handleCreateAlojamiento} />
            <DialogUpdateRisk />
        </div>
    )
} 
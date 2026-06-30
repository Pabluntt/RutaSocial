import { Paper, IconButton, Typography, Collapse, Fade } from "@mui/material";
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import GpsOffIcon from '@mui/icons-material/GpsOff';
import CloseIcon from '@mui/icons-material/Close'
import { useEffect, useState } from "react";
import useSessionStore from "../../stores/useSessionStore";
import getCurrentLocation, { Position } from "../../utils/getCurrentLocation";

interface CurrentLocationProps {
    stateShowLocation : [ boolean, React.Dispatch<React.SetStateAction<boolean>> ]
    stateCurrentLocation : [ Position, React.Dispatch<React.SetStateAction<Position>> ]
    stateErrorGeolocation : [GeolocationPositionError | undefined, React.Dispatch<React.SetStateAction<GeolocationPositionError | undefined>>]
}

export default function ButtonCurrentLocation({ stateShowLocation, stateCurrentLocation, stateErrorGeolocation} : CurrentLocationProps) {

    const { enableGPS, setEnableGPS, countRetryGPS, setCountRetryGPS } = useSessionStore()
    const [ , setShowLocation ] = stateShowLocation
    const [ , setCurrentLocation ] = stateCurrentLocation
    const [ errorGeolocation, _] = stateErrorGeolocation

    useEffect(() => {
        setOpen(!enableGPS)
    }, [enableGPS])

    useEffect(() => {
        if(errorGeolocation) {
            setOpen(true)
        }
    }, [errorGeolocation])

    const handleClick = async () => {
        try {
            const pos = await getCurrentLocation()
            setCurrentLocation(pos)
        } catch {
            // Si falla la obtención de alta precisión, continuamos de todas formas
        }
        if(!enableGPS) {
            setEnableGPS(true)
        }
        setShowLocation(true);
        setTimeout(() => { setShowLocation(false); }, 1000) 
    }

    const handleRetryGPS = () => {
        setCountRetryGPS(countRetryGPS + 1)
    }

    const [ open, setOpen ] = useState(!enableGPS)

    return (
        <>
            <Paper elevation={3} sx={{ position: 'absolute', bottom: 80, left: 12, borderRadius: '12px', overflow: 'visible' }}>
                <div className="relative inline-block">
                    <Fade in={open} style={{ transitionDelay : '800ms'}}>
                        <Paper
                            elevation={4}
                            sx={{
                                position: 'absolute',
                                bottom: '100%',
                                mb: 1.5,
                                left: 0,
                                width: errorGeolocation ? 260 : 220,
                                p: 1,
                                borderRadius: '10px',
                                border: '1px solid',
                                borderColor: errorGeolocation ? '#FFA726' : '#42a5f5',
                                bgcolor: errorGeolocation ? '#fff3e0' : '#e3f2fd',
                            }}
                        >
                            <div className="flex items-start gap-1">
                                <Typography variant="caption" sx={{ flex: 1, fontSize: '0.75rem', lineHeight: 1.4 }}>
                                    { !errorGeolocation ?
                                        '¡Revisa tu ubicación actual!' 
                                        :
                                        'ERROR: ' + errorGeolocation.message
                                    }
                                </Typography>
                                <IconButton
                                    size="small"
                                    onClick={() => { setOpen(false); }}
                                    sx={{ p: 0.25, mt: -0.25 }}
                                >
                                    <CloseIcon fontSize="inherit" />
                                </IconButton>
                            </div>
                        </Paper>
                    </Fade>
                    <IconButton 
                        size="small" 
                        onClick={errorGeolocation ? handleRetryGPS : handleClick} 
                        sx={{
                            bgcolor: errorGeolocation ? '#ffebee' : '#e3f2fd',
                            borderRadius: '10px',
                            p: 1,
                            '&:hover': {
                                bgcolor: errorGeolocation ? '#ffcdd2' : '#bbdefb',
                            },
                            transition: 'all 0.2s ease',
                        }}
                    >
                        { !enableGPS || errorGeolocation ? <GpsOffIcon color="error" fontSize="small" />  : <GpsFixedIcon color="primary" fontSize="small"/>}
                    </IconButton>
                </div>
            </Paper>
        </>
    )
};

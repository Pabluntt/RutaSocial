import { Paper, IconButton, Popover, Typography, Alert, Collapse, Fade } from "@mui/material";
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import GpsOffIcon from '@mui/icons-material/GpsOff';
import CloseIcon from '@mui/icons-material/Close'
import { useEffect, useState } from "react";
import useSessionStore from "../../stores/useSessionStore";


type CurrentLocationProps = {
    stateShowLocation : [ boolean, React.Dispatch<React.SetStateAction<boolean>> ]
    stateErrorGeolocation : [GeolocationPositionError | undefined, React.Dispatch<React.SetStateAction<GeolocationPositionError | undefined>>]
}

export default function ButtonCurrentLocation({ stateShowLocation, stateErrorGeolocation} : CurrentLocationProps) {

    const { enableGPS, setEnableGPS, countRetryGPS, setCountRetryGPS } = useSessionStore()
    const [ , setShowLocation ] = stateShowLocation
    const [ errorGeolocation, _] = stateErrorGeolocation


    useEffect(() => {
        setOpen(!enableGPS)
    }, [enableGPS])

    useEffect(() => {
        if(errorGeolocation) {
            setOpen(true)
        }
    }, [errorGeolocation])


    const handleClick = () => {
        if(!enableGPS) {
            setEnableGPS(true)
        }
        setShowLocation(true);
        setTimeout(() => setShowLocation(false), 300) 
    }

    const handleRetryGPS = () => {
        setCountRetryGPS(countRetryGPS + 1)
    }

    const [ open, setOpen ] = useState(!enableGPS)


    useEffect(() => {
        console.log("estado open alerta: ", open)
        console.log("Error geolocation: ", errorGeolocation)
    }, [open])
    

    return (
        <>
            <Paper className="absolute bottom-20 left-3">
                <div className="relative inline-block">
                    <Fade in={open} style={{ transitionDelay : '1000ms'}}>
                        <Alert 
                        severity={ errorGeolocation ? 'warning' : 'info'}
                        color={ errorGeolocation ? 'warning' : 'info'} 
                        className={`absolute bottom-full text-center my-2 w-40 ${ errorGeolocation ? "lg:w-65" : "lg:w-60"}`}
                        sx={{
                            padding: 0,
                            fontSize : {
                                xs : '0.65rem',
                                sm : '0.80rem',
                                md : '0.85rem'
                            },
                            overflow: 'visible',
                            border: `1px solid ${errorGeolocation ? "#FFA726" : "#2c78db"}`, // #FFA726
                            '&:before': {
                                content: '""',
                                display: 'block',
                                position: 'absolute',
                                bottom: -9,
                                left: 9,
                                width: 10,
                                height: 10,
                                backgroundColor: 'inherit',
                                transform: 'translateY(-50%) rotate(225deg)',
                                boxShadow: `-1px -1px 0 0 ${errorGeolocation ? "#FFA726" : "#2c78db"}`
                            }
                        }}
                        slotProps={{
                            icon: {
                                sx : {
                                    marginX : 1,
                                    alignSelf : 'center'
                                }
                            },
                            action : {
                                sx : {
                                    marginRight : 0,
                                    padding : 0,
                                }
                            }
                        }}
                        action={
                            <IconButton
                                sx={{
                                    alignSelf : 'center',
                                }}
                                aria-label="close"
                                color="inherit"
                                size="small"
                                onClick={() => {
                                    setOpen(false);
                                }}
                            >
                                <CloseIcon fontSize="inherit" />
                            </IconButton>
                        }
                        >
                        { !errorGeolocation ?
                            'Revisa tu ubicación actual!' 
                            :
                            'ERROR: ' + errorGeolocation.message
                        }
                        </Alert>
                    </Fade>
                    <IconButton 
                        size="small" 
                        onClick={errorGeolocation ? handleRetryGPS : handleClick} 
                        color={errorGeolocation ? 'error' : 'primary'}
                    >
                        { !enableGPS || errorGeolocation ? <GpsOffIcon color="error" fontSize="small" />  : <GpsFixedIcon fontSize="small"/>}
                    </IconButton>
                </div>
            </Paper>
        </>
    )
};

import { Button, Typography, Paper } from "@mui/material";
import DialogFinishRoute from "../Dialog/DialogFinishRoute";
import DialogLeaveRoute from "../Dialog/DialogLeaveRoute";
import { useState } from "react";
import useSessionStore from "../../stores/useSessionStore";
import { useRoute } from "../../api/hooks/RouteHooks";
import { useProfile } from "../../api/hooks/UserHooks";

export default function ButtonFinalizarRuta() {

    const { routeId } = useSessionStore()
    const { data: route, isLoading: routeLoading } = useRoute(routeId as string)
    const { data: profile, isLoading: profileLoading } = useProfile()

    const [ openFinish, setOpenFinish ] = useState(false)
    const [ openLeave, setOpenLeave ] = useState(false)

    if (routeLoading || profileLoading) return null

    const isLeader = route?.routeLeader === profile?.id

    if (isLeader) {
        return (
            <Paper elevation={4} sx={{ borderRadius: 0, position: 'absolute', width: '100%', zIndex: 10 }}>
                <Button 
                    className="grow" 
                    size="large" 
                    variant="contained" 
                    fullWidth 
                    sx={{ 
                        borderRadius: 0,
                        py: 1.5,
                        background: 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)',
                        fontSize: '1rem',
                        fontWeight: 600,
                        letterSpacing: '0.5px',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                        },
                    }}
                    onClick={() => {setOpenFinish(true)}}
                >
                    Finalizar Ruta
                </Button>
                <DialogFinishRoute open={openFinish} setOpen={setOpenFinish}/>
            </Paper>
        )
    }

    return (
        <Paper elevation={4} sx={{ borderRadius: 0, position: 'absolute', width: '100%', zIndex: 10 }}>
            <div className="flex w-full h-12 items-center px-3 gap-2" style={{ background: 'linear-gradient(135deg, #f57c00 0%, #e65100 100%)' }}>
                <Typography className="grow text-white text-sm text-center font-medium">
                    Solo el líder de la ruta puede finalizarla
                </Typography>
                <Button 
                    size="small" 
                    variant="contained" 
                    color="error"
                    sx={{ 
                        borderRadius: '8px',
                        whiteSpace: 'nowrap',
                        minWidth: 'auto',
                        fontWeight: 600,
                        textTransform: 'none',
                        px: 2,
                    }}
                    onClick={() => {setOpenLeave(true)}}
                >
                    Salir de Ruta
                </Button>
                <DialogLeaveRoute open={openLeave} setOpen={setOpenLeave}/>
            </div>
        </Paper>
    )
};

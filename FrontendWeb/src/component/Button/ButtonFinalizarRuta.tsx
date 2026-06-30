import { Button, Typography } from "@mui/material";
import DialogFinishRoute from "../Dialog/DialogFinishRoute";
import DialogLeaveRoute from "../Dialog/DialogLeaveRoute";
import { useEffect, useState } from "react";
import useSessionStore from "../../stores/useSessionStore";
import { useRoute } from "../../api/hooks/RouteHooks";
import { useProfile } from "../../api/hooks/UserHooks";
import { RouteStatus } from "../../Enums/RouteStatus";

export default function ButtonFinalizarRuta() {

    const { routeId, setRouteId, setRouteStatus } = useSessionStore()
    const { data: route, isLoading: routeLoading, isError: routeError } = useRoute(routeId ?? '', !!routeId)
    const { data: profile, isLoading: profileLoading } = useProfile()

    const [ openFinish, setOpenFinish ] = useState(false)
    const [ openLeave, setOpenLeave ] = useState(false)

    useEffect(() => {
        if (!routeId) {
            setRouteStatus(false)
            setRouteId(undefined)
            return
        }

        if (!route || !profile) return

        const userInRoute = route.routeLeader === profile.id || route.team.includes(profile.id)
        if (route.status === RouteStatus.Completed || !userInRoute) {
            setRouteStatus(false)
            setRouteId(undefined)
        }
    }, [profile, route, routeError, routeId, setRouteId, setRouteStatus])

    if (routeLoading || profileLoading) return null
    if (!route || !profile || routeError) return null

    const isLeader = route && profile && route.routeLeader === profile.id

    if (isLeader) {
        return (
            <div className="flex absolute w-full h-11">
                <Button 
                    className="grow" 
                    size="large" 
                    variant="contained" 
                    color="error" 
                    fullWidth 
                    sx={{ border : 'none', borderRadius: 0}}
                    onClick={() => {setOpenFinish(true)}}
                >
                    Finalizar Ruta
                </Button>
                <DialogFinishRoute open={openFinish} setOpen={setOpenFinish}/>
            </div>
        )
    }

    return (
        <div className="flex absolute w-full h-11 items-center bg-orange-500 px-2 gap-2">
            <Typography className="grow text-white text-sm text-center font-medium">
                El líder debe finalizar la ruta
            </Typography>
            <Button 
                size="small" 
                variant="contained" 
                color="error"
                sx={{ border : 'none', borderRadius: 1, whiteSpace: 'nowrap', minWidth: 'auto' }}
                onClick={() => {setOpenLeave(true)}}
            >
                Salir de Ruta
            </Button>
            <DialogLeaveRoute open={openLeave} setOpen={setOpenLeave}/>
        </div>
    )
};

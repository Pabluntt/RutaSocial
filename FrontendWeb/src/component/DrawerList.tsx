import { Button, Typography, useTheme, useMediaQuery } from "@mui/material";
import { useNavigate } from "react-router-dom";
import useSessionStore from "../stores/useSessionStore";
import { useAuth } from "../context/AuthContext";
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import HistoryIcon from '@mui/icons-material/History';
import LogoutIcon from '@mui/icons-material/Logout';
import HomeIcon from '@mui/icons-material/Home';
import MapIcon from '@mui/icons-material/Map';
import { useState } from "react";
import DialogSendNotice from "./Dialog/DialogSendNotice";
import CampaignIcon from '@mui/icons-material/Campaign';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import RouteIcon from '@mui/icons-material/Route';
import { Role } from "../Enums/Role";
import { useQueryClient } from "@tanstack/react-query";


export default function DrawerList({ onNavigate } : { onNavigate?: () => void } = {}) {

    const theme = useTheme();
    const isMobile = !useMediaQuery(theme.breakpoints.up('sm'));
    const btnSx = isMobile ? { py: 1.2, minHeight: 48 } : { py: 0.5, minHeight: 40 };
    const navigate = useNavigate()
    const { clearSession } = useSessionStore()
    const queryClient = useQueryClient()
    const { role } = useAuth()
    const [ openDialogNotice, setOpenDialogNotice ] = useState(false)

    const onClickProfile = () => {
        navigate(`${import.meta.env.VITE_BASE_URL}/perfil`)
        onNavigate?.()
    }

    const onClickUsuarios = () => {
        navigate(`${import.meta.env.VITE_BASE_URL}/admin/usuarios`)
        onNavigate?.()
    }

    const onClickRutas = () => {
        navigate(`${import.meta.env.VITE_BASE_URL}/admin/rutas`)
        onNavigate?.()
    }

    const onClickCerrarSesion = () => {
        queryClient.clear()
        clearSession()
        navigate(`${import.meta.env.VITE_BASE_URL}/login`)
        onNavigate?.()
    }

    const onClickHome = () => {
        navigate(`${import.meta.env.VITE_BASE_URL}/`)
        onNavigate?.()
    }

    const onClickHistory = () => {
        navigate(`${import.meta.env.VITE_BASE_URL}/historial`)
        onNavigate?.()
    }


    const onClickSchedule = () => {
        navigate(`${import.meta.env.VITE_BASE_URL}/mapa`)
        onNavigate?.()
    }

    const onClickPeopleHelped = () => {
        navigate(`${import.meta.env.VITE_BASE_URL}/personas-ayudadas`)
        onNavigate?.()
    }

    const onClickSendNotice = () => {
        setOpenDialogNotice(true)
    }

    const color = '#28bdc8'
    
    return (
        <div className={`${isMobile ? 'w-[min(82vw,320px)] py-3 gap-2' : 'w-45 py-5 gap-4'} flex min-h-full flex-col`}>
            <Button data-tour-id="home" fullWidth onClick={onClickHome} color="info" sx={btnSx}>
                <div className="flex w-full justify-start px-2 gap-4 items-center min-w-0">
                    <HomeIcon />
                     <Typography sx={{ whiteSpace: 'normal', textAlign: 'left' }}>Home</Typography>
                 </div>
            </Button>
            <Button data-tour-id="profile" fullWidth onClick={onClickProfile} color='info' sx={btnSx}>
                <div className="flex w-full justify-start px-2 gap-4 items-center min-w-0">
                    <AccountBoxIcon />
                    <Typography sx={{ whiteSpace: 'normal', textAlign: 'left' }}>Perfil</Typography>
                </div>
            </Button>
            <Button data-tour-id="history" fullWidth onClick={onClickHistory} color='info' sx={btnSx}>
                <div className="flex w-full justify-start px-2 gap-4 items-center min-w-0">
                    <HistoryIcon />
                    <Typography sx={{ whiteSpace: 'normal', textAlign: 'left' }}>Historial</Typography>
                </div>
            </Button>
            <Button data-tour-id="map" fullWidth onClick={onClickSchedule} color='info' sx={btnSx}>
                <div className="flex w-full justify-start px-2 gap-4 items-center min-w-0">
                    <MapIcon />
                    <Typography sx={{ whiteSpace: 'normal', textAlign: 'left' }}>Mapa</Typography>
                </div>
            </Button>
            <Button data-tour-id="send-notice" fullWidth onClick={onClickSendNotice} color="info" sx={btnSx}>
                <div className="flex w-full justify-start px-2 gap-4 items-center min-w-0">
                    <CampaignIcon/>
                    <Typography sx={{ whiteSpace: 'normal', textAlign: 'left' }}>Crear Aviso</Typography>
                </div>
            </Button>
            <Button data-tour-id="people-helped" fullWidth onClick={onClickPeopleHelped} color='info' sx={btnSx}>
                <div className="flex w-full justify-start px-2 gap-4 items-center min-w-0">
                    <GroupAddIcon/>
                    <Typography sx={{ whiteSpace: 'normal', textAlign: 'left' }}>Personas Ayudadas</Typography>
                </div>
            </Button>
            <Button data-tour-id="admin-routes" fullWidth onClick={onClickRutas} color='info' sx={btnSx}>
                <div className="flex w-full justify-start px-2 gap-4 items-center min-w-0">
                    <RouteIcon/>
                    <Typography sx={{ whiteSpace: 'normal', textAlign: 'left' }}>Gestionar Rutas</Typography>
                </div>
            </Button>
            { role === Role.admin && (
                <Button data-tour-id="admin-users" fullWidth onClick={onClickUsuarios} color='info' sx={btnSx}>
                    <div className="flex w-full justify-start px-2 gap-4 items-center min-w-0">
                        <PeopleAltIcon/>
                        <Typography sx={{ whiteSpace: 'normal', textAlign: 'left' }}>Gestionar Usuarios</Typography>
                    </div>
                </Button>
            )}
            <div className="flex grow items-end w-full" >
                <Button data-tour-id="logout" fullWidth color="warning" onClick={onClickCerrarSesion} sx={btnSx}>
                    <div className="flex w-full justify-start px-2 gap-4 items-center min-w-0">
                        <LogoutIcon fontSize="small" />
                        <Typography variant="body2" sx={{ whiteSpace: 'normal', textAlign: 'left' }}>Cerrar Sesión</Typography>
                    </div>
                </Button>
            </div>
            <DialogSendNotice open={openDialogNotice} setOpen={setOpenDialogNotice} />
        </div>
    )
};

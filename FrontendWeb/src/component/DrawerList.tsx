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


export default function DrawerList() {

    const theme = useTheme();
    const isMobile = !useMediaQuery(theme.breakpoints.up('sm'));
    const btnSx = isMobile ? { py: 1.5, minHeight: 52 } : { py: 0.5, minHeight: 40 };
    const navigate = useNavigate()
    const { clearSession } = useSessionStore()
    const { role } = useAuth()
    const [ openDialogNotice, setOpenDialogNotice ] = useState(false)

    const onClickProfile = () => {
        navigate(`${import.meta.env.VITE_BASE_URL}/perfil`)
    }

    const onClickUsuarios = () => {
        navigate(`${import.meta.env.VITE_BASE_URL}/admin/usuarios`)
    }

    const onClickRutas = () => {
        navigate(`${import.meta.env.VITE_BASE_URL}/admin/rutas`)
    }

    const onClickCerrarSesion = () => {
        clearSession()
        navigate(`${import.meta.env.VITE_BASE_URL}/login`)
    }

    const onClickHome = () => {
        navigate(`${import.meta.env.VITE_BASE_URL}/`)
    }

    const onClickHistory = () => {
        navigate(`${import.meta.env.VITE_BASE_URL}/historial`)
    }


    const onClickSchedule = () => {
        navigate(`${import.meta.env.VITE_BASE_URL}/mapa`)
    }

    const onClickPeopleHelped = () => {
        navigate(`${import.meta.env.VITE_BASE_URL}/personas-ayudadas`)
    }

    const onClickSendNotice = () => {

    }

    const color = '#28bdc8'
    
    return (
        <div className={`py-5 gap-4 w-45 flex grow flex-col flex-wrap justify-items-between`}>
            <Button data-tour-id="home" fullWidth onClick={onClickHome} color='info' sx={btnSx}>
                <div className="flex w-full justify-start px-2 gap-5 items-center">
                    <HomeIcon  />
                     <Typography>Home</Typography>
                 </div>
            </Button>
            <Button data-tour-id="profile" fullWidth onClick={onClickProfile} color='info' sx={btnSx}>
                <div className="flex w-full justify-start px-2 gap-5 items-center">
                    <AccountBoxIcon />
                    <Typography>Perfil</Typography>
                </div>
            </Button>
            <Button data-tour-id="map" fullWidth onClick={onClickSchedule} color='info' sx={btnSx}>
                <div className="flex w-full justify-start px-2 gap-5 items-center">
                    <MapIcon />
                    <Typography>Mapa</Typography>
                </div>
            </Button>
            <Button data-tour-id="history" fullWidth onClick={onClickHistory} color='info' sx={btnSx}>
                <div className="flex w-full justify-start px-2 gap-5 items-center">
                    <HistoryIcon />
                    <Typography>Historial</Typography>
                </div>
            </Button>
            { role === Role.admin && (
                <>
                    <Button data-tour-id="admin-users" fullWidth onClick={onClickUsuarios} color='info' sx={btnSx}>
                        <div className="flex w-full justify-start px-2 gap-5 items-center">
                            <PeopleAltIcon/>
                            <Typography>Gestionar Usuarios</Typography>
                        </div>
                    </Button>
                    <Button data-tour-id="admin-routes" fullWidth onClick={onClickRutas} color='info' sx={btnSx}>
                        <div className="flex w-full justify-start px-2 gap-5 items-center">
                            <RouteIcon/>
                            <Typography>Gestionar Rutas</Typography>
                        </div>
                    </Button>
                </>
            )}
            <Button data-tour-id="send-notice" fullWidth onClick={onClickSendNotice} color="info" sx={btnSx}>
                <div className="flex w-full justify-start px-2 gap-5 items-center">
                    <CampaignIcon/>
                    <Typography>Crear Aviso</Typography>
                </div>
            </Button>
            <Button data-tour-id="people-helped" fullWidth onClick={onClickPeopleHelped} color='info' sx={btnSx}>
                <div className="flex w-full justify-start px-2 gap-5 items-center">
                    <GroupAddIcon/>
                    <Typography>Personas Ayudadas</Typography>
                </div>
            </Button>
            <div className="flex grow items-end w-full" >
                <Button data-tour-id="logout" fullWidth color="warning" onClick={onClickCerrarSesion} sx={btnSx}>
                    <div className="flex w-full justify-start px-2 gap-5 items-center">
                        <LogoutIcon fontSize="small" />
                        <Typography variant="body2">Cerrar Sesión</Typography>
                    </div>
                </Button>
            </div>
            <DialogSendNotice open={openDialogNotice} setOpen={setOpenDialogNotice} />
        </div>
    )
};

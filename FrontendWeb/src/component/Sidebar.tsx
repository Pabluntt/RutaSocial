import { IconButton, Divider, Tooltip } from "@mui/material";
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import RouteIcon from '@mui/icons-material/Route';
import { useNavigate } from "react-router-dom";
import HomeIcon from '@mui/icons-material/Home';
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import DialogSendNotice from "./Dialog/DialogSendNotice";
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import HistoryIcon from '@mui/icons-material/History';
import MapIcon from '@mui/icons-material/Map';
import CampaignIcon from '@mui/icons-material/Campaign';
import LogoutIcon from '@mui/icons-material/Logout';
import GroupAddIcon from '@mui/icons-material/GroupAdd';

import useSessionStore from "../stores/useSessionStore";
import DialogLogout from "./Dialog/DialogLogout";
import { Role } from "../Enums/Role";


const hoverStyles = {
  '&:hover svg': {
    color: '#5865F2', 
  }
};

export default function Sidebar() {

    const navigate = useNavigate()
    const { clearSession } = useSessionStore()
    const [ open, setOpen ] = useState(false)
    const [ openDialogLogout, setOpenLogout ] = useState(false)
    const { role, loading } = useAuth()

    const handleClickOpen = () => {
        setOpen(true)
    }

    const onClickProfile = () => {
        navigate(`${import.meta.env.VITE_BASE_URL}/perfil`)
    }

    const onClickHistory = () => {
        navigate(`${import.meta.env.VITE_BASE_URL}/historial`)
    }

    const onClickUsers = () => {
        navigate(`${import.meta.env.VITE_BASE_URL}/admin/usuarios`)
    }

    const onClickRoutes = () => {
        navigate(`${import.meta.env.VITE_BASE_URL}/admin/rutas`)
    }

    const onClickSchedule = () => {
        navigate(`${import.meta.env.VITE_BASE_URL}/mapa`)
    }

    const onClickHome = () => {
        navigate(`${import.meta.env.VITE_BASE_URL}/`)
    }
    const onClickPeopleHelped = () => {
        navigate(`${import.meta.env.VITE_BASE_URL}/personas-ayudadas`)
    }
    const onClickCerrarSesion = () => {
        setOpenLogout(true)
    }

    return (
        <div className="flex h-screen flex-col shadow-[4px_0_6px_-1px_rgba(0,0,0,0.25)]">
            <Tooltip title={"Home"}><IconButton data-tour-id="home" onClick={onClickHome} sx={{ p : 2, ...hoverStyles }}><HomeIcon htmlColor="#374151" sx={{ fontSize: 40 }} /></IconButton></Tooltip>
            <Divider variant="middle"/>
            <div className="flex flex-col py-5 gap-7 justify-start items-center">
                <Tooltip title="Perfil"><IconButton data-tour-id="profile" onClick={onClickProfile} sx={{ ...hoverStyles }}><AccountBoxIcon htmlColor="#374151" fontSize="large"/></IconButton></Tooltip>
                <Tooltip title="Historial"><IconButton data-tour-id="history" onClick={onClickHistory} sx={{ ...hoverStyles }}><HistoryIcon htmlColor="#374151" fontSize="large" /></IconButton></Tooltip>
                <Tooltip title="Mapa"><IconButton data-tour-id="map" onClick={onClickSchedule} sx={{ ...hoverStyles }}><MapIcon htmlColor="#374151" fontSize="large"/></IconButton></Tooltip>
                <Tooltip title="Enviar aviso"><IconButton data-tour-id="send-notice" onClick={handleClickOpen} sx={{ ...hoverStyles }}><CampaignIcon htmlColor="#374151" fontSize="large" /></IconButton></Tooltip>
                <Tooltip title="Personas Ayudadas"><IconButton data-tour-id="people-helped" onClick={onClickPeopleHelped} sx={{ ...hoverStyles }}><GroupAddIcon htmlColor="#374151" fontSize="large" /></IconButton></Tooltip>
                { role === Role.admin && (
                    <Tooltip title="Gestionar Rutas">
                        <IconButton data-tour-id="admin-routes" onClick={onClickRoutes}  sx={{ ...hoverStyles }}>
                            <RouteIcon htmlColor='#374151' fontSize='large'/>
                        </IconButton>
                    </Tooltip>
                )}
                { role === Role.admin  &&
                    <Tooltip title="Gestionar Usuarios">
                        <IconButton data-tour-id="admin-users" onClick={onClickUsers}  sx={{ ...hoverStyles }}>
                            <PeopleAltIcon htmlColor='#374151' fontSize='large'/>
                        </IconButton>
                    </Tooltip>
                }
            </div>
            <div className="flex flex-col grow justify-end items-center py-4 gap-3">
                <Tooltip title="Cerrar sesión"><IconButton data-tour-id="logout" onClick={onClickCerrarSesion}><LogoutIcon color="error" fontSize="large" /></IconButton></Tooltip>
                <Divider variant='middle' className="w-4/5" />
                <a href="https://www.hogardecristo.cl/" target="_blank" rel="noopener noreferrer"><img src="/HDC_RGB_full-color-horizontal.png" alt="Hogar de Cristo" className="w-10 h-10 object-contain" /></a>
            </div>
            <DialogSendNotice open={open} setOpen={setOpen} />
            <DialogLogout stateOpen={[openDialogLogout, setOpenLogout]} />
        </div>
    )
};

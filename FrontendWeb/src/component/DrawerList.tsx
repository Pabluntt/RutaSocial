import { Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import useSessionStore from "../stores/useSessionStore";
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import HistoryIcon from '@mui/icons-material/History';
import EventIcon from '@mui/icons-material/Event';  
import GroupIcon from '@mui/icons-material/Group';
import LogoutIcon from '@mui/icons-material/Logout';
import HomeIcon from '@mui/icons-material/Home';
import { useState } from "react";
import DialogSendNotice from "./Dialog/DialogSendNotice";
import CampaignIcon from '@mui/icons-material/Campaign';

export default function DrawerList() {

    const navigate = useNavigate()
    const { clearSession } = useSessionStore()
    const [ openDialogNotice, setOpenDialogNotice ] = useState(false)

    const onClickProfile = () => {
        navigate(`${import.meta.env.VITE_BASE_URL}/perfil`)
    }

    const onClickUsuarios = () => {
        navigate(`${import.meta.env.VITE_BASE_URL}/admin/usuarios`)
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
        navigate(`${import.meta.env.VITE_BASE_URL}/calendario`)
    }

    const onClickSendNotice = () => {

    }

    const color = '#28bdc8'
    
    return (
        <div className={`py-5 gap-4 w-45 flex grow flex-col flex-wrap justify-items-between`}>
            <Button fullWidth onClick={onClickHome} color='info'>
                <div className="flex w-full justify-start px-2 gap-5 items-center">
                    <HomeIcon  />
                     <Typography>Home</Typography>
                 </div>
            </Button>
            <Button fullWidth onClick={onClickProfile} color='info' >
                <div className="flex w-full justify-start px-2 gap-5 items-center">
                    <AccountBoxIcon />
                    <Typography>Perfil</Typography>
                </div>
            </Button>
            <Button fullWidth onClick={onClickSchedule} color='info' >
                <div className="flex w-full justify-start px-2 gap-5 items-center">
                    <EventIcon />
                    <Typography>Agendar</Typography>
                </div>
            </Button>
            <Button fullWidth onClick={onClickHistory} color='info' >
                <div className="flex w-full justify-start px-2 gap-5 items-center">
                    <HistoryIcon />
                    <Typography>Historial</Typography>
                </div>
            </Button>
            <Button fullWidth onClick={onClickUsuarios} color='info' >
                <div className="flex w-full justify-start px-2 gap-5 items-center">
                    <GroupIcon/>
                    <Typography>Usuarios</Typography>
                </div>
            </Button>
            <Button fullWidth onClick={onClickSendNotice} color="info">
                <div className="flex w-full justify-start px-2 gap-5 items-center">
                    <CampaignIcon/>
                    <Typography>Crear Aviso</Typography>
                </div>
            </Button>
            <div className="flex grow items-end w-full" >
                <Button  fullWidth color="warning" onClick={onClickCerrarSesion}  >
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

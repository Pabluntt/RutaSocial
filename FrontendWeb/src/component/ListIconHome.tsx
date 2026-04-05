import AccountBoxIcon from '@mui/icons-material/AccountBox';
import HistoryIcon from '@mui/icons-material/History';
import EventIcon from '@mui/icons-material/Event';  
import CampaignIcon from '@mui/icons-material/Campaign';
import { IconButton, Tooltip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import DialogSendNotice from './Dialog/DialogSendNotice';
import { useAuth } from '../context/AuthContext';
import { Role } from '../Enums/Role';


export default function ListIconHome() {

    const navigate = useNavigate()
    const [ open, setOpen ] = useState(false)
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

    const onClickSchedule = () => {
        navigate(`${import.meta.env.VITE_BASE_URL}/calendario`)
    }

    return(
        <div className="flex flex-col py-5 gap-7 justify-start items-center">
            <Tooltip title="Perfil"><IconButton onClick={onClickProfile}><AccountBoxIcon htmlColor="#374151" fontSize="large"/></IconButton></Tooltip>
            <Tooltip title="Historial"><IconButton onClick={onClickHistory}><HistoryIcon htmlColor="#374151" fontSize="large" /></IconButton></Tooltip>
            <Tooltip title="Agendar ruta"><IconButton onClick={onClickSchedule}><EventIcon htmlColor="#374151" fontSize="large"/></IconButton></Tooltip>
            <Tooltip title="Enviar aviso"><IconButton onClick={handleClickOpen}><CampaignIcon htmlColor="#374151" fontSize="large" /></IconButton></Tooltip>
            { role === Role.admin  ?

                <Tooltip title="Gestionar Usuarios">
                    <IconButton onClick={onClickUsers}>
                        <PeopleAltIcon htmlColor='#374151' fontSize='large'/>
                    </IconButton>
                </Tooltip>
                :
                <>
                </>
            }
            {/*<Tooltip title="Notificaciones"><IconButton><NotificationsIcon htmlColor='black ' fontSize="large"/></IconButton></Tooltip>*/}

            <DialogSendNotice open={open} setOpen={setOpen} />
        </div>
    )    
};

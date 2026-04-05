import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import { Paper, Snackbar, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import useSessionStore from '../../stores/useSessionStore';
import CircularProgress from '@mui/material/CircularProgress';
import InputDescription from '../Input/InputDescription';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DoneIcon from '@mui/icons-material/Done';
import CloseDialogButton from '../Button/CloseDialogButton';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useCreateRoute } from '../../api/hooks/RouteHooks';
import { Route } from '../../api/models/Route';
import { useProfile } from '../../api/hooks/UserHooks';



const inputFontSize = {
    xs : '0.90rem',
    sm : '0.95rem',
    md : '1rem'
}

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(1, 3),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

type DialogCreateRouteProps = {
    stateOpen : [ boolean, React.Dispatch<React.SetStateAction<boolean>> ]
}


export default function DialogCreateRoute({ stateOpen } : DialogCreateRouteProps) {

    const [ open, setOpen ] = stateOpen
    const { accessToken, routeStatus, setRouteStatus, routeId, setRouteId } = useSessionStore()
    const  leaderID  = useProfile().data?.id
    const [ acept, setAcept ] = useState(false)
    const [ inviteCode, setInviteCode ] = useState('')
    const [ confirmation, setConfirmation ] = useState(false)
    const [ route, setRoute ] = useState<Pick<Route, 'title' | 'description' | 'routeLeader'>>({
        title : `Ruta ${format(new Date(), "'del' dd 'de' MMMM", { locale : es})}`,
        description : '',
        routeLeader : '',
    })

    const [ routeError, setRouteError ] = useState({
        title : '',
        description: '',
        routeLeaderError: ''
    })

    const [ copySuccess, setCopySuccess ] = useState<boolean | undefined>()
    const { data, mutate } = useCreateRoute()



    const clearStates = () => {
        setRoute({
            title : `Ruta ${format(new Date(), "'del' dd 'de' MMMM", { locale : es})}`,
            description : '',
            routeLeader : '',
        })
        setRouteError({
            title : '',
            description: '',
            routeLeaderError: ''
        })
    }

    const handleClose = () => {
        setOpen(false)
    }

    const handleDescriptionInput = (e : React.ChangeEvent<HTMLInputElement>) => {
        setRoute({...route, description : e.target.value})
    }

    const handleTitleInput = (e : React.ChangeEvent<HTMLInputElement>) => {
        setRoute({...route, title : e.target.value})
    }


    const validateForm = () => {
        if(route.description === '') {
            setRouteError({...routeError, description: 'La descripción no debe estar vacia'})
            return false
        }
        if(route.title === '') {
            setRouteError({...routeError, title: 'El título no debe estar vacio'})
            return false
        }
        if(!leaderID) {
            setRouteError({...routeError, routeLeaderError: 'Error inesperado en obtener el leader de la ruta'})
            return false
        }
        setRouteError({ description: '', title: '', routeLeaderError: ''})
        return true
    } 



    const handleAcept = () => {
        if(!validateForm()) return 
        
        setAcept(true)
        setTimeout(() => {
            mutate({...route, routeLeader: leaderID as string})
        }, 300)
    }

    useEffect(() => {
        if(data) {
            setInviteCode(data.inviteCode)
            setAcept(true)
            setConfirmation(true)
            setRouteId(data.id)
        }
    }, [data])


    const onClickContentCopy = async () => {
        try {
            await  navigator.clipboard.writeText(inviteCode)
            setCopySuccess(true)
        } catch(e) {
            setCopySuccess(false)
            alert((e as Error).message)
        }
    }

    return (
        <>
            <BootstrapDialog 
                fullWidth
                open={open} 
                onClose={handleClose}
                aria-labelledby='ruta-titulo'
                keepMounted
                slotProps={{
                    transition : {
                        onExited: () => {
                            if(confirmation) {
                                setRouteStatus(true)
                            }   
                            clearStates()
                        }
                    }
                }}    
            >
                <DialogTitle className='m-0' id="ruta-titulo">
                    Crear una Ruta
                </DialogTitle>
                <CloseDialogButton handleClose={handleClose} />
                
                <DialogContent className='flex flex-col gap-10'>
                    {!acept ? 
                        <>
                            <Typography variant="body1" sx={{ lineHeight: 2, fontSize: {
                                xs : '0.75rem',
                                sm : '0.75rem',
                                md : '1rem' 
                            }}}>
                            Estás a punto de crear una nueva ruta social, durante la cual podrás: <br />
                            {"\u2022"} Registrar a personas en situación de calle. <br />
                            {"\u2022"} Reportar riesgos presentes en ciertos sectores. <br />
                            {"\u2022"} Puedes finalizar la ruta en cualquier momento.
                            </Typography>

                            <TextField 
                                variant='standard'
                                label="Nombre de la ruta"
                                value={route.title}
                                error={routeError.title !== ''}
                                placeholder='Cómo reconocerás esta ruta'
                                helperText={routeError.title}
                                required
                                onChange={handleTitleInput}
                                slotProps={{
                                    inputLabel : {
                                        shrink : true
                                    },
                                    input: {
                                        sx : {
                                            fontSize: inputFontSize
                                        }
                                    }
                                }}
                            
                            />
                            <InputDescription
                                variant='standard'
                                required 
                                error={routeError.description !== ''}
                                helperText={routeError.description}
                                label='Descripción de la ruta'
                                placeholder='Explica la finalidad y objetivos de la ruta'
                                value={route.description}
                                maxLength={100}
                                onChange={handleDescriptionInput}
                                slotProps={{
                                    inputLabel : {
                                        shrink : true
                                    },
                                    input: {
                                        sx : {
                                            fontSize: inputFontSize
                                        }
                                    }
                                }}
                            />
                        </>
                    :
                        !confirmation ? 
                        
                        <div className='flex grow items-center justify-center'>
                            <CircularProgress  />
                        </div> 
                        : 
                            <>
                                <Typography variant='body1'>
                                    Listo! <br />
                                    A continuación el código para que otras personas puedan unirse
                                </Typography>
                                <Paper sx={{ backgroundColor: '#dbdbd9'}} variant='elevation' elevation={0} className='flex px-2 py-1 items-center justify-between'>
                                    <Typography>
                                        {inviteCode}
                                    </Typography>
                                    <IconButton onClick={onClickContentCopy}>
                                        { copySuccess ? <DoneIcon /> : <ContentCopyIcon />}
                                    </IconButton>
                                </Paper>
                                <Snackbar open={copySuccess} message='Copiado en portapapeles'/>
                            </>
                    }
                </DialogContent>
                    <DialogActions>
                        <Button variant='contained' onClick={!confirmation ? handleAcept : handleClose}>
                            {!confirmation ? 'Confirmar' : 'Aceptar'}
                        </Button>
                        { !confirmation ? 
                            <>
                                <Button variant='contained' onClick={handleClose}>
                                    cancelar
                                </Button>
                            </>
                            :
                            <>
                            </>
                        }
                    </DialogActions>
            </BootstrapDialog>
        </>
    )    
};

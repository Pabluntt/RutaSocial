import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { Alert, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import useSessionStore from '../../stores/useSessionStore';
import CloseDialogButton from '../Button/CloseDialogButton';
import { useJoinRoute } from '../../api/hooks/RouteHooks';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(3),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));


type DialogJoinRouteProps = {
    stateOpen : [ boolean, React.Dispatch<React.SetStateAction<boolean>> ]
}

export default function DialogJoinRoute({ stateOpen } : DialogJoinRouteProps) {

    const [ open, setOpen ] = stateOpen
    const { accessToken, routeStatus, setRouteStatus, routeId, setRouteId } = useSessionStore()
    const [ acept, setAcept ] = useState(false)
    const [ inviteCode, setInviteCode ] = useState('')
    const { isSuccess, isError, isIdle, data, mutate, error } = useJoinRoute()


    const handleClose = () => {
        if(isSuccess) {
            setRouteStatus(true)
        } 
        setOpen(false)
        setInviteCode('')
    }

    const handleAcept = () => {
        setTimeout(() => {
            mutate(inviteCode)
        }, 300)
    }

    const handleInviteCode = (e : React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        setInviteCode(e.target.value)
    } 

    useEffect(() => {
        if(isSuccess) {
            setAcept(true)
            setRouteId(data.id)
        }
    }, [isSuccess]) 

    return (
        <>
            <BootstrapDialog 
                fullWidth
                open={open} 
                onClose={handleClose}
                aria-labelledby='ruta-titulo'
            >
                <DialogTitle className='m-0 p-2' id="ruta-titulo">
                    Unirse a una ruta
                </DialogTitle>
                <CloseDialogButton 
                    handleClose={handleClose}
                />
                <DialogContent className='flex flex-col gap-5'>
                    <Typography variant='body1'>
                        Unete a una ruta activa con el código de invitación
                    </Typography>
                    <TextField
                        variant='standard'
                        required 
                        label='Código de invitación'
                        placeholder='Ingresa el código'
                        value={inviteCode}
                        onChange={handleInviteCode}
                    />
                    { 
                        isIdle ? null :
                        <Alert 
                            severity={
                                isError ? 'error' : 
                                isSuccess ? 'success' :
                                'error'
                            }
                        >  
                            {
                                isError ? `Ocurrio un error : ${(error as any).error}` :
                                isSuccess ? `Ahora eres parte de la Ruta! todas los registros se vincularán con esta ruta` :
                                'Ocurrio un error desconocido, intente más tarde'
                            }
                        </Alert>
                    }
                </DialogContent>
                    <DialogActions>
                        <Button variant='contained' onClick={!acept ? handleAcept : handleClose}>
                            {!acept ? 'Unirse' : 'Aceptar'}
                        </Button>
                        { !acept ? 
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

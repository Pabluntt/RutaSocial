import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { Alert, CircularProgress, TextField, Typography, useTheme, useMediaQuery } from '@mui/material';
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
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


interface DialogJoinRouteProps {
    stateOpen : [ boolean, React.Dispatch<React.SetStateAction<boolean>> ]
}

export default function DialogJoinRoute({ stateOpen } : DialogJoinRouteProps) {

    const [ open, setOpen ] = stateOpen
    const { setRouteStatus, setRouteId } = useSessionStore()
    const theme = useTheme();
    const fullScreen = !useMediaQuery(theme.breakpoints.up('sm'));
    const [ acept, setAcept ] = useState(false)
    const [ inviteCode, setInviteCode ] = useState('')
    const queryClient = useQueryClient()
    const { isSuccess, isError, isIdle, isPending, data, mutate, error, reset } = useJoinRoute()


    const handleClose = () => {
        setOpen(false)
        setInviteCode('')
        setAcept(false)
        reset()
    }

    const handleAcept = () => {
        const code = inviteCode.trim()
        if(!code || isPending) return
        setTimeout(() => {
            mutate(code)
        }, 300)
    }

    const handleInviteCode = (e : React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        setInviteCode(e.target.value)
    } 

    useEffect(() => {
        if(isSuccess && data) {
            setAcept(true)
            setRouteId(data.id)
            setRouteStatus(true)
            queryClient.invalidateQueries({ queryKey: ['routes'] })
            queryClient.invalidateQueries({ queryKey: ['events'] })
        }
    }, [data, isSuccess, setRouteId, setRouteStatus, queryClient]) 

    return (
        <>
            <BootstrapDialog 
                fullScreen={fullScreen}
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
                            disabled={isPending}
                        />
                    { 
                        isIdle ? null :
                        <Alert 
                            severity={
                                isError ? 'error' : 
                                isPending ? 'info' :
                                isSuccess ? 'success' :
                                'error'
                            }
                        >  
                            {
                                isPending ? <span className="inline-flex items-center gap-2"><CircularProgress size={16} /> Uniéndote a la ruta...</span> :
                                isError ? `Ocurrió un error: ${(error as { error?: string })?.error ?? 'No se pudo unir a la ruta'}` :
                                isSuccess ? `Ahora eres parte de la Ruta! todas los registros se vincularán con esta ruta` :
                                'Ocurrio un error desconocido, intente más tarde'
                            }
                        </Alert>
                    }
                </DialogContent>
                    <DialogActions>
                        <Button variant='contained' disabled={isPending || (!acept && !inviteCode.trim())} onClick={!acept ? handleAcept : handleClose}>
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

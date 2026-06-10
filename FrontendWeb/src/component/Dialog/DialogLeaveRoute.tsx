import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { Alert, Typography } from '@mui/material';
import { useEffect } from 'react';
import useSessionStore from '../../stores/useSessionStore';
import CircularProgress from '@mui/material/CircularProgress';
import CloseDialogButton from '../Button/CloseDialogButton';
import { useLeaveRoute } from '../../api/hooks/RouteHooks';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(3),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

export default function DialogLeaveRoute({ open, setOpen } : { open : boolean, setOpen: (ar : boolean) => void}) {

    const { setRouteStatus, routeId, setRouteId } = useSessionStore()
    const { mutate, isSuccess, isError, isIdle, isPending, reset } = useLeaveRoute()

    useEffect(() => {
        if(isSuccess) {
            setTimeout(() => {
                setRouteStatus(false)
                setRouteId(undefined)
                handleClose()
            }, 1000)
        }
    }, [isSuccess])

    const onLeaveRoute = () => {
        if(routeId) {
            mutate(routeId)
        }
    }

    const forceClearRoute = () => {
        setRouteStatus(false)
        setRouteId(undefined)
        handleClose()
    }

    const handleClose = () => {
        reset()
        setOpen(false)
    }
    
    return (
        <>
            <BootstrapDialog 
                fullWidth
                open={open} 
                onClose={handleClose}
                aria-labelledby='salir-ruta-titulo'
            >
                <DialogTitle className='m-0 p-2' id="salir-ruta-titulo">
                    Salir de Ruta
                </DialogTitle>
                <CloseDialogButton handleClose={handleClose}/>

                <DialogContent>
                    { isIdle ?
                        <Typography>
                            ¿Estás seguro que quieres salir de la ruta?
                        </Typography>
                        :
                        isPending ? 
                        <CircularProgress />
                        :
                        <Alert sx={{ mt: 2, width: '100%', minHeight: '80px', display: 'flex', alignItems: 'center', fontSize: '1rem' }} variant='standard' severity={ isSuccess ? 'success' : isError ? 'error' : 'info'}>
                            {isSuccess ? 'Saliste de la ruta exitosamente' : isError ? 'Hubo un error al intentar salir de la ruta' : 'Error desconocido'}
                        </Alert>
                    }
                </DialogContent>
                    <DialogActions>
                        { isSuccess ?
                            <></>
                            :
                            isError ?
                            <>
                                <Button variant='contained' color='warning' onClick={forceClearRoute}>
                                    Salir de todas formas
                                </Button>
                                <Button variant='contained' onClick={handleClose}>
                                    Cancelar
                                </Button>
                            </>
                            :
                            <>
                                <Button disabled={isPending} variant='contained' color='error' onClick={onLeaveRoute}>
                                    Salir
                                </Button>
                                <Button variant='contained' onClick={handleClose}>
                                    Cancelar
                                </Button>
                            </>
                        }
                    </DialogActions>
            </BootstrapDialog>
        </>
    )    
};

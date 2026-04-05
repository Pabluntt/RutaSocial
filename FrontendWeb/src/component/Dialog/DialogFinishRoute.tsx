import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { Alert,  Typography } from '@mui/material';
import { useEffect } from 'react';
import useSessionStore from '../../stores/useSessionStore';
import CircularProgress from '@mui/material/CircularProgress';
import CloseDialogButton from '../Button/CloseDialogButton';
import { useFinishRoute, useRoute } from '../../api/hooks/RouteHooks';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(3),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));


export default function DialogFinishRoute({ open, setOpen } : { open : boolean, setOpen: (ar : boolean) => void}) {

   
    const { setRouteStatus, routeId, setRouteId, accessToken } = useSessionStore()
    const dataRoute = useRoute( routeId as string).data
    const { mutate, isSuccess, isError, isIdle, isPending } = useFinishRoute()

    useEffect(() => {
        if(isSuccess) {
            setTimeout(() => {
                setRouteStatus(false)
                setRouteId(undefined)
                handleClose()
            }, 1000)
        }
    }, [isSuccess])

    const onFinishRoute = () => {
        if(routeId) {
            mutate(routeId)
        }
    }

    const handleClose = () => {
        setOpen(false)
    }
    
    return (
        <>
            <BootstrapDialog 
                fullWidth
                open={open} 
                onClose={handleClose}
                aria-labelledby='finalizar-ruta-titulo'
            >
                <DialogTitle className='m-0 p-2' id="finalizar-ruta-titulo">
                    Finalizar Ruta
                </DialogTitle>
                <CloseDialogButton  handleClose={handleClose}/>

                <DialogContent>
                    { isIdle ?
                        <Typography>
                            ¿Estás seguro que quieres finalizar la Ruta?
                        </Typography>
                        :
                        isPending ? 
                        <CircularProgress />
                        :
                        <Alert sx={{ mt: 2, width: '100%', minHeight: '80px', display: 'flex', alignItems: 'center', fontSize: '1rem' }} variant='standard' severity={ isSuccess ? 'success' : isError ? 'error' : 'info'}>
                            {isSuccess ? 'Se Finalizo la ruta éxitosamente' : isError ? 'Hubo un error al intentar finalizar' : 'Error desconocido'}
                        </Alert>
                    }
                </DialogContent>
                    <DialogActions>
                        { isSuccess ?
                            <></>
                            :
                            <>
                                <Button disabled={isPending} variant='contained' color='error' onClick={onFinishRoute}>
                                    Finalizar
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

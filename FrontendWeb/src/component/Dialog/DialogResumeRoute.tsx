import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { Paper, Snackbar, Typography } from '@mui/material';
import { useState } from 'react';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DoneIcon from '@mui/icons-material/Done';
import useSessionStore from '../../stores/useSessionStore';
import { useRoute } from '../../api/hooks/RouteHooks';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(1, 3),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));


export type DialogResumeRiskProps = { 
    stateOpen : [ boolean, React.Dispatch<React.SetStateAction<boolean>>]
}


export default function DialogResumeRoute({ stateOpen } : DialogResumeRiskProps) {


    const { routeId, accessToken } = useSessionStore()

    const [ open, setOpen ] = stateOpen
    const [ copySuccess, setCopySuccess ] = useState<undefined | boolean>()

    const { isSuccess, isError, isPending, data } = useRoute( routeId as string, true)

    const handleClose = () => {
        setCopySuccess(false)
        setOpen(false)
    }

    const onClickContentCopy = async () => {
        try {
            await  navigator.clipboard.writeText('hola mundo')
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
            >
                <DialogTitle className='m-0 p-2' id="ruta-titulo">
                    Ruta
                </DialogTitle>
                <IconButton
                    aria-label="close"
                    onClick={handleClose}
                    sx={(theme) => ({
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: theme.palette.grey[600],
                    })}
                >
                    <CloseIcon />
                </IconButton>
                <DialogContent className='flex flex-col gap-5'>
                    <Typography variant='body1'>
                        Comparte el código para que las demás personas puedan unirse 
                    </Typography>
                    <Paper sx={{ backgroundColor: '#dbdbd9'}} variant='elevation' elevation={0} className='flex px-2 py-1 items-center justify-between'>
                        <Typography>
                            {   isPending ? 'Cargando código...' :
                                isSuccess ? data.inviteCode : 
                                isError ? 'Error al intentar obtener el código' :
                                'Error desconocido'
                            }
                        </Typography>
                        <IconButton onClick={onClickContentCopy}>
                            { copySuccess ? <DoneIcon /> : <ContentCopyIcon />}
                        </IconButton>
                    </Paper>
                    <Snackbar open={copySuccess} message='Copiado en portapapeles'/>
                    
                </DialogContent>
                    <DialogActions>
                        <Button variant='contained' onClick={handleClose}>
                            Confirmar
                        </Button>
                    </DialogActions>
            </BootstrapDialog>
        </>
    )    
};

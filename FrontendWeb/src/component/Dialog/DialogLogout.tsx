import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import useSessionStore from '../../stores/useSessionStore';
import CloseDialogButton from '../Button/CloseDialogButton';
import { useNavigate } from 'react-router-dom';
import { Typography } from '@mui/material';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(3),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

export type DialogLogoutProps = {
    stateOpen : [ boolean, React.Dispatch<React.SetStateAction<boolean>> ]
}

export default function DialogLogout({ stateOpen } : DialogLogoutProps) {

    const [ open, setOpen ] = stateOpen
    const { clearSession } = useSessionStore()

    const navigator = useNavigate()

    const handleClose = () => {
        setOpen(false)
    }

    const onClickLogout = () => {
        clearSession()
        navigator(`${import.meta.env.VITE_BASE_URL}/login`)
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
                    Cerrar sesión
                </DialogTitle>
                <CloseDialogButton  handleClose={handleClose}/>

                <DialogContent>
                    <Typography>
                        ¿Estas seguro que quieres cerrar la sesión?
                    </Typography>
                </DialogContent>
                    <DialogActions>
                        <Button color='error' onClick={onClickLogout}>
                            Cerrar sesión
                        </Button>
                        <Button onClick={handleClose}>
                            Cancelar
                        </Button>
                    </DialogActions>
            </BootstrapDialog>
        </>
    )    
};

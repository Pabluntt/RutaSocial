import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { Alert, AlertColor, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import CloseDialogButton from '../Button/CloseDialogButton';
import useSessionStore from '../../stores/useSessionStore';
import { useUpdateUser } from '../../api/hooks/UserHooks';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));


export default function DialogChangePassword({ open, setOpen, email} : { open : boolean, setOpen: (ar : boolean) => void, email : string}) {

    const { accessToken } = useSessionStore()
    const [ oldPassword, setOldPassword ] = useState<string>('')
    const [ newPassword, setNewPassword ] = useState<string>('')
    const [ verifyNewPassword, setVerifyNewPassword ] = useState<string>('')
    const [ areCorrect, setAreCorrect ] = useState(true)
    const [ verifyOldPass, setVerifyOldPass ] = useState(true) 

    const [ messageAlert, setMessageAlert] = useState('')
    const [ severity, setSeverity ] = useState<AlertColor>('info')  

    const { isError, mutate, isSuccess, isPending, error} = useUpdateUser()

    const onChangeOldPassword = (e : React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        e.preventDefault()
        setVerifyOldPass(true)
        setOldPassword(e.target.value)
    }
    const onChangeNewPassword = (e : React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        e.preventDefault()
        setNewPassword(e.target.value)
    }
    const onChangeVerifyNewPassword = (e : React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        e.preventDefault()
        setVerifyNewPassword(e.target.value)
    }

    const clearStates = () => {
        setMessageAlert('')
    }

    const handleClose = () => {
        clearStates()
        setOpen(false);
    }

    const onChangePassword = () => {

        if(oldPassword === '') {
            setSeverity('error')
            setMessageAlert('Ingresa tu antigua contraseña')
            return 
        }
        if(newPassword === '' ) {
            setSeverity('error')
            setMessageAlert('Ingresa tu nueva contraseña')
            return 
        }
        if(verifyNewPassword === '') {
            setSeverity('error')
            setMessageAlert('Válida tu nueva contraseña')
            return 
        }

        if(newPassword !== verifyNewPassword) {
            setSeverity('error')
            setMessageAlert('Verifica que la nueva contraseña sean identicas ')
            return 
        }
        mutate({
            currentPassword: oldPassword,
            newPassword: newPassword,
            confirmNewPassword: verifyNewPassword
        })
    }

    useEffect(() => {
        if(isPending) {
            setMessageAlert('Enviando Petición')
            setSeverity('info')
        }
        else if(isSuccess) {
            setMessageAlert('Se cambio correctamente la contraseña')
            setSeverity('success')
            setTimeout(() => {
                handleClose()
            }, 1000)
        }
        else if(isError) {
            setMessageAlert(`No se pudo cambiar la contraseña:       ${(error as any).error}`)
            setSeverity('error')
        }
    }, [isSuccess, isError, isPending ])

    return (
        <>
            <BootstrapDialog 
                fullWidth
                open={open} 
                onClose={handleClose}
                aria-labelledby='aviso-titulo'
            >
                <DialogTitle className='m-0 p-2' id="aviso-titulo">
                    Cambiar Contraseña
                </DialogTitle>
                <CloseDialogButton handleClose={handleClose}/>

                <DialogContent dividers className='flex flex-col gap-5'>
                    <div className='flex flex-col gap-1'>
                        <TextField
                            className='w-3/4'  
                            label="Contraseña Antigua"
                            size="small"
                            placeholder="Escribe la contraseña antigua" 
                            type={"password"} 
                            value={oldPassword}
                            onChange={onChangeOldPassword}
                        />
                    </div>
                    <TextField  
                        label="Contraseña Nueva"
                        autoComplete='new-password'
                        className='w-3/4' 
                        size="small"
                        placeholder="Escribe la nueva contraseña" 
                        type={"password"} 
                        value={newPassword}
                        onChange={onChangeNewPassword}
                    />
                    <TextField  
                        label="Confirmación Contraseña nueva"
                        autoComplete='new-password'
                        className='w-3/4' 
                        size="small"
                        placeholder="Escribe nuevamente la nueva contraseña" 
                        type={"password"} 
                        value={verifyNewPassword}
                        onChange={onChangeVerifyNewPassword}
                    />
                    { messageAlert === '' ? <></> : <Alert severity={severity}>{messageAlert}</Alert>}
                </DialogContent>
                <DialogActions>
                    <Button onClick={onChangePassword} >
                        Cambiar Contraseña
                    </Button>
                </DialogActions>
            </BootstrapDialog>
        </>
    )    
};

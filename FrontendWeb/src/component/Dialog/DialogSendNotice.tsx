import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { Typography, useTheme, useMediaQuery, Switch, FormControlLabel, Tooltip } from '@mui/material';
import { useEffect, useState } from 'react';
import { useCreateNotice, useNoticesMap } from '../../api/hooks/NoticeHooks';
import { useProfile } from '../../api/hooks/UserHooks';
import InputDescription from '../Input/InputDescription';
import CloseDialogButton from '../Button/CloseDialogButton';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../Enums/Role';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(1, 3),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1, 1),
  },
}));


export default function DialogSendAviso({ open, setOpen } : { open : boolean, setOpen: (ar : boolean) => void}) {

    const theme = useTheme();
    const computerDevice = useMediaQuery(theme.breakpoints.up('sm'));
    const [ description, setDescription ] = useState('')
    const [ sendToAll, setSendToAll ] = useState(false)
    const [ noticeError, setNoticeError ] = useState({
        description: '',
        authorID: '',
    })

    const { isError, mutate, data, isSuccess } = useCreateNotice()
    const { refetch } = useNoticesMap()
    const { role } = useAuth()
    const canSendToAll = role === Role.admin

    const authorID = useProfile().data?.id

    const onChangeTextField = (e : React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        e.preventDefault()
        setDescription(e.target.value)
    }

    const clearStates = () => {
        setDescription('')
        setSendToAll(false)
        setNoticeError({description: '', authorID: ''})
    }

    const handleClose = () => {
        clearStates()
        setOpen(false);
    }

    const validateForm = () => {
        if(description === '') {
            setNoticeError({...noticeError, description: 'Escribe un mensaje para enviar la notificación'})
            return false
        }
        if(!authorID) {
            setNoticeError({...noticeError, authorID: 'Ha ocurrido un error inesperado. Intenta más tarde'})
            return false 
        }
        return true
    }

    const onPostNotice = () => {
        if(!validateForm()) return
        mutate({ description, authorID: authorID!, sendEmail: false, sendToAll: canSendToAll && sendToAll })
        setTimeout(() => {
            handleClose()
        }, 600)
    }

    useEffect(() => {
        if(isSuccess){
            refetch()
        }
    }, [isSuccess])

    return (
        <>
            <BootstrapDialog 
                fullScreen={false}
                fullWidth
                maxWidth={computerDevice ? 'sm' : 'xs'}
                open={open} 
                onClose={handleClose}
                aria-labelledby='aviso-titulo'
                slotProps={{
                    paper: {
                        sx: computerDevice ? undefined : {
                            m: 2,
                            width: 'calc(100vw - 32px)',
                            maxHeight: 'calc(100dvh - 32px)',
                            borderRadius: '14px',
                        },
                    },
                }}
            >
                <DialogTitle className='m-0 p-2' id="aviso-titulo">
                    Enviar Un Aviso
                </DialogTitle>
                <CloseDialogButton handleClose={handleClose}/>
                <DialogContent className='flex flex-col gap-5'>
                    <InputDescription  
                        maxLength={256}   
                        variant='standard'                
                        label="Mensaje"
                        multiline
                        fullWidth
                        size="small"
                        placeholder="Escribe el mensaje"
                        type={"text"}
                        value={description}
                        onChange={onChangeTextField}
                        error={noticeError.description !== ''}
                        helperText={noticeError.description}
                    />
                    <Typography color='error'>
                        {noticeError.authorID}
                    </Typography>
                    <Tooltip title={canSendToAll ? 'Activado: el aviso llega a todos los usuarios. Desactivado: solo llega a usuarios activos de tu institución' : 'Los voluntarios solo pueden enviar avisos a los usuarios de su institución'}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={sendToAll}
                                    onChange={(e) => { setSendToAll(e.target.checked); }}
                                    disabled={!canSendToAll}
                                    color="primary"
                                />
                            }
                            label={
                                <Typography variant="body2">
                                    {sendToAll ? 'Enviar a todos' : 'Solo a mi institución'}
                                </Typography>
                            }
                        />
                    </Tooltip>
                </DialogContent>
                <DialogActions>
                    <Button variant='contained' onClick={onPostNotice}>
                        Enviar Aviso
                    </Button>
                </DialogActions>
            </BootstrapDialog>
        </>
    )    
};

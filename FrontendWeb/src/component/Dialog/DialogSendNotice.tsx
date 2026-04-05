import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { Checkbox, FormControlLabel, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useCreateNotice, useNoticesMap } from '../../api/hooks/NoticeHooks';
import { Notice } from '../../api/models/Notice';
import { useProfile } from '../../api/hooks/UserHooks';
import InputDescription from '../Input/InputDescription';
import CloseDialogButton from '../Button/CloseDialogButton';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(1, 3),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1, 1),
  },
}));


export default function DialogSendAviso({ open, setOpen } : { open : boolean, setOpen: (ar : boolean) => void}) {

    const [ notice, setNotice ] = useState<Omit<Notice, 'id' | 'createdAt' | 'authorName'>>({
        description : '',
        authorID : '',
        sendEmail : false
    })

    const [ noticeError, setNoticeError ] = useState({
        description: '',
        authorID: '',
    })

    const { isError, mutate, data, isSuccess } = useCreateNotice()
    const { refetch } = useNoticesMap()

    const authorID = useProfile().data?.id

    const onChangeTextField = (e : React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        e.preventDefault()
        setNotice({ ...notice, description : e.target.value})
    }

    const clearStates = () => {
        setNotice({description: '', authorID: '', sendEmail : false})
        setNoticeError({description: '', authorID: ''})
    }

    const handleClose = () => {
        clearStates()
        setOpen(false);
    }

    const validateForm = () => {
        if(notice.description === '') {
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
        mutate({...notice, authorID: authorID as string})
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
                fullWidth
                open={open} 
                onClose={handleClose}
                aria-labelledby='aviso-titulo'
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
                        value={notice.description}
                        onChange={onChangeTextField}
                        error={noticeError.description !== ''}
                        helperText={noticeError.description}
                    />
                    <div className='flex justify-start'>
                        <FormControlLabel label="Enviar por Email" control={<Checkbox  checked={notice.sendEmail} onChange={(e) => {setNotice({...notice, sendEmail: e.target.checked})}}/>}/>
                    </div>
                    <Typography color='error'>
                        {noticeError.authorID}
                    </Typography>
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

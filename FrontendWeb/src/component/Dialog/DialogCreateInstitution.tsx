import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { Alert, Box, CircularProgress, Popover, TextField, Typography } from '@mui/material';
import CloseDialogButton from '../Button/CloseDialogButton';
import { useEffect, useState } from 'react';
import { useCreateInstitution } from '../../api/hooks/InstitutionHooks';
import { HexColorPicker } from "react-colorful";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(3),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

export type DialogCreateInstitutionProps = { 
    stateOpen : [ boolean, React.Dispatch<React.SetStateAction<boolean>>]
}


export default function DialogCreateInstitution({ stateOpen } : DialogCreateInstitutionProps) {

    const [ open, setOpen ] = stateOpen
    const [ name, setName ] = useState<string>('')
    const [ nameError, setNameError ] = useState<string>('')
    const [ color, setColor ] = useState<string>('')
    const [ colorError, setColorError ] = useState<string>('')

    const { isIdle, isSuccess, isError, isPending, mutate, reset } = useCreateInstitution() 

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleColorClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    };

    const handleColorClose = () => {
    setAnchorEl(null);
    };

    const openColorPicker = Boolean(anchorEl);


    const clearStates = () => {
        setName('')
        setNameError('')
        setColor('')
        setColorError('')
        reset()
    }

    const handleClose = () => {
        clearStates()
        setOpen(false)
    }

    const validateForm = () => {
        if(name === '') {
            setNameError('El nombre de la institución es obligatorio')
            return false
        }
        if(color === '') {
            setColorError('Debes elegir un color que represente la institución')
            return false
        }
        return true 
    }


    const handleSubmit = () => {
        if(!validateForm()) return 
        mutate({
            name : name,
            color : color
        })
    }


    useEffect(() => {
        if(isSuccess) {
            setTimeout(() => {
                handleClose()
            }, 1000)
        }
    }, [isSuccess])


    return (
        <BootstrapDialog 
            fullWidth
            open={open} 
            onClose={handleClose}
            aria-labelledby='create-institution'
        >
            <DialogTitle className='m-0 p-2' id="risk-titulo">
                { 
                    isIdle ? 'Crear nuevo evento' :
                    isPending ? 'Cargando...' :
                    isSuccess ? 'Evento Creado':
                    isError ? 'Ha ocurrido un error' :
                    'Error desconocido'
                }
            </DialogTitle>
            <CloseDialogButton handleClose={handleClose} />
            
            <DialogContent>
                { isIdle ? 
                    <div className='flex flex-col gap-4'>
                        <Typography textAlign={'justify'}>
                            Agrega una nueva institución, una institución es una organización que participa activamente en los labores de rutas sociales.
                        </Typography>
                        <TextField
                            required
                            variant='standard'
                            label='Nombre'
                            placeholder='Ingresa el nombre de la institución'
                            value={name}
                            onChange={(e) => {setName(e.target.value)}}
                            onBlur={(e) => {setNameError((name === '' ? 'El nombre de la institución es obligatorio' : ''))}}
                            error={nameError !== ''}
                            helperText={nameError}
                        />
                        <div className='flex flex-row-reverse items-center justify-end gap-5'>
                            <Box
                                onClick={handleColorClick}
                                sx={{
                                width: 48,
                                height: 48,
                                bgcolor: color || '#ccc',
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': {
                                    transform: 'scale(1.05)',
                                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                                },
                                }}
                            />
                            <Typography variant="body1" sx={{ minWidth: '100px' }}>
                                Elige un color
                            </Typography>
                            </div>


                        <Popover
                            open={openColorPicker}
                            anchorEl={anchorEl}
                            onClose={handleColorClose}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                            }}
                            slotProps={{
                                paper : {
                                    sx: {
                                    p: 1,
                                    borderRadius: 2,
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                    },
                                }
                            }}
                            >
                            <HexColorPicker
                                color={color}
                                onChange={(newColor) => setColor(newColor)}
                            />
                            </Popover>
                    </div>
                    :
                    isPending ? 
                    <div className='flex grow items-center justify-center'>
                        <CircularProgress size={70} />
                    </div>    
                    :
                    <Alert sx={{ mt: 2, width: '100%', minHeight: '80px', display: 'flex', alignItems: 'center', fontSize: '1rem' }} severity={ isSuccess ? 'success' : isError ? 'error' : 'info'}>
                            {isSuccess ? 'Se Creo el riesgo exitosamente' : isError ? 'Hubo un error al intentar finalizar' : 'Error desconocido'}
                    </Alert>
                }
            </DialogContent>
            <DialogActions>
                { isSuccess ?
                    <></>
                    :
                    <>
                        <Button  variant='contained' onClick={handleSubmit}>
                            Crear Institución
                        </Button>
                        <Button variant='contained' color='error' onClick={handleClose}>
                            Cancelar
                        </Button>
                    </>
                }
            </DialogActions>
        </BootstrapDialog>
    )    
};

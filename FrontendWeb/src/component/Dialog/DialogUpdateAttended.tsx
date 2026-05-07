import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { Alert, CircularProgress, TextField } from '@mui/material';
import ComboBox from '../Button/ComboBox';
import { useEffect, useState } from 'react';
import useSessionStore from '../../stores/useSessionStore';
import CloseDialogButton from '../Button/CloseDialogButton';
import { useHelpPointUpdateDialog } from '../../context/HelpPointUpdateContext';
import { useHelpPoints, useUpdateHelpPoint } from '../../api/hooks/HelpPointHooks';


const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(3),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));


export default function DialogUpdateAtended() {

    const [ helpPoint, setHelpPoint ] = useHelpPointUpdateDialog() /*Context Provider */


    const [ name, setName ] = useState('')
    const [ age, setAge ] = useState(0)
    const [ gender, setGender ] = useState('')
    const [ comment, setComment ] = useState('')


    const { mutate, data, isError, isSuccess, isPending, isIdle, reset, error } = useUpdateHelpPoint()
    const { refetch } = useHelpPoints()


    useEffect(() => {
        const primaryPerson = helpPoint?.people?.[0] ?? helpPoint?.peopleHelped
        if(primaryPerson) {
            setName(primaryPerson.name ?? '')
            setAge(primaryPerson.age ?? 0)
            setGender(primaryPerson.gender ?? '')
            setComment(helpPoint?.comment ?? '')
        }
    }, [helpPoint])

    const clearStates = () => {
        reset()
    }

    const handleClose = () => {
        clearStates()
        setHelpPoint(undefined)
    }

    const handleSubmit = () => {
        if(!helpPoint) return

        const updatedPerson = {
            name,
            age,
            gender,
            rut: helpPoint.people?.[0]?.rut ?? helpPoint.peopleHelped?.rut
        }

        mutate({
            ...helpPoint,
            comment,
            people: [updatedPerson, ...(helpPoint.people?.slice(1) ?? [])],
            peopleHelped: updatedPerson
        })
    }

    useEffect(() => {
        if(isSuccess) {
            refetch()
            setTimeout(() => {
                handleClose()
            }, 2000)
        }
    }, [isSuccess])


    return (
        <BootstrapDialog 
            fullWidth
            open={helpPoint !== undefined}
            onClose={handleClose}
            aria-labelledby='attended-titulo'
            keepMounted
            
        >
            <DialogTitle className='m-0 p-2' id="attended-titulo">
                {
                    isIdle ? 'Modificar el Registro' : 
                    isPending ? 'Cargando...' :
                    isSuccess ? 'Registro Cambiado' :
                    isError ? 'Ha ocurrido un error' :
                    'Error desconocido'
                }
            </DialogTitle>
            <CloseDialogButton handleClose={handleClose} />

            <DialogContent>
                {   helpPoint?.peopleHelped === undefined && (helpPoint?.people?.length ?? 0) === 0 ?
                    <CircularProgress />
                    :
                    isIdle ?
                    <div onSubmit={handleSubmit} className='flex flex-col gap-10 p-2'>
                        <div className='flex grow flex-row gap-5'>
                            <TextField
                                fullWidth
                                id="name" 
                                variant='standard'
                                label='Nombre '
                                slotProps={{
                                    inputLabel: {
                                    shrink: true,
                                    },
                                }}  
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value)
                                }}  
                                onFocus={(event) => {
                                    event.target.select();
                                }}
                            />
                            <TextField
                                id="edad"
                                variant='standard'
                                label='edad'
                                type='number'
                                value={age}
                                slotProps={{
                                    inputLabel: {
                                        shrink: true,
                                    }
                                }}
                                onChange={(e) => {
                                    setAge(Number(e.target.value))
                                }}
                            />
                        </div>
                        <div className='flex grow'>
                            <ComboBox 
                                className='grow'
                                label={'Género'} 
                                onChange={(e, value) => {
                                    setGender(value as string)
                                }}
                                options={['Hombre', 'Mujer', 'Sin Especificar']}   
                                value={gender}                      
                            />  
                        </div>
                        <TextField
                            fullWidth
                            id="comment"
                            variant='standard'
                            label='Comentario del punto'
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            slotProps={{
                                inputLabel: {
                                    shrink: true,
                                },
                            }}
                        />
                    </div>
                    :
                    isPending ? 
                    <div className='flex grow items-center justify-center'>
                        <CircularProgress size={70} />
                    </div>
                    :
                    <Alert sx={{ mt: 2, width: '100%', minHeight: '80px', display: 'flex', alignItems: 'center', fontSize: '1rem' }} variant='filled' severity={ isSuccess ? 'success' : isError ? 'error' : 'info'}>
                            {isSuccess ? 'Se Cambio el registro exitosamente' : isError ? 'Hubo un error al intentar finalizar '  : 'Error desconocido'}
                    </Alert>
                }
                
            </DialogContent>
            <DialogActions>
                { isSuccess ?
                    <>
                    </>
                    :
                    <>
                        <Button variant='contained' onClick={handleSubmit}>
                            Modificar Registro
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

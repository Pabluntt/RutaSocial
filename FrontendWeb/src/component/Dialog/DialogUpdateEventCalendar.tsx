import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import ComboBox from '../Button/ComboBox';
import CloseDialogButton from '../Button/CloseDialogButton';
import InputDescription from '../Input/InputDescription';
import { useEffect, useState } from 'react';
import { Alert, CircularProgress, TextField } from '@mui/material';
import { useEventCalendarUpdateDialog } from '../../context/EventCalendarUpdateContext';
import { useCalendarEvents, useUpdateCalendarEvent } from '../../api/hooks/CalendarEventHooks';
import { timeSlots } from '../../utils/calendar';



const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(3),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));


export default function DialogUpdateEventCalendar() {

    const [ eventCalendar, setEventCalendar ] = useEventCalendarUpdateDialog() /*Context Provider */

    const { isSuccess, isPending, isError, isIdle, mutate, error, reset } = useUpdateCalendarEvent()
    const { refetch } = useCalendarEvents()
    const [ startTime, setStartTime] = useState<string>(eventCalendar?.timeStart as string);
    const [ endTime, setEndTime] = useState<string>(eventCalendar?.timeEnd as string);
    const [ listEndTime, setListEndTime] = useState<string[]>([]);
    
    const clearStates = () => {
        reset()
    }

    const handleClose = () => {
        clearStates()
        setEventCalendar(undefined)
    }

    const handleSubmit = () => {
        if(!eventCalendar) return 
        mutate(eventCalendar)
    }

    useEffect(() => {
        if(isSuccess) {
            refetch()
            setTimeout(() => {
                handleClose()
            }, 1000)
        }
    }, [isSuccess])

    const getEndTime = (indexStart : number) => (
        timeSlots.filter((_, index) => ( index > indexStart ))
    )

    useEffect(() => {
        if(startTime) {
            const index = timeSlots.indexOf(startTime)
            setListEndTime(getEndTime(index))
        }
    }, [startTime])


    if(eventCalendar === undefined) {
        return null
    }

    return (
        <BootstrapDialog 
            fullWidth
            open={eventCalendar !== undefined}
            onClose={handleClose}
            aria-labelledby='eventCalendar-update-titulo'
            keepMounted
            
        >
            <DialogTitle className='m-0 p-2' id="eventCalendar-update-titulo">
                {
                    isIdle ? 'Modificar Evento' :
                    isPending ? 'Cargando...' :
                    isSuccess ? 'Evento modificado' :
                    isError ? `Ha ocurrido un error` :
                    'Error desconocido'
                }
            </DialogTitle>
            <CloseDialogButton handleClose={handleClose} />

            <DialogContent>
                { isIdle ? 
                    <div className='flex flex-col gap-4'>
                        <TextField 
                            value={eventCalendar.title}
                            onChange={(e) => setEventCalendar({...eventCalendar, title: e.target.value})}
                            variant='standard'
                            label='Título'
                            fullWidth
                        />
                        <InputDescription 
                            maxLength={256}
                            value={eventCalendar.description} 
                            onChange={(e) => setEventCalendar({...eventCalendar, description : e.target.value})}   
                            fullWidth
                            variant='standard'      
                            label='Descripción'      
                        />
                        <div className="flex flex-col  gap-2">
                            <label htmlFor="horario" className="text-sm font-medium text-gray-700">
                                Horario
                            </label>
                            <div className='flex flex-row gap-4 justify-center items-center'>
                                <ComboBox size='small' value={eventCalendar.timeStart}  onChange={(e, value, reason) => {
                                    if(reason === 'clear') {
                                        setEndTime('')
                                    }
                                    setStartTime(value as string)
                                    setEventCalendar({...eventCalendar, timeStart : value as string})
                                }} 
                                label='Empieza' 
                                options={timeSlots} />
                                <p>-</p> 
                                <ComboBox size='small' value={eventCalendar.timeEnd} onChange={(e, value) => {
                                    setEndTime(value as string)
                                    setEventCalendar({...eventCalendar, timeEnd: value as string})
                                }} 
                                disabled={startTime == undefined} 
                                label='Termina' 
                                options={listEndTime as string[]}/>
                            </div>                           
                        </div>
                    </div>
                    :
                    isPending ? 
                    <div className='flex grow items-center justify-center'>
                        <CircularProgress size={70} />
                    </div>           
                    :
                    <Alert sx={{ mt: 2, width: '100%', minHeight: '80px', display: 'flex', alignItems: 'center', fontSize: '1rem' }} variant='standard' severity={ isSuccess ? 'success' : isError ? 'error' : 'info'}>
                            {isSuccess ? 'Se modifico el riesgo exitosamente' : isError ? `Hubo un error al intentar modificar el Evento: ${(error as any).error}` : 'Error desconocido'}
                    </Alert>        
                }
            </DialogContent>
            <DialogActions>
                { isIdle ? 
                    <>
                        <Button variant='contained' onClick={handleSubmit}>
                            Listo 
                        </Button>
                        <Button variant='contained' onClick={handleClose}>
                            Cancelar
                        </Button>
                    </>
                    :
                    <>
                        <Button variant='contained' onClick={handleClose}>
                            Cancelar
                        </Button>
                    </>
                }
            </DialogActions>
        </BootstrapDialog>
    )    
};

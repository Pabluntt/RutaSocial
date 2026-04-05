import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { Alert, CircularProgress, TextField, Typography } from '@mui/material';
import InputDescription from '../Input/InputDescription';
import CloseDialogButton from '../Button/CloseDialogButton';
import useSessionStore from '../../stores/useSessionStore';
import { useEffect, useState } from 'react';
import { DateSelectArg } from '@fullcalendar/core/index.js';
import ComboBox from '../Button/ComboBox';
import { timeSlots } from '../../utils/calendar';
import { CalendarEvent } from '../../api/models/Calendar';
import { useCalendarEvents, useCreateCalendarEvent } from '../../api/hooks/CalendarEventHooks';
import { useProfile } from '../../api/hooks/UserHooks';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(3),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

export type DialogCreateRiskProps = { 
    stateOpen : [ boolean, React.Dispatch<React.SetStateAction<boolean>>]
    stateSelectInfo : [ DateSelectArg | null, React.Dispatch<React.SetStateAction<DateSelectArg | null>>]
}


export default function DialogCreateEventCalendar({ stateOpen, stateSelectInfo } : DialogCreateRiskProps) {

    const authorID = useProfile().data?.id
    const [ open, setOpen ] = stateOpen
    const [ selectInfo, setSelectInfo ] = stateSelectInfo
    const [ startTime, setStartTime] = useState<string>();
    const [ endTime, setEndTime] = useState<string>();
    const [ listEndTime, setListEndTime] = useState<string[]>([]);
    const [ formCalendarEvent, setFormCalendarEvent ] = useState<Omit<CalendarEvent, 'id' | 'authorName' | 'colorInstitution'>>({
        title : '',
        description : '',
        dateStart : new Date(),
        authorID : '',
        timeStart : '',
        timeEnd : ''
    }) 
    const [ formErrors, setFormErrors ] = useState({
        errorTitle : '',
        errorDescription : '',
        errorDateStart : '',
        errorStartTime : '',
        errorEndTime : ''
    })

    const getEndTime = (indexStart : number) => (
        timeSlots.filter((_, index) => ( index > indexStart ))
    )

    const clearStates = () => {
        setSelectInfo(null)
        setStartTime(undefined)
        setEndTime(undefined)
        setListEndTime([])
        setFormCalendarEvent({title : '', description : '', dateStart : new Date(), authorID : '', timeEnd : '' , timeStart : ''})
        setFormErrors({errorDateStart : '', errorDescription : '', errorTitle : '', errorStartTime : '', errorEndTime : ''})
        reset()
    }

    const handleClose = () => {
        clearStates()
        setOpen(false)
    }

    const { refetch } = useCalendarEvents()
    const { isIdle, isPending, isSuccess, isError, mutate, reset } = useCreateCalendarEvent()
    
    const handleOnChangeTitle = (e : React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormCalendarEvent(prev => ({...prev, title : e.target.value}))
        setFormErrors(prev => ({...prev, errorTitle : ''}))
    }
    const handleOnBlurTitle = (e : React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if(!formCalendarEvent.title) {
            setFormErrors(prev => ({...prev, errorTitle : 'El título debe ser obligatorio'}))
        }
    }
    const handleOnChangeDescription = ( e : React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormCalendarEvent(prev => ({...prev, description : e.target.value}))
        setFormErrors(prev => ({...prev, errorDescription : ''}))
    }
    
    const validateForm = () => {
        const errors = {
            errorTitle: '',
            errorDescription: '',
            errorDateStart: '',
            errorStartTime : '',
            errorEndTime : ''
        }
        let isValid = true

        if(!formCalendarEvent.title.trim()) {
            errors.errorTitle = 'El título es obligatorio'
            isValid = false
        }
        if(!formCalendarEvent.dateStart) {
            errors.errorDateStart = 'La fecha es obligatoria'
            isValid = false
        }
        if(!startTime) {
            errors.errorStartTime = 'Escoge una hora de inicio'
            isValid = false 
        }
        if(!endTime && startTime) {
            errors.errorEndTime = 'Escoge una hora estimada de finalización'
            isValid = false
        }
        if(!authorID) {
            isValid = false
        }
        setFormErrors(errors)
        return isValid
    }


    const handleSubmit = () => {
        if(!validateForm()) return 

        const newEvent : Omit<CalendarEvent, 'id' | 'authorName' | 'colorInstitution'>= {
            ...formCalendarEvent,
            title: formCalendarEvent.title,
            authorID: authorID as string,
            timeStart: startTime as string,
            timeEnd: endTime as string
        }
        if(selectInfo) {
            console.log(selectInfo.startStr)
            selectInfo.view.calendar.addEvent({
                id: '123',
                title: formCalendarEvent.title,
                start: selectInfo.startStr,
                end: selectInfo.endStr,
                allDay: true,
                color: 'red'
            })
            selectInfo.view.calendar.unselect();
        }
        console.log(newEvent)

        mutate(newEvent)
    }


    useEffect(() => {
        if(isSuccess) {
            refetch()
            setTimeout(() => {
                handleClose()
            }, 1000)
        }
    }, [isSuccess])


    useEffect(() => {
       if(open) {
            if(selectInfo) {
                setFormCalendarEvent(prev => ({...prev, dateStart : new Date(selectInfo.startStr)}))
            } else {
                setOpen(false)
                alert('error: date nulltype')
            }
       }
    }, [selectInfo])

    useEffect(() => {
        if(startTime) {
            const index = timeSlots.indexOf(startTime)
            setListEndTime(getEndTime(index))
        }
    }, [startTime])
    
    return (
        <BootstrapDialog 
            fullWidth
            open={open} 
            onClose={handleClose}
            aria-labelledby='create-event'
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
                            Agrega un nuevo evento al calendario. Solo necesitas un título, una breve descripción y la fecha.
                        </Typography>
                        <TextField
                            required
                            variant='standard'
                            label='Título'
                            placeholder='Ingresa el título del evento'
                            value={formCalendarEvent.title}
                            onChange={handleOnChangeTitle}
                            onBlur={handleOnBlurTitle}
                            error={formErrors.errorTitle !== ''}
                            helperText={formErrors.errorTitle}
                        />
                        <InputDescription 
                            maxLength={100}
                            maxRows={6}
                            variant='standard'
                            label='Descripción'
                            placeholder='Ingresa la descripción del evento'
                            value={formCalendarEvent.description}       
                            onChange={handleOnChangeDescription}        
                        />
                        <div className="flex flex-col  gap-2">
                            <label htmlFor="horario" className="text-sm font-medium text-gray-700">
                                Horario
                            </label>
                            <div className='flex flex-row gap-4 justify-center items-center'>
                                <ComboBox size='small'  onChange={(e, value, reason) => {
                                    if(reason === 'clear') {
                                        setEndTime(undefined)
                                    }
                                    setStartTime(value as string)
                                }} 
                                label='Empieza' 
                                options={timeSlots} />
                                <p>-</p> 
                                <ComboBox size='small' onChange={(e, value) => {setEndTime(value as string)}} disabled={startTime == undefined} label='Termina' options={listEndTime as string[]}/>
                            </div>                           
                            <Typography variant='caption' color='error'>
                                {formErrors.errorStartTime ? formErrors.errorStartTime : formErrors.errorEndTime}
                            </Typography>
                        </div>
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
                            Crear Evento
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

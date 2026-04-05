import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useEffect, useState } from 'react'
import { DateSelectArg, EventClickArg } from '@fullcalendar/core'
import { IconButton, Popover, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material'
import esLocale from '@fullcalendar/core/locales/es';
import { isSingleDaySelection } from '../utils/calendar'
import DialogCreateEventCalendar from './Dialog/DialogCreateEventCalendar'
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useCalendarEvents, useDeleteCalendarEvent } from '../api/hooks/CalendarEventHooks'
import { CalendarEvent } from '../api/models/Calendar'
import { useEventCalendarUpdateDialog } from '../context/EventCalendarUpdateContext'
import DialogUpdateEventCalendar from './Dialog/DialogUpdateEventCalendar'
import { useProfile } from '../api/hooks/UserHooks'
import { useAuth } from '../context/AuthContext'
import { Role } from '../Enums/Role'

export default function Calendar() {

    const userID = useProfile().data?.id
    const { role } = useAuth()
    const [selectInfo, setSelectInfo] = useState<DateSelectArg | null>(null)
    const [open, setOpen] = useState(false)
    const [ eventCalendar, setEventCalendar ] = useEventCalendarUpdateDialog()


    
    const handleDateSelect = (selectInfo: DateSelectArg) => {
        setSelectInfo(selectInfo)
        setOpen(true)
    };

    const { isError, isPending, isSuccess, data, error, refetch} = useCalendarEvents()
    const deleteQuery = useDeleteCalendarEvent() 
    const mutate = deleteQuery.mutate

    
    const [ eventClicked, setEventClicked ] = useState<CalendarEvent | undefined>(undefined)
    const [ anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
    const openPopover = Boolean(anchorEl)
    const id =  openPopover ? 'view-event-popover' : undefined

    const handleCloseEventView = () => {
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }
        setAnchorEl(null)
        setTimeout(() => {
            setEventClicked(undefined)
        }, 300)
    }

    useEffect(() => {
        console.log(error)
        if(isSuccess) {
            console.log("aca en calendar: ", data)
        }
    }, [data])

    useEffect(() => {
        if(deleteQuery.data) {
            handleCloseEventView()
            refetch()
        }
    }, [deleteQuery.data])

    const handleEventClick = (clickInfo : EventClickArg) => {
        setAnchorEl(clickInfo.el)
        if(isSuccess) {
            const index_event = data.findIndex((ev) => ( ev.id === clickInfo.event.id ))
            if(index_event !== -1) {
                setEventClicked(data[index_event])
            }
        }
    }
    const theme = useTheme();
    const computerDevice = useMediaQuery(theme.breakpoints.up('sm'));

    return (
        <div className='flex flex-col w-full h-full'>
            <div className='px-2 sm:px-10 w-full'>
                <FullCalendar 
                    longPressDelay={100}
                    plugins={[ dayGridPlugin, timeGridPlugin, interactionPlugin ]}
                    headerToolbar={{
                        left: ( computerDevice ? 'prev,next today' : 'prev,next'),
                        center: 'title',
                        right: ( computerDevice ? 'dayGridMonth' : '')
                    }}
                    initialView="dayGridMonth"
                    timeZone='local'
                    firstDay={1}
                    height="auto" 
                    contentHeight="auto"
                    selectMirror={true}
                    dayMaxEvents={(computerDevice ? true : 2)}
                    unselectAuto
                    locale={esLocale}
                    events={data?.map((event, index) => ({
                        id : event.id,
                        start : event.dateStart.toISOString().slice(0, 10),
                        title : ((computerDevice || event.title.length < 5) ? event.title : event.title.slice(0, 5) + '...'),
                        allDay : true,
                        color: event.colorInstitution
                    }))}
                    select={handleDateSelect}
                    selectable={true}
                    selectAllow={isSingleDaySelection}
                    displayEventTime={false}
                    eventClick={handleEventClick}
                    dayHeaderFormat={computerDevice ? { weekday: 'long' } : { weekday: 'short' }}
                    titleFormat={computerDevice ? { year: 'numeric', month: 'long' } : { year: 'numeric', month: 'short' }}
                    
                    
                />
            </div>
            <Popover
                id={id}
                open={openPopover}
                anchorEl={anchorEl}
                onClose={handleCloseEventView}
                anchorOrigin={{ vertical: "center", horizontal: "right" }}
                transformOrigin={{ vertical: "center", horizontal: "left" }}
                marginThreshold={16}
                slotProps={{
                    paper: {
                        elevation : 6,
                        sx : {
                            borderRadius : 10,
                            bgcolor : '#f0f4f9',
                            marginTop: 1,
                            paddingBottom : 4,
                            width : 400,
                            minHeight : 240,
                            maxHeight : 500 ,
                            overflowY: 'auto'
                        }
                    },
                }}
            >
                <div className="flex flex-row justify-end items-center py-3 px-5">
                    <div className='flex flex-row gap-5'>
                        <div className='flex flex-row gap-1'>
                            { (role === Role.admin) || (userID === eventClicked?.authorID) ?
                                <div>
                                    <Tooltip title={'Editar Evento'}>
                                        <IconButton onClick={() => {
                                            if(eventClicked === undefined) return 
                                            setEventCalendar(eventClicked)
                                        }}>
                                            <EditIcon htmlColor="black" fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title={'Eliminar Evento'}>
                                        <IconButton onClick={() => {
                                            if(eventClicked === undefined) return
                                            mutate(eventClicked.id)
                                        }}>
                                            <DeleteIcon htmlColor="black" fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </div>
                                :
                                <>
                                </>
                            }
                        </div>
                        <Tooltip title={'Cerrar'}>
                            <IconButton onClick={handleCloseEventView}>
                                <CloseIcon htmlColor="black" fontSize="small" />
                            </IconButton>
                        </Tooltip>

                    </div>
                </div>
                <div className='flex flex-col py-1 px-8'>
                    { eventClicked ? 
                        <div className='flex w-full h-full flex-col justify-between items-start'>
                            <Typography variant='h6'>
                                {eventClicked.title}
                            </Typography>
                            <Typography variant='inherit'>
                                {format(eventClicked.dateStart, "EEEE, dd 'de' MMMM", { locale : es})}
                                <Typography variant='caption' fontSize={12} sx={{ color : 'text.secondary'}}>
                                    {`, a las ${eventClicked.timeStart} hasta ${eventClicked.timeEnd}`}
                                </Typography>
                            </Typography>
                            <div className='px-2 py-4'>
                                <Typography variant='body1' textAlign={'justify'}>
                                    {eventClicked?.description}
                                </Typography>
                            </div>
                            <Typography 
                            variant="caption" 
                            sx={{ fontStyle: 'italic', color: 'text.secondary' }}
                            >
                            Creado por {eventClicked.authorName}
                            </Typography>
                        </div>
                        :
                        <div>
                            <Typography variant='subtitle1' color='error'>
                                Ha Ocurrido un Error al Mostar el Evento. Intente más tarde
                            </Typography>
                        </div>
                    }
                </div>
            </Popover>
            <DialogUpdateEventCalendar />
            <DialogCreateEventCalendar stateOpen={[open, setOpen]} stateSelectInfo={[selectInfo, setSelectInfo]}  />
        </div>
    )  
};


/* 
    const handleSubmitEvent = () => {
        if(!selectInfo) return
        if(!startTime) return 
        if(!endTime) return 
        if(!title) return 

        selectInfo.view.calendar.addEvent({
            id: '123',
            title: `${startTime} - ${endTime} | ${title}`,
            start: selectInfo.startStr,
            end: selectInfo.endStr,
            allDay: true,
            color: 'red'
        })
        selectInfo.view.calendar.unselect();
        handleClose();
    }
*/
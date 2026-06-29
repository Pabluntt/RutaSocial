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
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { format, isToday } from 'date-fns'
import { Alert, CircularProgress } from '@mui/material'
import { es } from 'date-fns/locale'
import { useCalendarEvents, useDeleteCalendarEvent } from '../api/hooks/CalendarEventHooks'
import { CalendarEvent } from '../api/models/Calendar'
import { useEventCalendarUpdateDialog } from '../context/EventCalendarUpdateContext'
import DialogUpdateEventCalendar from './Dialog/DialogUpdateEventCalendar'
import { useProfile } from '../api/hooks/UserHooks'
import { useAuth } from '../context/AuthContext'
import { Role } from '../Enums/Role'
import { useNavigate } from 'react-router-dom'
import useSessionStore from '../stores/useSessionStore'
import { RouteService } from '../api/services/RouteService'
import { CalendarService } from '../api/services/CalendarService'
import { useAppSnackbar } from '../context/SnackbarContext'
import './Calendar.css'

const isHexColor = (color: string | undefined): color is string => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color ?? '')

export default function Calendar() {

    const { accessToken } = useSessionStore()
    const profileQuery = useProfile(!!accessToken)
    const userID = profileQuery.data?.id
    const { role } = useAuth()
    const navigate = useNavigate()
    const { setRouteStatus, setRouteId } = useSessionStore()
    const [selectInfo, setSelectInfo] = useState<DateSelectArg | null>(null)
    const [open, setOpen] = useState(false)
    const [ eventCalendar, setEventCalendar ] = useEventCalendarUpdateDialog()
    const { isError, isPending, isSuccess, data, refetch} = useCalendarEvents(!!accessToken)
    const deleteQuery = useDeleteCalendarEvent()
    const mutate = deleteQuery.mutate
    const [ eventClicked, setEventClicked ] = useState<CalendarEvent | undefined>(undefined)
    const [ anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
    const theme = useTheme()
    const computerDevice = useMediaQuery(theme.breakpoints.up('sm'))
    const openPopover = Boolean(anchorEl)
    const id =  openPopover ? 'view-event-popover' : undefined
    const { showSnackbar } = useAppSnackbar()


    
    const handleDateSelect = (selectInfo: DateSelectArg) => {
        setSelectInfo(selectInfo)
        setOpen(true)
    };

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

    const handleStartRoute = async () => {
        if(!eventClicked) return
        
        // Validar que la fecha del evento sea hoy
        if(!isToday(eventClicked.dateStart)) {
            showSnackbar('Solo puedes iniciar rutas agendadas para hoy', 'warning')
            return
        }

        let routeId = eventClicked.routeID

        // Si el evento no tiene ruta vinculada, crear una automáticamente
        if(!routeId || routeId === '000000000000000000000000') {
            try {
                const newRoute = await RouteService.CreateRoute({
                    title: eventClicked.title,
                    description: eventClicked.description,
                    route_leader: eventClicked.authorID
                })
                routeId = newRoute.id

                await CalendarService.UpdateEvent({
                    _id: eventClicked.id,
                    title: eventClicked.title,
                    description: eventClicked.description,
                    date_start: eventClicked.dateStart.toISOString(),
                    author_id: eventClicked.authorID,
                    time_start: eventClicked.timeStart,
                    time_end: eventClicked.timeEnd,
                    route_id: routeId
                })

                refetch()
            } catch (error) {
                console.error('Error al crear ruta automática', error)
                showSnackbar('Error al crear la ruta automática. Intenta de nuevo.', 'error')
                return
            }
        } else {
            // Validar que la ruta exista en el backend
            try {
                await RouteService.FindRouteByID(routeId)
            } catch (error) {
                console.error('Ruta vinculada no disponible', error)
                showSnackbar('La ruta vinculada a este evento no existe o no está disponible. Crea una nueva ruta y vincúlala al evento.', 'error')
                return
            }
        }

        // Establecer la ruta como activa
        setRouteStatus(true)
        setRouteId(routeId)
        
        // Cerrar el popover y navegar al mapa
        handleCloseEventView()
        navigate('/mapa')
    }

    return (
        <div className='flex flex-col w-full h-full'>
            {isPending && (
              <div className="flex justify-center items-center py-20">
                <CircularProgress />
              </div>
            )}
            {isError && (
              <Alert severity="error" sx={{ mx: 2, sm: 10, mt: 2 }}>
                Error al cargar eventos del calendario.{' '}
                <span
                  className="underline cursor-pointer text-blue-600"
                  onClick={() => refetch()}
                >
                  Reintentar
                </span>
              </Alert>
            )}
            {!isPending && !isError && (
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
                    events={data?.map((event) => ({
                        id : event.id,
                        start : event.dateStart.toISOString().slice(0, 10),
                        title : event.title,
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
                    eventContent={(arg) => (
                        <span className="flex items-center gap-1.5 truncate w-full px-0.5">
                            <span
                                className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: isHexColor(arg.event.backgroundColor) ? arg.event.backgroundColor : '#3b82f6' }}
                            />
                            {computerDevice && (
                                <span className="truncate text-gray-700 font-medium leading-tight">
                                    {arg.event.title}
                                </span>
                            )}
                        </span>
                    )}
                    moreLinkContent={(arg) => (
                        <span className="text-gray-400 text-xs font-medium">+{arg.num} más</span>
                    )}
                />
            </div>
            )}
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
                            {eventClicked && isToday(eventClicked.dateStart) ? 
                                <Tooltip title={'Iniciar Ruta'}>
                                    <IconButton onClick={handleStartRoute} sx={{ color: 'success.main' }}>
                                        <PlayArrowIcon htmlColor="green" fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                :
                                <></>
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

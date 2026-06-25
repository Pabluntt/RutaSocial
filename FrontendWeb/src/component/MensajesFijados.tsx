import { useEffect, useState } from "react";
import { Divider, Typography, Paper, IconButton, Popover, ListItem, CircularProgress, ListItemText, Tooltip, Badge, useMediaQuery, useTheme } from "@mui/material";
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import useSessionStore from "../stores/useSessionStore";
import NotificationsIcon from '@mui/icons-material/Notifications';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import Mensaje from "./Mensaje";
import { useMarkNotices, useNoticesMap, useDismissNotice } from "../api/hooks/NoticeHooks";
import { useProfile } from "../api/hooks/UserHooks";

import getCurrentLocation from "../utils/getCurrentLocation";
import { useWeather } from "../api/hooks/WeatherHooks";

export default function MensajesFijados() {

    const { accessToken, routeStatus } = useSessionStore()
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
    const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null)
    const handleClick = (event : any) => {
        setAnchorEl(event.currentTarget)
    }
    const handleClose = () => {
        setAnchorEl(null)
    }
    const open = Boolean(anchorEl)
    const id = open ? "notification-popover" : undefined

    const { isSuccess, isError, isLoading, data, refetch} = useNoticesMap()
    const { data: weather } = useWeather(coords?.latitude ?? null, coords?.longitude ?? null)

    useEffect(() => {
        getCurrentLocation()
            .then((pos) => setCoords(pos))
            .catch(() => {})
    }, [])

    const profile = useProfile()
    const currentUserId = profile.data?.id
    const mutationMarkNotice = useMarkNotices()
    const dismissNoticeMut = useDismissNotice()

    const onDismissNotice = (id: string) => {
        dismissNoticeMut.mutate(id, {
            onSuccess: () => refetch()
        })
    }

    const onClearNotices = () => {
        if(!data?.unread || data?.unread.length === 0) return 
        mutationMarkNotice.mutate(data.unread)
    }

    useEffect(() => {
        if(mutationMarkNotice.isSuccess) {
            refetch()
        }
    }, [mutationMarkNotice.isSuccess])

    const searchParams = new URLSearchParams(window.location.search)
    const isMockMode = searchParams.get('mock') === 'rain'

    const mockWeather = isMockMode ? {
        condition: 'clear',
        description: 'Cielo despejado',
        weatherCode: 0,
        temperature: 22,
        isCurrentlyRaining: false,
        willRain: true,
        willRain1Day: true,
        willRain2Days: true,
        forecast: [
            { hoursFromNow: 0, weatherCode: 0, condition: 'clear', description: 'Cielo despejado' },
            { hoursFromNow: 6, weatherCode: 45, condition: 'fog', description: 'Niebla' },
            { hoursFromNow: 24, weatherCode: 61, condition: 'rain', description: 'Está lloviendo' },
            { hoursFromNow: 30, weatherCode: 80, condition: 'rain_showers', description: 'Chubascos' },
        ],
    } : null

    const getSeverity = (condition: string): number => {
        switch (condition) {
            case 'thunderstorm': return 5
            case 'snow':
            case 'snow_showers':
            case 'freezing_rain': return 4
            case 'rain':
            case 'rain_showers': return 3
            case 'drizzle': return 2
            case 'fog': return 1
            default: return 0
        }
    }

    const effectiveWeather = mockWeather ?? weather

    const maxSeverity = effectiveWeather
        ? Math.max(
            effectiveWeather.isCurrentlyRaining ? 3 : 0,
            ...effectiveWeather.forecast.map(e => getSeverity(e.condition))
          )
        : 0

    const circleBgColor = effectiveWeather
        ? maxSeverity >= 3 ? '#FFCDD2' : maxSeverity >= 1 ? '#FFF9C4' : '#FFFFFF'
        : '#FFFFFF'

    const formatHours = (hours: number): string => {
        if (hours === 0) return 'Ahora'
        if (hours < 1) return 'En menos de 1 hora'
        if (hours === 1) return 'En 1 hora'
        if (hours < 24) return `En ${hours} horas`
        const days = Math.floor(hours / 24)
        const remaining = hours % 24
        if (remaining === 0) return `En ${days} día${days > 1 ? 's' : ''}`
        return `En ${days} día${days > 1 ? 's' : ''} y ${remaining} horas`
    }

    const theme = useTheme();
    const computerDevice = useMediaQuery(theme.breakpoints.up('sm'));

    return (
        <div className={"absolute right-8 flex gap-2 " + (computerDevice ? (routeStatus ? 'top-16' : 'top-8') : (routeStatus ? 'top-8' : 'top-6')) }>
            <Paper elevation={3} sx={{ borderRadius: '16px', bgcolor: circleBgColor, transition: 'background-color 0.3s ease' }}>
                <Badge badgeContent={isSuccess ? data.unread.length : 0} color="error" overlap="circular" >
                    <Tooltip title={effectiveWeather ? effectiveWeather.description : "Notificaciones"}>
                        <IconButton onClick={handleClick}>
                            { open ? <NotificationsNoneOutlinedIcon sx={{color : '#000000'}} fontSize={"large"}/> : <NotificationsIcon sx={{ color : '#000000'}} fontSize={"large"}/>}
                        </IconButton>
                    </Tooltip>
                </Badge> 
            </Paper>
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                marginThreshold={16}
                slotProps={{
                    paper: {
                        elevation : 3,
                        sx : {
                            marginTop: 1,
                            width : 600,
                            maxHeight : 500 ,
                            overflowY: 'auto',
                            borderRadius: '12px',
                        }
                    },
                }}
            >
                <div className="flex flex-row justify-between items-center py-2 px-4 bg-gray-50 border-b border-gray-200">
                    <Typography variant='subtitle1' sx={{ fontSize: 18, fontWeight: 600 }}>Notificaciones</Typography>
                    { isSuccess && data.unread.length !== 0 ?
                        <Tooltip title={'Marcar como leídos'}>
                            <IconButton onClick={onClearNotices} size="small">
                                <ClearAllIcon htmlColor="black" fontSize="medium" />
                            </IconButton>
                        </Tooltip>
                        :
                        <></>
                    }
                </div>
                {effectiveWeather && effectiveWeather.forecast.length > 0 &&
                    <>
                        <ListItem sx={{ display: 'flex', flexDirection: 'column', alignItems: 'start', gap: 1, bgcolor: '#FFF8E1', py: 1.5 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#f57f17' }}>
                                Pronóstico del clima{isMockMode ? ' (MOCK)' : ''}
                            </Typography>
                            {effectiveWeather.forecast
                                .slice()
                                .sort((a, b) => a.hoursFromNow - b.hoursFromNow)
                                .map((event, i) => (
                                    <Typography key={i} variant="body2" sx={{ color: '#333' }}>
                                        {formatHours(event.hoursFromNow)}: {event.description}
                                    </Typography>
                                ))}
                        </ListItem>
                        <Divider />
                    </>
                }
                {
                isLoading ? 
                    <ListItem>
                        <div className="flex grow items-center justify-center py-8">
                            <CircularProgress size={28} color='inherit' />
                        </div>
                    </ListItem>
                    :
                isSuccess ? 
                    
                    <div>
                        { data.unread.length !== 0 ? 
                            <ListItem sx={{ display : 'flex', flexDirection : 'column', alignItems : 'start', gap: 2, bgcolor: '#E3F2FD', py: 2 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1565c0' }}>Avisos nuevos</Typography>
                                {  
                                    data.unread.map((value, index) => (
                                    <div key={index} className="w-full">
                                        <Mensaje value={value} index={index} onDismiss={onDismissNotice} />
                                    </div>
                                    ))
                                }
                            </ListItem>
                            :
                            <></>
                        }
                        <Divider />
                        <ListItem sx={{ bgcolor: '#FAFAFA', py: 2 }}>
                            <div className="w-full">
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#616161', mb: 1 }}>Avisos antiguos</Typography>
                                { data.read.length !== 0 ?
                                    data.read.map((value, index) => (
                                    <div key={index} className="w-full">
                                        <Mensaje value={value} index={index} onDismiss={onDismissNotice} />
                                    </div>
                                    ))
                                    :
                                    <ListItem>
                                        <ListItemText
                                            primary = {
                                                <Typography variant="caption" color="gray" sx={{ fontStyle: 'italic' }}>
                                                    Sin notificaciones antiguas
                                                </Typography>
                                            }
                                        />
                                    </ListItem>
                                }
                            </div>
                        </ListItem>     
                    </div>
            
                    :
                    <ListItem>
                        <div className="flex grow items-center justify-center py-8">
                            <Typography color="error">Error al cargar notificaciones</Typography>
                        </div>
                    </ListItem>
                }
            </Popover>
        </div>
    )
};

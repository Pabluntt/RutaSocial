import { useEffect, useState } from "react";
import { Divider, Typography, Paper, IconButton, Popover, List, ListItem, CircularProgress, ListItemText, Tooltip, Badge, useMediaQuery, useTheme } from "@mui/material";
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import useSessionStore from "../stores/useSessionStore";
import NotificationsIcon from '@mui/icons-material/Notifications';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import Mensaje from "./Mensaje";
import { useMarkNotices, useNoticesMap } from "../api/hooks/NoticeHooks";

export default function MensajesFijados() {

    const { accessToken, routeStatus } = useSessionStore()
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
    const handleClick = (event : any) => {
        setAnchorEl(event.currentTarget)
    }
    const handleClose = () => {
        setAnchorEl(null)
    }
    const open = Boolean(anchorEl)
    const id = open ? "notification-popover" : undefined

    const { isSuccess, isError, isLoading, data, refetch} = useNoticesMap()

    useEffect(() => {
        if(data) {
            console.log(data)
        }
        console.log("data mensaje fijados: ", data)
    }, [data])


    const mutationMarkNotice = useMarkNotices() 

    const onClearNotices = () => {
        if(!data?.unread || data?.unread.length === 0) return 
        mutationMarkNotice.mutate(data.unread)
    }

    useEffect(() => {
        if(mutationMarkNotice.isSuccess) {
            refetch()
        }
    }, [mutationMarkNotice.isSuccess])



    const theme = useTheme();
    const computerDevice = useMediaQuery(theme.breakpoints.up('sm'));


    return (
        <div className={"absolute right-8 " + (computerDevice ? (routeStatus ? 'top-16' : 'top-8') : (routeStatus ? 'top-8' : 'top-6')) }>
            <Paper className="relative inline-block" sx={{ borderRadius : 9}}>
                <Badge badgeContent={isSuccess ? data.unread.length : 0} color="error" overlap="circular" >
                    <IconButton onClick={handleClick}>
                        { open ? <NotificationsNoneOutlinedIcon sx={{color : '#000000'}} fontSize={"large"}/> : <NotificationsIcon sx={{ color : '#000000'}} fontSize={"large"}/>}
                    </IconButton>
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
                        elevation : 1,
                        sx : {
                            marginTop: 1,
                            width : 600,
                            maxHeight : 500 ,
                            overflowY: 'auto'
                        }
                    },
                }}
            >
                <div className="flex flex-row justify-between items-center py-1 px-3">
                    <Typography variant='subtitle1' sx={{ fontSize : 18 }}>Notificaciones</Typography>
                    { isSuccess && data.unread.length !== 0 ?
                        <Tooltip title={'Marcar como leídos'}>
                            <IconButton onClick={onClearNotices}>
                                <ClearAllIcon htmlColor="black" fontSize="large" />
                            </IconButton>
                        </Tooltip>
                        :
                        <></>
                    }
                </div>
                <Divider />
                {
                isLoading ? 
                    <ListItem>
                        <div className="flex grow items-center justify-center">
                            <CircularProgress size={25} color='inherit' />
                        </div>
                    </ListItem>
                    :
                isSuccess ? 
                    
                    <div>
                        { data.unread.length !== 0 ? 
                            <ListItem sx={{ display : 'flex', flexDirection : 'column', alignItems : 'start', justifyItems: 'start', gap: 3, bgcolor: '#E3F2FD'}}>
                                <div>
                                    <Typography>Avisos nuevos</Typography>
                                    {  
                                        data.unread.map((value, index) => (
                                        <div key={index}>
                                            <Mensaje value={value} index={index} />
                                        </div>
                                        ))
                                    }
                                </div>
                            </ListItem>
                            :
                            <></>
                        }
                        <Divider />
                        <ListItem sx={{ bgcolor: '#F5F5F5'}}>
                            <div>
                                <Typography>Avisos antiguos</Typography>
                                { data.read.length !== 0 ?
                                    data.read.map((value, index) => (
                                    <div key={index}>
                                        <Mensaje value={value} index={index} />
                                    </div>
                                    ))
                                    :
                                    <ListItem>
                                        <ListItemText
                                            primary = {
                                                <Typography variant="caption" color="gray">
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
                        <Typography>error</Typography>
                    </ListItem>
                }
            </Popover>
        </div>
    )
};


/**
{
                isLoading ? 
                    <ListItem>
                        <div className="flex grow items-center justify-center">
                            <CircularProgress size={25} color='inherit' />
                        </div>
                    </ListItem>
                    :
                isSuccess ? 
                    data.length !== 0 ? 
                        data.map((value, index) => (
                            <div key={index}>
                                <Mensaje value={value} index={index} />
                                <Divider />
                            </div>
                        )) 
                        :
                        <ListItem>
                            <ListItemText
                                primary={
                                    <Typography color="gray" variant='subtitle2'>
                                        Sin notificaciones
                                    </Typography>
                                }

                            />
                        </ListItem>
                    :
                    <ListItem>
                        <Typography>error</Typography>
                    </ListItem>

                    
                } 



 */

/*
        <div className="absolute top-8 right-8">
            <Paper sx={{
                borderRadius : 9,
            }}>
                <IconButton>
                    <NotificationsIcon sx={{ color : '#000000'}} fontSize="large"/>
                </IconButton>
            </Paper>
        </div>



<div className="absolute top-4 left-1/2 -translate-x-1/2 w-3/5 items-start gap-2 rounded bg-white">
    <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1-content"
                    id="panel1-header"
                >  
                    <Typography variant="subtitle1">Avisos</Typography>                    
                </AccordionSummary>
                <Divider />
                <AccordionDetails>
                    <List className="max-h-[210px] overflow-y-auto">
                        {isSuccess ? list.map((value, index) => (
                            <Mensaje key={index} index={index} list={list} setList={setList} author={value.authorName ?? 'placeholder'} message={value.description ?? ' placeholder'}  />
                        )) : <p>Cargando...</p>}
                    </List>
            </AccordionDetails>
    </Accordion>
</div>

        */

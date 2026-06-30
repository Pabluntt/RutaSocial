import { SpeedDial, SpeedDialAction } from "@mui/material";
import NearMeIcon from '@mui/icons-material/NearMe';
import GroupsIcon from '@mui/icons-material/Groups';
import NavigationIcon from '@mui/icons-material/Navigation';
import CloseIcon from '@mui/icons-material/Close';

const icons = [
    {icon : <NearMeIcon /> , name : 'Crear una ruta'},
    {icon : <GroupsIcon /> , name : 'Unirse a una ruta'},
]

export interface SpeedDialogRouteProps {
    stateOpen : [ boolean, React.Dispatch<React.SetStateAction<boolean>>]
    stateOpenCreateRoute : [ boolean, React.Dispatch<React.SetStateAction<boolean>> ]
    stateOpenJoinRoute : [ boolean, React.Dispatch<React.SetStateAction<boolean>> ]
    children : React.ReactNode
} 

export default function SpeedDialCreateRoute({ stateOpen, stateOpenCreateRoute, stateOpenJoinRoute, children } : SpeedDialogRouteProps ) {

    const [ open, setOpen ] = stateOpen

    const [ openCreateRoute, setOpenCreateRoute ] = stateOpenCreateRoute
    const [ openJoinRoute, setOpenJoinRoute ] = stateOpenJoinRoute
    
    const handleOpen = () =>  { setOpen(true); } 
    const handleClose = () => { setOpen(false); } 

    const list = [{ 
        open : openCreateRoute, 
        setOpen : setOpenCreateRoute}, {
        open : openJoinRoute, 
        setOpen : setOpenJoinRoute,}
    ]

    return (
        <div>
            <SpeedDial 
                ariaLabel={"funcionalidades-ruta"} 
                icon={open ? <CloseIcon /> : <NavigationIcon />}
                open={open}
                onOpen={(_, reason) => {
                    if(reason == 'toggle') handleOpen()
                }}
                onClose={(_, reason) => {
                    if(reason == 'toggle') handleClose()
                }}
                FabProps={{
                    sx: {
                        bgcolor: 'secondary.main',
                        color: 'white',
                        '&:hover': {
                            bgcolor: 'secondary.dark',
                            transform: 'scale(1.05)',
                        },
                        transition: 'all 0.2s ease-in-out',
                        boxShadow: '0 4px 14px rgba(156, 39, 176, 0.35)',
                    },
                }}
                sx={{
                    '& .MuiSpeedDialAction-staticTooltipLabel': {
                        width: '9rem',
                        backgroundColor: 'rgba(46, 46, 46, 0.92)',
                        color: 'white',
                        fontSize: '13px',
                        textAlign: 'center',
                        borderRadius: '8px',
                        padding: '6px 12px',
                        fontWeight: 500,
                        letterSpacing: '0.3px',
                    },
                    '& .MuiSpeedDialAction-fab': {
                        transition: 'all 0.2s ease',
                    },
                }}
            >
                {icons.map((obj, i) => (
                    <SpeedDialAction 
                        key={obj.name}
                        icon={obj.icon}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleClose()
                            list[i].setOpen(true)
                        }}
                        slotProps={{
                            tooltip : {
                                title : obj.name,  
                                arrow : true,
                                open : true,
                            },
                            staticTooltip : {
                                title : obj.name,
                            },
                            staticTooltipLabel : {
                                sx : {
                                    width : '9rem',
                                    backgroundColor : 'rgb(46, 46, 46, 0.92)',
                                    color : 'white',
                                    fontSize : '13px',
                                    textAlign : 'center',
                                    borderRadius: '8px',
                                    padding: '6px 12px',
                                    fontWeight: 500,
                                },
                            }
                        }} 
                    />
                ))}
            </SpeedDial>
            {children}
        </div>
    )
};

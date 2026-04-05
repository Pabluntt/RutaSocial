import { SpeedDial, SpeedDialAction } from "@mui/material";
import NearMeIcon from '@mui/icons-material/NearMe';
import GroupsIcon from '@mui/icons-material/Groups';
import NavigationIcon from '@mui/icons-material/Navigation';
import CloseIcon from '@mui/icons-material/Close';
const icons = [
    {icon : <NearMeIcon /> , name : 'Crear una ruta'},
    {icon : <GroupsIcon /> , name : 'Unirse a una ruta'},
]

export type SpeedDialogRouteProps = {
    stateOpen : [ boolean, React.Dispatch<React.SetStateAction<boolean>>]
    stateOpenCreateRoute : [ boolean, React.Dispatch<React.SetStateAction<boolean>> ]
    stateOpenJoinRoute : [ boolean, React.Dispatch<React.SetStateAction<boolean>> ]
    children : React.ReactNode
} 

export default function SpeedDialCreateRoute({ stateOpen, stateOpenCreateRoute, stateOpenJoinRoute, children } : SpeedDialogRouteProps ) {


    const [ open, setOpen ] = stateOpen

    const [ openCreateRoute, setOpenCreateRoute ] = stateOpenCreateRoute
    const [ openJoinRoute, setOpenJoinRoute ] = stateOpenJoinRoute
    
    const handleOpen = () =>  setOpen(true) 
    const handleClose = () => setOpen(false) 

    const list = [{ 
        open : openCreateRoute, 
        setOpen : setOpenCreateRoute}, {
        open : openJoinRoute, 
        setOpen : setOpenJoinRoute,}
    ]

    
    return (
        <div >
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
                        },
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
                                sx : {
                                    fontSize : '3xl'
                                }
                            },
                            staticTooltipLabel : {
                                sx : {
                                    width : '9rem',
                                    backgroundColor : 'rgb(46, 46, 46, 0.9)',
                                    color : 'white',
                                    fontSize : '12px',
                                    textAlign : 'center',
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


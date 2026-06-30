import { SpeedDial, SpeedDialAction } from "@mui/material";
import PersonPinCircleIcon from '@mui/icons-material/PersonPinCircle';
import ReportIcon from '@mui/icons-material/Report';
import NavigationIcon from '@mui/icons-material/Navigation';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';

const icons = [
    {icon : <PersonPinCircleIcon /> , name : 'Registrar Persona'},
    {icon : <ReportIcon />, name: 'Reportar Riesgo'},
    {icon : <NavigationIcon />, name: 'Resumen Ruta'} 
]

export interface SpeedDialogRouteProps {
    stateOpen : [ boolean, React.Dispatch<React.SetStateAction<boolean>>]
    stateOpenDialogAttended : [ boolean, React.Dispatch<React.SetStateAction<boolean>> ]
    stateOpenDialogRisk : [ boolean, React.Dispatch<React.SetStateAction<boolean>> ]
    stateOpenDialogRoute : [ boolean, React.Dispatch<React.SetStateAction<boolean>> ]
    children : React.ReactNode
} 

export default function SpeedDialRoute({ stateOpen, stateOpenDialogAttended, stateOpenDialogRisk, stateOpenDialogRoute, children } : SpeedDialogRouteProps ) {

    const [ open, setOpen ] = stateOpen

    const [ openDialogAttended, setOpenDialogAttended ] = stateOpenDialogAttended
    const [ openDialogRisk, setOpenDialogRisk ] = stateOpenDialogRisk
    const [ openDialogRoute, setOpenDialogRoute ] = stateOpenDialogRoute
    
    const handleOpen = () =>  { setOpen(true); } 
    const handleClose = () => { setOpen(false); } 

    const list = [{ 
        open : openDialogAttended, 
        setOpen : setOpenDialogAttended}, {
        open : openDialogRisk, 
        setOpen : setOpenDialogRisk,}, {
        open  : openDialogRoute,
        setOpen : setOpenDialogRoute 
    }]

    return (
        <>
            <SpeedDial 
                ariaLabel={"funcionalidades-ruta"} 
                icon={<SpeedDialIcon />}
                open={open}
                onOpen={(_, reason) => {
                    if(reason == 'toggle') handleOpen()
                }}
                onClose={(_, reason) => {
                    if(reason == 'toggle') handleClose()
                }}
                FabProps={{
                    sx: {
                        bgcolor: '#0288d1',
                        color: 'white',
                        '&:hover': {
                            bgcolor: '#01579b',
                            transform: 'scale(1.05)',
                        },
                        transition: 'all 0.2s ease-in-out',
                        boxShadow: '0 4px 14px rgba(2, 136, 209, 0.4)',
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
                    '& .MuiSpeedDialAction-staticTooltip': {
                        fontSize: '3xl',
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
        </>
    )
};

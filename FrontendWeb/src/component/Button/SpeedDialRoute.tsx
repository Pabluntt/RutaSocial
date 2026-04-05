import { SpeedDial, SpeedDialAction } from "@mui/material";
import PersonPinCircleIcon from '@mui/icons-material/PersonPinCircle';
import ReportIcon from '@mui/icons-material/Report';
import NavigationIcon from '@mui/icons-material/Navigation';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';




const icons = [
    {icon : <PersonPinCircleIcon /> , name : 'Registar Persona'},
    {icon : <ReportIcon />, name: 'Reportar Riesgo'},
    {icon : <NavigationIcon />, name: 'Resumen Ruta'} 
]


export type SpeedDialogRouteProps = {
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
    
    const handleOpen = () =>  setOpen(true) 
    const handleClose = () => setOpen(false) 

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
        </>
    )
};


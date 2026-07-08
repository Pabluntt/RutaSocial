import { useEffect, useState } from "react"
import { ListItemButton, ListItemText, Collapse, List, ListItemButtonProps, ListItem, IconButton, Fade } from "@mui/material"
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { useHelpPointUpdateDialog } from "../../context/HelpPointUpdateContext";
import { HelpPoint } from "../../api/models/HelpPoint";
import { Route } from "../../api/models/Route";
import { useProfile } from "../../api/hooks/UserHooks";
import { useAuth } from "../../context/AuthContext";
import { Role } from "../../Enums/Role";
import { RouteService } from "../../api/services/RouteService";

type ListRouteItemProps = {
    route : Route
    stateHelpPoints : [ HelpPoint[], React.Dispatch<React.SetStateAction<HelpPoint[]>> ]
    stateShowLocation : [ boolean, React.Dispatch<React.SetStateAction<boolean>> ]
    stateLocation : [ number[], React.Dispatch<React.SetStateAction<number[]>> ] 
    openRoot : boolean
    defaultOpen ?: boolean
    compact ?: boolean
} & ListItemButtonProps

export default function ListRouteItem({ route, stateHelpPoints, stateShowLocation, stateLocation, openRoot, defaultOpen = false, compact = false, onClick, ...props} : ListRouteItemProps) {
    

    const userID = useProfile().data?.id
    const { role } = useAuth()
    const [ open, setOpen ] = useState(defaultOpen)
    const [ helpPoints, setHelpPoints ] = stateHelpPoints
    const [ hpRoutes, setHPRoutes ] = useState<HelpPoint[]>([])
    const [ _, setHelpPointUpdate ] = useHelpPointUpdateDialog()


    const [ , setLocation ] = stateLocation
    const [ , setShowLocation ] = stateShowLocation


    const [ selectedIndex, setSelectedIndex ] = useState(-1)
    const handleClickSelected = (_ : React.MouseEvent<HTMLDivElement>, index : number) => {
        setSelectedIndex(index === selectedIndex ? -1 : index)
    }
    

    const handleClick = (e : React.MouseEvent<HTMLDivElement>) => {
        if(onClick) {
            onClick(e)
        }
        setOpen(prev => !prev)
    }

    useEffect(() => {
        setHPRoutes(helpPoints.filter((hp) => hp.routeID === route.id))
    }, [helpPoints, route.id])

    useEffect(() => {
        const disabled = !open || !openRoot
        setHelpPoints(prev => {
            let changed = false
            const next = prev.map((hp) => {
                if(route.id !== hp.routeID || hp.disabled === disabled) return hp
                changed = true
                return { ...hp, disabled }
            })
            return changed ? next : prev
        })
        return () => {
            setHelpPoints(prev => {
                let changed = false
                const next = prev.map((hp) => {
                    if(route.id !== hp.routeID || hp.disabled) return hp
                    changed = true
                    return { ...hp, disabled: true }
                })
                return changed ? next : prev
            })
        }
    }, [helpPoints.length, open, openRoot, route.id, setHelpPoints])


    const handleDownload = async (e: React.MouseEvent) => {
        e.stopPropagation()
        try {
            await RouteService.DownloadRouteReport(route.id, route.title)
        } catch (err) {
            console.error('Error al descargar el informe:', err)
        }
    }

    return ( 
        <>
            <ListItem
                secondaryAction={
                    <IconButton edge="end" aria-label="Descargar Informe" onClick={handleDownload} size="small">
                        <FileDownloadIcon fontSize="small" />
                    </IconButton>
                }
                disablePadding
            >
                <ListItemButton {...props} onClick={handleClick} sx={{ pl: compact ? 2 : 4, pr: 6, minWidth: 0 }} selected={open}>
                    <ListItemText
                        primary={route.title}
                        primaryTypographyProps={{ noWrap: true, fontSize: compact ? 14 : undefined }}
                    />
                    {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </ListItemButton>
            </ListItem>
            <Collapse in={open} timeout="auto" unmountOnExit>
                <List component="div" disablePadding dense>
                    { open ? 
                        hpRoutes.map((hp, index) => (
                            <ListItem 
                                key={index} 
                                sx={{ padding : 0}}
                                secondaryAction={ role === Role.admin || userID == hp.authorID ?
                                        <Fade in={selectedIndex === index}>
                                            <IconButton edge="end" aria-label="Editar Punto Ayuda" onClick={() => {
                                                if(selectedIndex === index) {
                                                    setHelpPointUpdate(hp)
                                                }
                                            }}>
                                                <EditIcon fontSize="small"/>
                                            </IconButton>
                                        </Fade>
                                        :
                                        <></>
                                    }
                                
                            >
                                <ListItemButton
                                    
                                    selected={selectedIndex === index}
                                    sx={{ pl: compact ? 4 : 8, pr: 6, minWidth: 0 }}
                                    onClick={(e) => {
                                        if(selectedIndex !== index) {
                                            setLocation(hp.coords)
                                            setShowLocation(true)
                                        }
                                        handleClickSelected(e, index)
                                    }}
                                    >
                                    <ListItemText
                                        primary={`Punto de Ayuda N°${index+1}`}
                                        primaryTypographyProps={{ noWrap: true, fontSize: compact ? 13 : undefined }}
                                    />
                                </ListItemButton>
                            </ListItem> 
                        ))
                        : 
                            null
                    }
                </List>
            </Collapse>
        </>
    )


};

import { useEffect, useState } from "react"
import { ListItemButton, ListItemText, Collapse, List, Divider, ListItemButtonProps, Chip } from "@mui/material"
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ListRouteItem from "./ListRouteItem";
import { Route } from "../../api/models/Route";
import { HelpPoint } from "../../api/models/HelpPoint";


type ListRouteItemProps = {
    date : string
    children ?: React.ReactNode
    defaultOpen ?: boolean
    routes : Route[]
    stateHelpPoints : [ HelpPoint[], React.Dispatch<React.SetStateAction<HelpPoint[]>> ]
    stateShowLocation : [ boolean, React.Dispatch<React.SetStateAction<boolean>> ]
    stateLocation : [ number[], React.Dispatch<React.SetStateAction<number[]>> ] 
    onlyUser : boolean
    compact ?: boolean
} & ListItemButtonProps

const monthMap: Record<string, string> = {
    enero: 'ene.',
    febrero: 'feb.',
    marzo: 'mar.',
    abril: 'abr.',
    mayo: 'may.',
    junio: 'jun.',
    julio: 'jul.',
    agosto: 'ago.',
    septiembre: 'sept.',
    octubre: 'oct.',
    noviembre: 'nov.',
    diciembre: 'dic.',
}

const formatCompactDate = (date: string) => {
    const match = date.match(/^(\d{1,2}) de ([a-záéíóúñ]+) de (\d{4})$/i)
    if (!match) return date

    const [, day, month, year] = match
    return `${day.padStart(2, '0')} ${monthMap[month.toLowerCase()] ?? month.slice(0, 3)} ${year}`
}

export default function ListDateItem({ date, defaultOpen = false, routes, stateHelpPoints, stateLocation, stateShowLocation, onlyUser, compact = false, onClick, ...props } : ListRouteItemProps) {
    
    const [ open, setOpen ] = useState(defaultOpen)
    const [ helpPoints , setHelpPoints ] = stateHelpPoints

    const [ selectedIndex, setSelectedIndex ] = useState(0)
    const handleClickSelected = (_ : React.MouseEvent<HTMLDivElement>, index : number) => {
        setSelectedIndex(index === selectedIndex ? -1 : index)
    }

    const handleClick = (e :React.MouseEvent<HTMLDivElement>) => {
        if(onClick) {
            onClick(e)
        }
        setOpen(prev => !prev)
    }

    useEffect(() => {
        setHelpPoints(prev => prev.map((hp) => {
            if(routes.findIndex((r) => r.id === hp.routeID) !== -1) {
                hp.disabled = !open
            }
            return hp
        }))
    }, [])

    return ( 
        <>
            <ListItemButton onClick={handleClick} {...props} selected={open} sx={[{ pr: 1, gap: 1 }, ...(Array.isArray(props.sx) ? props.sx : props.sx ? [props.sx] : [])]}>
                <ListItemText
                    primary={compact ? formatCompactDate(date) : date}
                    secondary={compact ? `${routes.length} ${routes.length === 1 ? 'ruta' : 'rutas'}` : undefined}
                    primaryTypographyProps={{ noWrap: true, fontWeight: 600, fontSize: compact ? 14 : undefined }}
                    secondaryTypographyProps={{ fontSize: 12 }}
                    title={date}
                />
                {!compact ? <Chip label={routes.length} size="small" variant="outlined" /> : null}
                {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItemButton>
            <Collapse in={open} timeout="auto" unmountOnExit>
                <List subheader={<Divider />} dense>
                    {routes.map((route, i) => (
                        <ListRouteItem 
                            openRoot={open}
                            stateLocation={stateLocation} 
                            stateShowLocation={stateShowLocation} 
                            stateHelpPoints={stateHelpPoints} 
                            route={route} 
                            key={i}
                            defaultOpen={!compact && i === 0}
                            compact={compact}
                            

                        />
                    ))}
                </List>
            </Collapse>
        </>
    )


};

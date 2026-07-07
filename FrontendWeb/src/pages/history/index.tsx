import { Paper, useMediaQuery, useTheme } from "@mui/material";
import CustomDrawer from "../../component/CustomDrawer";
import DrawerList from "../../component/DrawerList";
import Mapa from "../../component/Map/Mapa";
import { Position } from "../../utils/getCurrentLocation";
import { useEffect, useState } from "react";
import ListHistory from "./ListHistory";
import useSessionStore from "../../stores/useSessionStore";
import HandlerLocationHistory from "./handlerLocationHistory";
import { endOfWeek, format, startOfWeek } from "date-fns";
import { es } from 'date-fns/locale';
import DialogUpdateAtended from "../../component/Dialog/DialogUpdateAttended";
import compareSort from "../../utils/compareDate";
import Sidebar from "../../component/Sidebar";
import { Route } from "../../api/models/Route";
import { HelpPoint } from "../../api/models/HelpPoint";
import { useProfile } from "../../api/hooks/UserHooks";
import { useRoutes, useRoutesByUser, useRoutesByInstitution } from "../../api/hooks/RouteHooks";
import { useHelpPoints } from "../../api/hooks/HelpPointHooks";
import { RouteStatus } from "../../Enums/RouteStatus";



function getFormatDate(a : Date, opt : string) {
    if(opt == 'Día') {
        return format(a, "d 'de' MMMM 'de' yyyy", { locale : es})
    } else if(opt == 'Semana') {
        const start = startOfWeek(a, { weekStartsOn : 1})
        const end  = endOfWeek(a, {weekStartsOn: 1})
        return `${format(start, "d 'de' MMMM", {locale : es})} al ${format(end, "d 'de' MMMM 'de' yyyy", {locale : es})}`
    } else {
        return format(a, "MMMM 'de' yyyy", { locale : es })
    }
}

export default function RouteHistory() {

    const [ currentLocation, setCurrentLocation ] = useState<Position>({latitude : -29.959003986327698, longitude : -71.34176826076656})
    const [ mapRoutes, setMapRoutes ] = useState<Map<string, Route[]>>(new Map())
    const [ helpPoints, setHelpPoints ] = useState<HelpPoint[]>([])
    const [ HPLocation, setHPLocation ] = useState<number[]>([])
    const [ showLocation, setShowLocation ] = useState(false) 
    const [ opFecha, setOPFecha ] = useState('Día')

    const [ onlyUser, setOnlyUser ] = useState(false)
    const [ onlyInstitution, setOnlyInstitution ] = useState(false)
    const [ routes, setRoutes ] = useState<Route[]>([])

    const { accessToken } = useSessionStore()
    const profileQuery = useProfile(!!accessToken)
    const userID = profileQuery.data?.id
    const institutionID = profileQuery.data?.institutionID
    const useQueryRouteAll = useRoutes(!!accessToken)
    const useQueryRouteByUserID = useRoutesByUser(userID)
    const useQueryRouteByInstitution = useRoutesByInstitution(institutionID, onlyInstitution)
    const useQueryHP= useHelpPoints()

    const [ countFetched, setCountFetched ] = useState(0)
    useEffect(() => {
        if(useQueryHP.isSuccess) {
            const hpsort = useQueryHP.data.sort((a, b) => {
                if(a.dateRegister === b.dateRegister) return 0
                else if(a.dateRegister < b.dateRegister) return -1 
                else return 1
            })
            if(countFetched === 0) {
                setHelpPoints(hpsort.map((hp) => {
                    hp.disabled = true; return hp;
                }))
                setCountFetched(prev => prev + 1)
            } else {
                setHelpPoints(hpsort.map((hp, index) => {
                    if(index < helpPoints.length) {
                        hp.disabled = helpPoints[index].disabled
                    } else {
                        hp.disabled = true
                    }
                    return hp
                }))
                setCountFetched(prev => prev + 1)
            }  
        }
    }, [useQueryHP.data])

    useEffect(() => {
        if (onlyInstitution && institutionID) {
            useQueryRouteByInstitution.refetch()
        } else if(onlyUser && userID) {
            useQueryRouteByUserID.refetch()
        } else if(!onlyUser && !onlyInstitution){
            useQueryRouteAll.refetch()
        }
    }, [onlyUser, onlyInstitution, userID, institutionID])

    useEffect(() => {
        let data: Route[] | undefined
        if (onlyInstitution) {
            data = useQueryRouteByInstitution.data
        } else if (onlyUser) {
            data = useQueryRouteByUserID.data
        } else {
            data = useQueryRouteAll.data
        }
        setRoutes((data ?? []).sort(compareSort))
    }, [onlyUser, onlyInstitution, useQueryRouteAll.data, useQueryRouteByUserID.data, useQueryRouteByInstitution.data])


    useEffect(() => {

        const map = routes.reduce<Map<string, Route[]>>((acc : Map<string, Route[]>, route) => {
            if(!route.dateFinished || route.status != RouteStatus.Completed) return acc 
            const format = getFormatDate(new Date(route.dateFinished), opFecha)
            if(!acc.has(format)) {
                acc.set(format, [])
            }
            acc.set(format, [...(acc.get(format)!), route])
            return acc
        }, new Map<string, Route[]>())
        setMapRoutes(map)

    }, [opFecha, routes])

    const theme = useTheme()
    const computerDevice = useMediaQuery(theme.breakpoints.up('sm'))
    
    return (
        <div className={"flex h-[100dvh] max-w-full overflow-hidden " + (computerDevice ? '' : 'relative flex-col')}>
            { computerDevice ?
                <div className="sticky top-0 z-20 self-start flex-shrink-0">
                    <Sidebar />
                </div>
                :
                <div className="fixed left-3 top-3 z-[1200]">
                    <CustomDrawer DrawerList={DrawerList} />
                </div>
            }

            <div className={`flex min-h-0 grow justify-between ${(computerDevice ? 'flex-row-reverse' : 'flex-col')}`}>
                <div className={"relative flex min-h-0 " + (computerDevice ? 'grow' : 'h-[58dvh] min-h-[360px] flex-none')}>
                    <Mapa
                        stateCurrentLocation={[currentLocation, setCurrentLocation]}
                        helpPoints={helpPoints}
                        risks={[]}
                        enableTraceLine
                    >
                        <HandlerLocationHistory stateShowLocation={[showLocation, setShowLocation]} stateLocation={[HPLocation, setHPLocation]} />
                    </Mapa>
                </div>
                <Paper variant="outlined" square className={"z-10 min-h-0 overflow-y-auto " + (computerDevice ? 'w-100 shadow-[4px_0_6px_-1px_rgba(0,0,0,0.1)]' : 'w-full flex-1')}>
                    <ListHistory 
                        stateOnlyUser={[onlyUser, setOnlyUser]}
                        stateOnlyInstitution={[onlyInstitution, setOnlyInstitution]}
                        stateOPFecha={[opFecha, setOPFecha]}
                        stateLocation={[HPLocation, setHPLocation]} 
                        stateShowLocation={[showLocation, setShowLocation]} 
                        stateRoutes={[mapRoutes, setMapRoutes]} 
                        stateHelpPoints={[helpPoints, setHelpPoints]}
                    />
                </Paper>
            </div>
            <DialogUpdateAtended /> {/** Context Provider */}
        </div>
    )
};


import { Checkbox, Divider, FormControl, FormControlLabel, List, ListItem, ListItemText, ListSubheader, ToggleButton, ToggleButtonGroup, Typography, useMediaQuery, useTheme } from "@mui/material";
import ListDateItem from "./ListDateItem";
import ComboBox from "../../component/Button/ComboBox";
import { Route } from "../../api/models/Route";
import { HelpPoint } from "../../api/models/HelpPoint";

type ListHistoryProps = {
    stateOnlyUser : [ boolean, React.Dispatch<React.SetStateAction<boolean>>]
    stateRoutes : [ Map<string, Route[]>, React.Dispatch<React.SetStateAction<Map<string, Route[]>>> ]
    stateHelpPoints : [ HelpPoint[], React.Dispatch<React.SetStateAction<HelpPoint[]>> ] 
    stateShowLocation : [ boolean, React.Dispatch<React.SetStateAction<boolean>> ]
    stateLocation : [ number[], React.Dispatch<React.SetStateAction<number[]>> ] 
    stateOPFecha : [ string, React.Dispatch<React.SetStateAction<string>> ]
    stateShowHeatmap : [boolean, React.Dispatch<React.SetStateAction<boolean>> ]
    stateHeatmapTimeRange : [ string, React.Dispatch<React.SetStateAction<string>> ]
}

export default function ListHistory({ stateRoutes, stateHelpPoints, stateShowLocation, stateLocation, stateOPFecha, stateOnlyUser, stateShowHeatmap, stateHeatmapTimeRange } : ListHistoryProps) {

    const [ routes,  ] = stateRoutes
    const [ opFecha, setOPFecha ] = stateOPFecha
    const [ onlyUser, setOnlyUser ] = stateOnlyUser
    const [ heatMap, setHeatMap ] = stateShowHeatmap;
    const [ heatmapRange, setHeatmapRange ] = stateHeatmapTimeRange;

    return (
        <List 
            sx={{ width : '100%', maxHeight: "100%", bgcolor : 'background.paper', overflowY : 'auto'}}
            component={"div"}
            aria-labelledby="route-list"
            subheader={
                <ListSubheader component={"div"} id="route-list-title" sx={{ padding : 0}}>
                    <div className={"flex flex-col gap-2 py-3 my-0 md:my-3 "}>
                        <Typography color="black" sx={{ paddingX : 3 }} variant="h6">
                            Historial de rutas  
                        </Typography>
                        <Divider />
                        <FormControl>
                            <div className="px-3 flex flex-col gap-2">
                                <ComboBox 
                                    size="small"
                                    className="pt-3"
                                    disableClearable 
                                    includeInputInList 
                                    fullWidth 
                                    label={"Agrupar por"} 
                                    options={['Día', 'Semana', 'Mes']} 
                                    value={opFecha} 
                                    onChange={(_, value) => {setOPFecha(value as string)}}
                                />
                                <FormControlLabel                                
                                    value={onlyUser}
                                    control={<Checkbox onChange={(e : React.ChangeEvent<HTMLInputElement>) => {setOnlyUser(e.target.checked)}} size="small" />}
                                    label='Ver solo mis rutas'
                                    labelPlacement="end" 
                                />
                                <FormControlLabel
                                    value={heatMap}
                                    control={<Checkbox onChange={(e : React.ChangeEvent<HTMLInputElement>) => {
                                        setHeatMap(e.target.checked)
                                        if (!e.target.checked) setHeatmapRange('none')
                                    }} size="small" />}
                                    label='Activar mapa de calor'
                                    labelPlacement="end"
                                />
                                {heatMap && (
                                    <ToggleButtonGroup
                                        value={heatmapRange}
                                        exclusive
                                        onChange={(_, value) => {
                                            if (value !== null) setHeatmapRange(value)
                                        }}
                                        size="small"
                                        fullWidth
                                    >
                                        <ToggleButton value="1m" sx={{ textTransform: 'none', fontSize: 12 }}>Último mes</ToggleButton>
                                        <ToggleButton value="6m" sx={{ textTransform: 'none', fontSize: 12 }}>6 meses</ToggleButton>
                                        <ToggleButton value="1y" sx={{ textTransform: 'none', fontSize: 12 }}>Último año</ToggleButton>
                                    </ToggleButtonGroup>
                                )}
                            </div>
                        </FormControl>
                        <Divider variant='fullWidth' />
                    </div>
                </ListSubheader>
            }
        >
            {   Array.from(routes.entries()).length === 0 ? 
                <ListItem>
                    <ListItemText className="text-center" secondary={'Puedes empezar a crear rutas desde la página principal'} >
                       { onlyUser ? 'No hay rutas registradas' : ' No se registraron rutas'}
                    </ListItemText>
                </ListItem>
                :
                Array.from(routes.entries()).map(([date, routes ], index) => (
                    <ListDateItem
                        onlyUser={onlyUser}
                        stateLocation={stateLocation} 
                        stateShowLocation={stateShowLocation} 
                        stateHelpPoints={stateHelpPoints} 
                        routes={routes} 
                        date={date} 
                        key={date} 
                        defaultOpen={index == 0} 
                        sx={{
                            '&.Mui-selected': {
                            backgroundColor: 'primary.main',
                            color: 'white',
                            },
                            '&.Mui-selected:hover': {
                            backgroundColor: 'primary.dark',
                            },
                        }}
                    />
            ))}
        </List>
    )
};

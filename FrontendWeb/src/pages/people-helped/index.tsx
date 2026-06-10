import { Paper, useMediaQuery, useTheme, TextField, InputAdornment, List, ListItem, ListItemText, Typography, Divider } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import Sidebar from "../../component/Sidebar";
import CustomDrawer from "../../component/CustomDrawer";
import DrawerList from "../../component/DrawerList";
import { useHelpPoints } from "../../api/hooks/HelpPointHooks";
import { HelpedPerson } from "../../api/models/HelpPoint";
import { useState, useMemo } from "react";

type PersonWithMeta = {
    person: HelpedPerson
    date: Date
    helpPointId: string
}

export default function PeopleHelped() {
    const theme = useTheme()
    const computerDevice = useMediaQuery(theme.breakpoints.up('sm'))
    const [search, setSearch] = useState('')

    const { data: helpPoints } = useHelpPoints()

    const people = useMemo(() => {
        if (!helpPoints) return []
        const result: PersonWithMeta[] = []
        for (const hp of helpPoints) {
            for (const person of hp.people) {
                result.push({
                    person,
                    date: hp.dateRegister,
                    helpPointId: hp.id,
                })
            }
        }
        result.sort((a, b) => b.date.getTime() - a.date.getTime())
        return result
    }, [helpPoints])

    const filtered = useMemo(() => {
        if (!search.trim()) return people
        const q = search.toLowerCase()
        return people.filter(p => {
            const name = p.person.name.toLowerCase()
            const rut = (p.person.rut || '').toLowerCase()
            const age = String(p.person.age)
            return name.includes(q) || rut.includes(q) || age.includes(q)
        })
    }, [people, search])

    return (
        <div className="flex flex-grow h-screen">
            <div className="flex">
                {computerDevice ?
                    <Sidebar />
                    :
                    <div className="absolute top-4 z-20 left-2">
                        <CustomDrawer DrawerList={DrawerList} />
                    </div>
                }
            </div>
            <div className="flex grow justify-center">
                <Paper variant="outlined" square className="h-full w-full max-w-3xl shadow-[4px_0_6px_-1px_rgba(0,0,0,0.1)] overflow-y-auto">
                    <div className="p-4">
                        <Typography variant="h5" className="mb-4">Personas Ayudadas</Typography>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Buscar por nombre, RUT o edad"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    )
                                }
                            }}
                        />
                        <Divider className="my-4" />
                        {filtered.length === 0 ? (
                            <Typography color="text.secondary" className="text-center py-8">
                                {helpPoints ? 'No se encontraron personas' : 'Cargando...'}
                            </Typography>
                        ) : (
                            <List>
                                {filtered.map((item, index) => (
                                    <ListItem key={`${item.helpPointId}-${index}`} divider>
                                        <ListItemText
                                            primary={item.person.name}
                                            secondary={
                                                <>
                                                    <span>RUT: {item.person.rut || 'Sin RUT'} | Edad: {item.person.age} | G&eacute;nero: {item.person.gender}</span>
                                                    <br />
                                                    <span>Registrado: {item.date.toLocaleDateString('es-CL')}</span>
                                                </>
                                            }
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </div>
                </Paper>
            </div>
        </div>
    )
}

import { Paper, useMediaQuery, useTheme, TextField, InputAdornment, List, ListItemButton, ListItemText, Typography, Divider, Avatar, CircularProgress, Collapse, Button } from "@mui/material"
import SearchIcon from '@mui/icons-material/Search'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import Sidebar from "../../component/Sidebar"
import CustomDrawer from "../../component/CustomDrawer"
import DrawerList from "../../component/DrawerList"
import { usePersonas } from "../../api/hooks/PersonaHooks"
import { useHelpPoints } from "../../api/hooks/HelpPointHooks"
import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"

type PersonaEntry = {
    id: string
    nombre: string
    rut?: string
    edad: number
    genero: string
    antecedentesCount: number
    infoMedicaCount: number
}

type LegacyEntry = {
    id: string
    nombre: string
    rut?: string
    edad: number
    genero: string
    date: Date
    helpPointId: string
}

export default function PeopleHelped() {
    const theme = useTheme()
    const computerDevice = useMediaQuery(theme.breakpoints.up('sm'))
    const [search, setSearch] = useState('')
    const [showLegacy, setShowLegacy] = useState(false)
    const navigate = useNavigate()

    const { data: personas, isLoading: personasLoading } = usePersonas()
    const { data: helpPoints, isLoading: hpLoading } = useHelpPoints()

    const personasEntries = useMemo(() => {
        if (!personas) return []
        return personas
            .filter(p => {
                if (!search.trim()) return true
                const q = search.toLowerCase()
                return p.nombre.toLowerCase().includes(q) || (p.rut || '').toLowerCase().includes(q) || String(p.edad).includes(q)
            })
            .map(p => ({
                id: p.id,
                nombre: p.nombre,
                rut: p.rut,
                edad: p.edad,
                genero: p.genero,
                antecedentesCount: p.antecedentes.length,
                infoMedicaCount: p.infoMedica.length,
            } as PersonaEntry))
    }, [personas, search])

    const legacyEntries = useMemo(() => {
        if (!helpPoints || !personas) return []
        const personaNames = new Set(personas.map(p => p.nombre.toLowerCase()))
        const legacy: LegacyEntry[] = []

        for (const hp of helpPoints) {
            for (const person of hp.people) {
                if (personaNames.has(person.name.toLowerCase())) continue
                if (!search.trim() ||
                    person.name.toLowerCase().includes(search.toLowerCase()) ||
                    (person.rut || '').toLowerCase().includes(search.toLowerCase()) ||
                    String(person.age).includes(search)
                ) {
                    legacy.push({
                        id: `${hp.id}-${person.name}`,
                        nombre: person.name,
                        rut: person.rut,
                        edad: person.age,
                        genero: person.gender,
                        date: hp.dateRegister,
                        helpPointId: hp.id,
                    })
                }
            }
        }

        legacy.sort((a, b) => b.date.getTime() - a.date.getTime())
        return legacy
    }, [helpPoints, personas, search])

    const isLoading = personasLoading || hpLoading

    return (
        <div className="flex flex-grow h-screen">
            <div className="flex">
                {computerDevice ? <Sidebar /> : <div className="absolute top-4 z-20 left-2"><CustomDrawer DrawerList={DrawerList} /></div>}
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
                        {isLoading ? (
                            <div className="flex justify-center py-8"><CircularProgress size={40} /></div>
                        ) : (
                            <>
                                {personasEntries.length > 0 && (
                                    <>
                                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                                            Perfiles ({personasEntries.length})
                                        </Typography>
                                        <List>
                                            {personasEntries.map((entry) => (
                                                <ListItemButton
                                                    key={entry.id}
                                                    divider
                                                    onClick={() => navigate(`/personas-ayudadas/${entry.id}`)}
                                                    sx={{ borderRadius: '8px' }}
                                                >
                                                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main', width: 40, height: 40 }}>
                                                        {entry.nombre.charAt(0).toUpperCase()}
                                                    </Avatar>
                                                    <ListItemText
                                                        primary={entry.nombre}
                                                        secondary={
                                                            <>
                                                                <span>RUT: {entry.rut || 'Sin RUT'} | Edad: {entry.edad > 0 ? entry.edad : 'Sin especificar'} | Género: {entry.genero || 'Sin especificar'}</span>
                                                                <br />
                                                                <span>Antecedentes: {entry.antecedentesCount} | Info. médica: {entry.infoMedicaCount}</span>
                                                            </>
                                                        }
                                                    />
                                                </ListItemButton>
                                            ))}
                                        </List>
                                    </>
                                )}

                                {legacyEntries.length > 0 && (
                                    <>
                                        <Button
                                            fullWidth
                                            variant="text"
                                            onClick={() => setShowLegacy(!showLegacy)}
                                            sx={{ borderRadius: '8px', textTransform: 'none', py: 1, justifyContent: 'flex-start', color: 'text.secondary' }}
                                            startIcon={showLegacy ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                        >
                                            Registros anteriores sin perfil ({legacyEntries.length})
                                        </Button>
                                        <Collapse in={showLegacy}>
                                            <List>
                                                {legacyEntries.map((entry) => (
                                                    <ListItemButton key={entry.id} divider sx={{ borderRadius: '8px' }}>
                                                        <Avatar sx={{ mr: 2, bgcolor: 'grey.400', width: 40, height: 40 }}>
                                                            {entry.nombre.charAt(0).toUpperCase()}
                                                        </Avatar>
                                                        <ListItemText
                                                            primary={entry.nombre}
                                                            secondary={
                                                                <>
                                                                    <span>RUT: {entry.rut || 'Sin RUT'} | Edad: {entry.edad > 0 ? entry.edad : 'Sin especificar'} | Género: {entry.genero || 'Sin especificar'}</span>
                                                                    <br />
                                                                    <span>Registrado: {entry.date.toLocaleDateString('es-CL')}</span>
                                                                </>
                                                            }
                                                        />
                                                    </ListItemButton>
                                                ))}
                                            </List>
                                        </Collapse>
                                    </>
                                )}

                                {personasEntries.length === 0 && legacyEntries.length === 0 && (
                                    <Typography color="text.secondary" className="text-center py-8">
                                        No se encontraron personas
                                    </Typography>
                                )}
                            </>
                        )}
                    </div>
                </Paper>
            </div>
        </div>
    )
}

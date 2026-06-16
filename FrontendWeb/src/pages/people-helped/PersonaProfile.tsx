import { useParams, useNavigate } from "react-router-dom"
import { Paper, Typography, Button, IconButton, Divider, Chip, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material"
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EditIcon from '@mui/icons-material/Edit'
import LinkIcon from '@mui/icons-material/Link'
import Sidebar from "../../component/Sidebar"
import CustomDrawer from "../../component/CustomDrawer"
import DrawerList from "../../component/DrawerList"
import AntecedentesBox from "../../component/PeopleHelped/AntecedentesBox"
import LinkHelpPointDialog from "../../component/PeopleHelped/LinkHelpPointDialog"
import { usePersona, useUpdatePersona, useAddAntecedente, useDeleteAntecedente, useAddInfoMedica, useDeleteInfoMedica } from "../../api/hooks/PersonaHooks"
import { useHelpPoints } from "../../api/hooks/HelpPointHooks"
import { useMediaQuery, useTheme } from "@mui/material"
import { useState, useMemo } from "react"
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function PersonaProfile() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const theme = useTheme()
    const computerDevice = useMediaQuery(theme.breakpoints.up('sm'))

    const { data: persona, isLoading } = usePersona(id!)
    const { data: helpPoints } = useHelpPoints()
    const updateMutation = useUpdatePersona()
    const addAntMutation = useAddAntecedente()
    const delAntMutation = useDeleteAntecedente()
    const addMedMutation = useAddInfoMedica()
    const delMedMutation = useDeleteInfoMedica()

    const [editOpen, setEditOpen] = useState(false)
    const [editNombre, setEditNombre] = useState('')
    const [editRut, setEditRut] = useState('')
    const [editEdad, setEditEdad] = useState('')
    const [editGenero, setEditGenero] = useState('')
    const [linkOpen, setLinkOpen] = useState(false)

    const linkedHelpPoints = useMemo(() => {
        if (!helpPoints || !persona) return []
        return helpPoints.filter(hp =>
            hp.people.some(p => p.rut && persona.rut && p.rut === persona.rut) ||
            hp.personaID === persona.id
        )
    }, [helpPoints, persona])

    const handleEdit = () => {
        if (!persona) return
        setEditNombre(persona.nombre)
        setEditRut(persona.rut || '')
        setEditEdad(String(persona.edad))
        setEditGenero(persona.genero)
        setEditOpen(true)
    }

    const handleSaveEdit = () => {
        if (!persona) return
        updateMutation.mutate({
            id: persona.id,
            data: {
                nombre: editNombre,
                rut: editRut || undefined,
                edad: Number(editEdad),
                genero: editGenero,
            },
        })
        setEditOpen(false)
    }

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <CircularProgress size={60} />
            </div>
        )
    }

    if (!persona) {
        return (
            <div className="flex h-screen items-center justify-center flex-col gap-4">
                <Typography variant="h6">Persona no encontrada</Typography>
                <Button variant="contained" onClick={() => navigate('/personas-ayudadas')} sx={{ borderRadius: '8px', textTransform: 'none' }}>
                    Volver
                </Button>
            </div>
        )
    }

    return (
        <div className="flex flex-grow h-screen">
            <div className="flex">
                {computerDevice ? <Sidebar /> : <div className="absolute top-4 z-20 left-2"><CustomDrawer DrawerList={DrawerList} /></div>}
            </div>
            <div className="flex grow justify-center overflow-y-auto">
                <div className="w-full max-w-3xl p-4 md:p-6 flex flex-col gap-4">
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate('/personas-ayudadas')}
                        sx={{ alignSelf: 'flex-start', borderRadius: '8px', textTransform: 'none' }}
                    >
                        Volver a Personas Ayudadas
                    </Button>

                    <Paper variant="outlined" sx={{ p: 3, borderRadius: '12px' }}>
                        <div className="flex items-start justify-between">
                            <div>
                                <Typography variant="h5" sx={{ fontWeight: 700 }}>{persona.nombre}</Typography>
                                <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2">
                                    <Typography variant="body2" color="text.secondary">
                                        <strong>RUT:</strong> {persona.rut || 'Sin especificar'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        <strong>Edad:</strong> {persona.edad > 0 ? persona.edad : 'Sin especificar'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        <strong>Género:</strong> {persona.genero || 'Sin especificar'}
                                    </Typography>
                                </div>
                                <Typography variant="caption" color="text.disabled" sx={{ mt: 1, display: 'block' }}>
                                    Registrado: {format(persona.fechaCreacion, "dd/MM/yyyy HH:mm", { locale: es })}
                                </Typography>
                            </div>
                            <div className="flex gap-2">
                                <Button startIcon={<EditIcon />} variant="outlined" size="small" onClick={handleEdit} sx={{ borderRadius: '8px', textTransform: 'none' }}>
                                    Editar
                                </Button>
                                <Button startIcon={<LinkIcon />} variant="outlined" size="small" onClick={() => setLinkOpen(true)} sx={{ borderRadius: '8px', textTransform: 'none' }}>
                                    Vincular
                                </Button>
                            </div>
                        </div>
                    </Paper>

                    <AntecedentesBox
                        title="Antecedentes Generales"
                        entries={persona.antecedentes}
                        onAdd={(desc) => addAntMutation.mutate({ personaID: persona.id, descripcion: desc })}
                        onDelete={(entryId) => delAntMutation.mutate({ personaID: persona.id, entryID: entryId })}
                    />

                    <AntecedentesBox
                        title="Información Médica / Importante"
                        entries={persona.infoMedica}
                        onAdd={(desc) => addMedMutation.mutate({ personaID: persona.id, descripcion: desc })}
                        onDelete={(entryId) => delMedMutation.mutate({ personaID: persona.id, entryID: entryId })}
                    />

                    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: '12px', bgcolor: '#fafafa' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Puntos de Ayuda Asociados</Typography>
                        {linkedHelpPoints.length === 0 ? (
                            <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center', fontSize: 14 }}>
                                No hay puntos de ayuda vinculados a esta persona
                            </Typography>
                        ) : (
                            <div className="flex flex-col gap-2">
                                {linkedHelpPoints.map(hp => (
                                    <Paper key={hp.id} variant="outlined" sx={{ p: 2, borderRadius: '8px', bgcolor: 'white' }}>
                                        <Typography variant="caption" color="text.secondary">
                                            {format(hp.dateRegister, "dd/MM/yyyy HH:mm", { locale: es })}
                                        </Typography>
                                        <Typography variant="body2" sx={{ mt: 0.5 }}>{hp.comment || 'Sin comentario'}</Typography>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {hp.people.map((p, i) => (
                                                <Chip key={i} label={p.name} size="small" variant="outlined" />
                                            ))}
                                        </div>
                                    </Paper>
                                ))}
                            </div>
                        )}
                    </Paper>
                </div>
            </div>

            <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle sx={{ fontWeight: 600 }}>Editar persona</DialogTitle>
                <DialogContent>
                    <div className="flex flex-col gap-3 pt-2">
                        <TextField label="Nombre" fullWidth size="small" value={editNombre} onChange={(e) => setEditNombre(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
                        <TextField label="RUT" fullWidth size="small" value={editRut} onChange={(e) => setEditRut(e.target.value)} placeholder="12.345.678-9" slotProps={{ inputLabel: { shrink: true } }} />
                        <TextField label="Edad" fullWidth size="small" type="number" value={editEdad} onChange={(e) => setEditEdad(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
                        <TextField label="Género" fullWidth size="small" value={editGenero} onChange={(e) => setEditGenero(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button variant="outlined" onClick={() => setEditOpen(false)} sx={{ borderRadius: '8px', textTransform: 'none' }}>Cancelar</Button>
                    <Button variant="contained" onClick={handleSaveEdit} disabled={updateMutation.isPending} sx={{ borderRadius: '8px', textTransform: 'none' }}>
                        Guardar
                    </Button>
                </DialogActions>
            </Dialog>

            <LinkHelpPointDialog
                open={linkOpen}
                personaID={persona.id}
                onClose={() => setLinkOpen(false)}
                onLinked={() => { }}
            />
        </div>
    )
}

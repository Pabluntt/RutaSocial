import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, List, ListItemButton, ListItemText, Paper, Chip, CircularProgress } from "@mui/material"
import { useRef, useEffect, useState } from "react"
import { useRoutes } from "../../api/hooks/RouteHooks"
import { useHelpPoints, useLinkPersonaToHelpPoint } from "../../api/hooks/HelpPointHooks"
import { HelpPoint } from "../../api/models/HelpPoint"
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

type LinkHelpPointDialogProps = {
    open: boolean
    personaID: string
    onClose: () => void
    onLinked: () => void
}

function MiniMap({ coords }: { coords: number[] }) {
    const mapRef = useRef<HTMLDivElement>(null)
    const mapInstanceRef = useRef<any>(null)

    useEffect(() => {
        const el = mapRef.current
        if (!el || coords.length !== 2) return

        import('leaflet').then(L => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove()
            }

            const map = L.map(el, {
                center: [coords[1], coords[0]],
                zoom: 15,
                zoomControl: false,
                dragging: false,
                scrollWheelZoom: false,
            })

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap',
            }).addTo(map)

            L.marker([coords[1], coords[0]]).addTo(map)

            setTimeout(() => map.invalidateSize(), 50)
            mapInstanceRef.current = map
        })

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove()
                mapInstanceRef.current = null
            }
        }
    }, [coords[0], coords[1]])

    return <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
}

export default function LinkHelpPointDialog({ open, personaID, onClose, onLinked }: LinkHelpPointDialogProps) {
    const { data: routes } = useRoutes()
    const { data: helpPoints } = useHelpPoints()
    const linkMutation = useLinkPersonaToHelpPoint()

    const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null)
    const [selectedHP, setSelectedHP] = useState<HelpPoint | null>(null)

    const filteredHelpPoints = helpPoints?.filter(hp => hp.routeID === selectedRouteId) || []

    const handleLink = async () => {
        if (!selectedHP) return
        await linkMutation.mutateAsync({
            helpPointID: selectedHP.id,
            personaID,
        })
        onLinked()
        handleClose()
    }

    const handleClose = () => {
        setSelectedRouteId(null)
        setSelectedHP(null)
        onClose()
    }

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
            <DialogTitle sx={{ fontWeight: 600 }}>Vincular a punto de ayuda</DialogTitle>
            <DialogContent>
                <div className="flex flex-col gap-4 py-2">
                    {!selectedRouteId ? (
                        <div>
                            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>1. Selecciona una ruta</Typography>
                            <List>
                                {routes?.map(route => (
                                    <ListItemButton
                                        key={route.id}
                                        selected={selectedRouteId === route.id}
                                        onClick={() => setSelectedRouteId(route.id)}
                                        sx={{ borderRadius: '8px', mb: 0.5 }}
                                    >
                                        <ListItemText
                                            primary={route.title}
                                            secondary={`${route.description || ''} ${route.dateCreated ? format(route.dateCreated, 'dd/MM/yyyy', { locale: es }) : ''}`}
                                        />
                                    </ListItemButton>
                                ))}
                            </List>
                        </div>
                    ) : !selectedHP ? (
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <Button variant="text" size="small" onClick={() => setSelectedRouteId(null)} sx={{ textTransform: 'none' }}>
                                    ← Volver a rutas
                                </Button>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>2. Selecciona un punto de ayuda</Typography>
                            </div>
                            <List>
                                {filteredHelpPoints.length === 0 ? (
                                    <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                                        No hay puntos de ayuda en esta ruta
                                    </Typography>
                                ) : (
                                    filteredHelpPoints.map(hp => (
                                        <ListItemButton
                                            key={hp.id}
                                            onClick={() => setSelectedHP(hp)}
                                            sx={{ borderRadius: '8px', mb: 0.5 }}
                                        >
                                            <ListItemText
                                                primary={hp.comment || 'Sin comentario'}
                                                secondary={`${format(hp.dateRegister, "dd/MM/yyyy HH:mm", { locale: es })} | ${hp.people.length} persona(s)`}
                                            />
                                        </ListItemButton>
                                    ))
                                )}
                            </List>
                        </div>
                    ) : (
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <Button variant="text" size="small" onClick={() => setSelectedHP(null)} sx={{ textTransform: 'none' }}>
                                    ← Volver
                                </Button>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>3. Vista previa del punto</Typography>
                            </div>
                            <div className="flex flex-col gap-3">
                                <Paper variant="outlined" sx={{ borderRadius: '10px', overflow: 'hidden', height: 200 }}>
                                    {selectedHP.coords.length === 2 && (
                                        <MiniMap coords={selectedHP.coords} />
                                    )}
                                </Paper>
                                <Paper variant="outlined" sx={{ p: 2, borderRadius: '10px' }}>
                                    <Typography variant="caption" color="text.secondary">
                                        {format(selectedHP.dateRegister, "dd/MM/yyyy HH:mm", { locale: es })}
                                    </Typography>
                                    <Typography variant="body2" sx={{ mt: 0.5 }}>{selectedHP.comment || 'Sin comentario'}</Typography>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {selectedHP.people.map((p, i) => (
                                            <Chip key={i} label={p.name} size="small" variant="outlined" />
                                        ))}
                                    </div>
                                </Paper>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
            <DialogActions>
                <Button variant="outlined" onClick={handleClose} sx={{ borderRadius: '8px', textTransform: 'none' }}>
                    Cancelar
                </Button>
                {selectedHP && (
                    <Button
                        variant="contained"
                        onClick={handleLink}
                        disabled={linkMutation.isPending}
                        sx={{ borderRadius: '8px', textTransform: 'none' }}
                    >
                        {linkMutation.isPending ? <CircularProgress size={20} /> : 'Vincular esta persona'}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    )
}

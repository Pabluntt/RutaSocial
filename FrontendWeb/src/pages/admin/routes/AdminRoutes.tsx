import { Button, Chip, IconButton, InputBase, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography, useMediaQuery, useTheme, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, ToggleButtonGroup, ToggleButton } from "@mui/material"
import SearchIcon from '@mui/icons-material/Search'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import Sidebar from "../../../component/Sidebar"
import CustomDrawer from "../../../component/CustomDrawer"
import DrawerList from "../../../component/DrawerList"
import { useEffect, useState } from "react"
import { useRoutes, useUpdateRoute, useDeleteRoute, useFinishRoute } from "../../../api/hooks/RouteHooks"
import { Route } from "../../../api/models/Route"
import { RouteStatus } from "../../../Enums/RouteStatus"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { RouteService } from "../../../api/services/RouteService"
import { useAuth } from "../../../context/AuthContext"
import { Role } from "../../../Enums/Role"
import ConfirmDialog from "../../../component/Dialog/ConfirmDialog"

type FilterStatus = 'all' | 'No iniciada' | 'on progress' | 'Finalizada' | 'Eliminada'

const statusChipConfig: Record<string, { label: string; color: 'default' | 'info' | 'success' | 'error' | 'warning' }> = {
    [RouteStatus.Scheduled]: { label: 'No iniciada', color: 'warning' },
    [RouteStatus.Active]: { label: 'En Progreso', color: 'info' },
    [RouteStatus.Completed]: { label: 'Finalizada', color: 'success' },
    [RouteStatus.Deleted]: { label: 'Eliminada', color: 'error' },
}

export default function AdminRoutes() {
    const theme = useTheme()
    const computerDevice = useMediaQuery(theme.breakpoints.up('sm'))
    const { role } = useAuth()
    const isAdmin = role === Role.admin
    const { data: routes, isPending, isError, refetch } = useRoutes()
    const { mutate: updateRouteMutate, isPending: isUpdating } = useUpdateRoute()
    const { mutate: deleteRouteMutate } = useDeleteRoute()
    const { mutate: finishRouteMutate } = useFinishRoute()

    const [filteredRoutes, setFilteredRoutes] = useState<Route[]>([])
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<FilterStatus>('all')

    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [editingRoute, setEditingRoute] = useState<Route | null>(null)
    const [editTitle, setEditTitle] = useState('')
    const [editDescription, setEditDescription] = useState('')

    const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
    const [confirmAction, setConfirmAction] = useState<null | {
        title: string
        message: string
        confirmText: string
        confirmColor: 'error' | 'success'
        onConfirm: () => void
    }>(null)

    useEffect(() => {
        if (!routes) return
        let filtered = routes
        if (statusFilter !== 'all') {
            filtered = filtered.filter((r) => r.status === statusFilter)
        }
        if (search.trim()) {
            filtered = filtered.filter((r) =>
                r.title.toLowerCase().includes(search.toLowerCase())
            )
        }
        setFilteredRoutes(filtered)
    }, [routes, statusFilter, search])

    const showAlertMsg = (type: 'success' | 'error', message: string) => {
        setAlert({ type, message })
        setTimeout(() => { setAlert(null); }, 3000)
    }

    const handleEditClick = (route: Route) => {
        setEditingRoute(route)
        setEditTitle(route.title)
        setEditDescription(route.description)
        setEditDialogOpen(true)
    }

    const handleSaveEdit = () => {
        if (!editingRoute) return
        updateRouteMutate(
            { ...editingRoute, title: editTitle, description: editDescription },
            {
                onSuccess: () => {
                    setEditDialogOpen(false)
                    setEditingRoute(null)
                    showAlertMsg('success', 'Ruta actualizada exitosamente')
                    refetch()
                },
                onError: (err: any) => {
                    showAlertMsg('error', err?.status === 403 ? 'No tienes permisos para editar rutas' : 'Error al actualizar la ruta')
                },
            }
        )
    }

    const handleDeleteClick = (route: Route) => {
        setConfirmAction({
            title: 'Eliminar ruta',
            message: `¿Estás seguro de eliminar la ruta "${route.title}"?`,
            confirmText: 'Eliminar',
            confirmColor: 'error',
            onConfirm: () => {
                setConfirmAction(null)
                deleteRouteMutate(route.id, {
                    onSuccess: () => {
                        showAlertMsg('success', 'Ruta eliminada exitosamente')
                        refetch()
                    },
                    onError: (err: any) => {
                        showAlertMsg('error', err?.status === 403 ? 'No tienes permisos para eliminar rutas' : 'Error al eliminar la ruta')
                    },
                })
            },
        })
    }

    const handleFinishClick = (route: Route) => {
        setConfirmAction({
            title: 'Finalizar ruta',
            message: `¿Finalizar la ruta "${route.title}"? Después de finalizarla, nadie podrá unirse ni reanudarla.`,
            confirmText: 'Finalizar',
            confirmColor: 'success',
            onConfirm: () => {
                setConfirmAction(null)
                finishRouteMutate(route.id, {
                    onSuccess: () => {
                        showAlertMsg('success', 'Ruta finalizada exitosamente')
                        refetch()
                    },
                    onError: (err: any) => {
                        showAlertMsg('error', err?.status === 403 ? 'No tienes permisos para finalizar esta ruta' : 'Error al finalizar la ruta')
                    },
                })
            },
        })
    }

    const handleDownloadReport = (route: Route) => {
        RouteService.DownloadRouteReport(route.id, route.title)
    }

    const statusFilters: { value: FilterStatus; label: string }[] = [
        { value: 'all', label: 'Todas' },
        { value: 'No iniciada', label: 'No iniciada' },
        { value: 'on progress', label: 'Activas' },
        { value: 'Finalizada', label: 'Finalizadas' },
        { value: 'Eliminada', label: 'Eliminadas' },
    ]

    return (
        <div className={"flex h-screen overflow-hidden " + (computerDevice ? 'flex-row' : 'flex-col')}>
            {computerDevice ?
                <div className="sticky top-0 self-start flex-shrink-0 z-10">
                    <Sidebar />
                </div>
                :
                <div className="flex flex-row bg-gray-100">
                    <CustomDrawer DrawerList={DrawerList} />
                    <p className="flex text-2xl text-center font-semibold p-3 items-center">Gestión Rutas</p>
                </div>
            }
            <div className="flex w-full h-full flex-col gap-4 p-3 sm:p-5 bg-gray-100 overflow-y-auto">
                <Typography variant={computerDevice ? "h5" : "h6"}>Gestión de Rutas</Typography>

                {alert && (
                    <Alert severity={alert.type} sx={{ mb: 2 }}>{alert.message}</Alert>
                )}

                <div className={"flex gap-4 " + (computerDevice ? 'flex-row items-center' : 'flex-col')}>
                    <Paper className={"flex items-center px-2 " + (computerDevice ? 'w-80' : 'w-full')}>
                        <InputBase
                            fullWidth
                            placeholder="Buscar por título"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); }}
                        />
                        <IconButton disabled><SearchIcon /></IconButton>
                    </Paper>
                    <div className={"flex " + (computerDevice ? '' : 'w-full overflow-x-auto pb-1')}>
                        <ToggleButtonGroup
                            value={statusFilter}
                            exclusive
                            onChange={(_, value) => value && setStatusFilter(value)}
                            size="small"
                            orientation="horizontal"
                        >
                            {statusFilters.map((f) => (
                                <ToggleButton key={f.value} value={f.value} sx={!computerDevice ? { minWidth: 88, px: 1 } : {}}>
                                    {f.label}
                                </ToggleButton>
                            ))}
                        </ToggleButtonGroup>
                    </div>
                </div>

                {isPending ? (
                    <div className="flex justify-center p-10"><CircularProgress /></div>
                ) : isError ? (
                    <Alert severity="error">Error al cargar rutas</Alert>
                ) : (
                    <Paper>
                        <TableContainer sx={{ overflowX: 'auto' }}>
                            <Table size="small" stickyHeader sx={{ minWidth: computerDevice ? 'auto' : 560, width: '100%', '& .MuiTableCell-root': !computerDevice ? { px: 0.75, py: 0.5 } : undefined }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 600 }}>Título</TableCell>
                                        {computerDevice && <TableCell sx={{ fontWeight: 600 }}>Líder</TableCell>}
                                        <TableCell sx={{ fontWeight: 600 }} align="center">Eq.</TableCell>
                                        <TableCell sx={{ fontWeight: 600 }} align="center">Estado</TableCell>
                                        {computerDevice && <TableCell sx={{ fontWeight: 600 }}>Creada</TableCell>}
                                        <TableCell sx={{ fontWeight: 600 }} align="center">Acciones</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredRoutes.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={computerDevice ? 6 : 4} align="center">
                                                <Typography color="text.secondary" sx={{ py: 4 }}>
                                                    No se encontraron rutas
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredRoutes.map((route) => {
                                            const chip = statusChipConfig[route.status] ?? { label: route.status, color: 'default' as const }
                                            return (
                                                <TableRow key={route.id} hover>
                                                    <TableCell>
                                                        <Typography variant="body2" fontWeight={500}>{route.title}</Typography>
                                                        {computerDevice && (
                                                            <Typography variant="caption" color="text.secondary" sx={{
                                                                maxWidth: 250,
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap',
                                                                display: 'block',
                                                            }}>
                                                                {route.description}
                                                            </Typography>
                                                        )}
                                                    </TableCell>
                                                    {computerDevice && (
                                                        <TableCell>
                                                            <Typography variant="body2">{route.routeLeader.slice(-6)}</Typography>
                                                        </TableCell>
                                                    )}
                                                    <TableCell align="center">
                                                        <Chip label={route.team.length} size="small" variant="outlined" />
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Chip label={chip.label} size="small" color={chip.color} />
                                                    </TableCell>
                                                    {computerDevice && (
                                                        <TableCell>
                                                            <Typography variant="body2">
                                                                {format(new Date(route.dateCreated), 'dd/MM/yyyy', { locale: es })}
                                                            </Typography>
                                                        </TableCell>
                                                    )}
                                                    <TableCell align="center">
                                                        <div className={"flex " + (computerDevice ? 'gap-1 justify-center' : 'flex-row gap-0.5 justify-center whitespace-nowrap')}>
                                                            {isAdmin && (
                                                                <Tooltip title="Editar">
                                                                    <IconButton size="small" color="primary" onClick={() => { handleEditClick(route); }}>
                                                                        <EditIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            )}
                                                            {isAdmin && route.status === RouteStatus.Active && (
                                                                <Tooltip title="Finalizar">
                                                                    <IconButton size="small" color="success" onClick={() => { handleFinishClick(route); }}>
                                                                        <CheckCircleIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            )}
                                                            <Tooltip title="Descargar informe">
                                                                <IconButton size="small" color="info" onClick={() => { handleDownloadReport(route); }}>
                                                                    <FileDownloadIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            {isAdmin && route.status !== RouteStatus.Deleted && (
                                                                <Tooltip title="Eliminar">
                                                                    <IconButton size="small" color="error" onClick={() => { handleDeleteClick(route); }}>
                                                                        <DeleteIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                )}
            </div>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onClose={() => { setEditDialogOpen(false); }} maxWidth="sm" fullWidth>
                <DialogTitle>Editar Ruta</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                    <TextField
                        label="Título"
                        value={editTitle}
                        onChange={(e) => { setEditTitle(e.target.value); }}
                        fullWidth
                        size="small"
                    />
                    <TextField
                        label="Descripción"
                        value={editDescription}
                        onChange={(e) => { setEditDescription(e.target.value); }}
                        fullWidth
                        size="small"
                        multiline
                        rows={3}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setEditDialogOpen(false); }}>Cancelar</Button>
                    <Button onClick={handleSaveEdit} variant="contained" loading={isUpdating}>Guardar</Button>
                </DialogActions>
            </Dialog>
            {confirmAction && (
                <ConfirmDialog
                    open={Boolean(confirmAction)}
                    title={confirmAction.title}
                    message={confirmAction.message}
                    confirmText={confirmAction.confirmText}
                    cancelText="Cancelar"
                    confirmColor={confirmAction.confirmColor}
                    severity="warning"
                    onConfirm={confirmAction.onConfirm}
                    onCancel={() => { setConfirmAction(null) }}
                />
            )}
        </div>
    )
}

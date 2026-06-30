import { useParams, useNavigate } from "react-router-dom"
import { Typography, useMediaQuery, useTheme, Paper, Divider, Button, TextField, Alert, CircularProgress, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Card, CardContent, CardHeader, Avatar, IconButton, Tooltip } from "@mui/material"
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import CancelIcon from '@mui/icons-material/Cancel'
import Sidebar from "../../../component/Sidebar"
import CustomDrawer from "../../../component/CustomDrawer"
import DrawerList from "../../../component/DrawerList"
import { useUser } from "../../../api/hooks/UserHooks"
import { useAdminUpdateUser } from "../../../api/hooks/UserHooks"
import { useAdminUserRoutes } from "../../../api/hooks/RouteHooks"
import { useUserCalendarEvents } from "../../../api/hooks/CalendarEventHooks"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { RouteStatus } from "../../../Enums/RouteStatus"
import { Role } from "../../../Enums/Role"
import { useAuth } from "../../../context/AuthContext"

export default function UserDetail() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const theme = useTheme()
    const computerDevice = useMediaQuery(theme.breakpoints.up('sm'))

    const { role } = useAuth()
    const isAdmin = role === Role.admin
    const { data: user, isLoading, isError } = useUser(id || '')
    const { data: routes, isLoading: routesLoading } = useAdminUserRoutes(id || '', !!id)
    const { data: calendarEvents, isLoading: eventsLoading } = useUserCalendarEvents(id || '', !!id)
    const adminUpdateUser = useAdminUpdateUser()

    const [editing, setEditing] = useState(false)
    const [formData, setFormData] = useState({ name: '', phone: '', email: '', role: '' })
    const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
    const uniqueRoutes = routes ? Array.from(new Map(routes.map((route) => [route.id, route])).values()) : []
    const uniqueCalendarEvents = calendarEvents ? Array.from(new Map(calendarEvents.map((event) => [event.id, event])).values()) : []

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                phone: user.phone || '',
                email: user.email || '',
                role: user.role || '',
            })
        }
    }, [user])

    const handleSave = () => {
        if (!id) return
        adminUpdateUser.mutate(
            { id, data: formData },
            {
                onSuccess: () => {
                    setEditing(false)
                    setAlert({ type: 'success', message: 'Usuario actualizado exitosamente' })
                    setTimeout(() => { setAlert(null); }, 3000)
                },
                onError: (err: any) => {
                    const msg = err?.status === 403 ? 'No tienes permisos para editar usuarios' : (err?.error || 'Error al actualizar usuario')
                    setAlert({ type: 'error', message: msg })
                    setTimeout(() => { setAlert(null); }, 3000)
                },
            }
        )
    }

    const handleCancel = () => {
        if (user) {
            setFormData({
                name: user.name || '',
                phone: user.phone || '',
                email: user.email || '',
                role: user.role || '',
            })
        }
        setEditing(false)
    }

    if (isLoading) {
        return (
            <div className="flex grow h-screen items-center justify-center">
                <CircularProgress size={60} />
            </div>
        )
    }

    if (isError || !user) {
        return (
            <div className="flex grow h-screen items-center justify-center">
                <Alert severity="error">Usuario no encontrado</Alert>
            </div>
        )
    }

    return (
        <div className={"flex h-screen overflow-hidden " + (computerDevice ? 'flex-row' : 'flex-col')}>
            {computerDevice ?
                <div className="sticky top-0 self-start flex-shrink-0 z-10">
                    <Sidebar />
                </div>
                :
                <div className="flex flex-row bg-gray-100">
                    <CustomDrawer DrawerList={DrawerList} />
                    <p className="flex text-2xl text-center font-semibold p-3 items-center">Detalle Usuario</p>
                </div>
            }
            <div className="flex w-full h-full flex-col gap-4 p-3 sm:p-5 bg-gray-100 overflow-y-auto">
                <div className="flex items-center gap-2">
                    <IconButton onClick={() => navigate(`${import.meta.env.VITE_BASE_URL}/admin/usuarios`)} size="small">
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant={computerDevice ? "h5" : "h6"}>Detalle del Usuario</Typography>
                </div>

                {alert && (
                    <Alert severity={alert.type} sx={{ mb: 2 }}>{alert.message}</Alert>
                )}

                {/* User Info Card */}
                <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 2 }}>
                    <div className={"flex mb-4 " + (computerDevice ? 'flex-row items-center justify-between' : 'flex-col gap-3')}>
                        <div className="flex items-center gap-3">
                            <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, fontSize: 24 }}>
                                {user.name.charAt(0).toUpperCase()}
                            </Avatar>
                            <div>
                                <Typography variant="h6">{user.name}</Typography>
                                <Chip label={user.role === Role.admin ? 'Administrador' : 'Voluntario'} size="small" color={user.role === Role.admin ? 'warning' : 'default'} />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {editing ? (
                                <>
                                    <Button variant="contained" color="success" startIcon={<SaveIcon />} onClick={handleSave} loading={adminUpdateUser.isPending} size={computerDevice ? "medium" : "small"}>
                                        Guardar
                                    </Button>
                                    <Button variant="outlined" color="error" startIcon={<CancelIcon />} onClick={handleCancel} size={computerDevice ? "medium" : "small"}>
                                        Cancelar
                                    </Button>
                                </>
                            ) : isAdmin ? (
                                <Button variant="outlined" startIcon={<EditIcon />} onClick={() => { setEditing(true); }} size={computerDevice ? "medium" : "small"} fullWidth={!computerDevice}>
                                    Editar
                                </Button>
                            ) : null}
                        </div>
                    </div>
                    <Divider sx={{ mb: 2 }} />
                    <div className="flex flex-col gap-3 max-w-md">
                        <TextField
                            label="Nombre"
                            value={formData.name}
                            onChange={(e) => { setFormData({ ...formData, name: e.target.value }); }}
                            disabled={!editing}
                            size="small"
                            fullWidth
                        />
                        <TextField
                            label="Email"
                            value={formData.email}
                            onChange={(e) => { setFormData({ ...formData, email: e.target.value }); }}
                            disabled={!editing}
                            size="small"
                            fullWidth
                        />
                        <TextField
                            label="Teléfono"
                            value={formData.phone}
                            onChange={(e) => { setFormData({ ...formData, phone: e.target.value }); }}
                            disabled={!editing}
                            size="small"
                            fullWidth
                        />
                        <TextField
                            label="Rol"
                            value={formData.role}
                            onChange={(e) => { setFormData({ ...formData, role: e.target.value }); }}
                            disabled={!editing}
                            select
                            size="small"
                            fullWidth
                            SelectProps={{ native: true }}
                        >
                            <option value={Role.volunteer}>Voluntario</option>
                            <option value={Role.admin}>Administrador</option>
                        </TextField>
                    </div>
                </Paper>

                {/* Routes History */}
                <Paper sx={{ p: 3, mb: 2 }}>
                    <Typography variant="h6" gutterBottom>Historial de Rutas</Typography>
                    <Divider sx={{ mb: 2 }} />
                    {routesLoading ? (
                        <div className="flex justify-center p-4"><CircularProgress size={30} /></div>
                    ) : uniqueRoutes.length === 0 ? (
                        <Typography color="text.secondary">Este usuario no tiene rutas asociadas.</Typography>
                    ) : (
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Título</TableCell>
                                        <TableCell>Rol</TableCell>
                                        <TableCell>Estado</TableCell>
                                        <TableCell>Fecha Creación</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {uniqueRoutes.map((route) => (
                                        <TableRow key={route.id} hover>
                                            <TableCell>{route.title}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={route.routeLeader === id ? 'Líder' : 'Miembro'}
                                                    size="small"
                                                    color={route.routeLeader === id ? 'primary' : 'default'}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={route.status === RouteStatus.Completed ? 'Finalizada' : 'En Progreso'}
                                                    size="small"
                                                    color={route.status === RouteStatus.Completed ? 'success' : 'info'}
                                                />
                                            </TableCell>
                                            <TableCell>{format(new Date(route.dateCreated), 'dd/MM/yyyy', { locale: es })}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Paper>

                {/* Calendar Events */}
                <Paper sx={{ p: 3, mb: 2 }}>
                    <Typography variant="h6" gutterBottom>Eventos Agendados</Typography>
                    <Divider sx={{ mb: 2 }} />
                    {eventsLoading ? (
                        <div className="flex justify-center p-4"><CircularProgress size={30} /></div>
                    ) : uniqueCalendarEvents.length === 0 ? (
                        <Typography color="text.secondary">Este usuario no tiene eventos agendados.</Typography>
                    ) : (
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Título</TableCell>
                                        <TableCell>Fecha</TableCell>
                                        <TableCell>Horario</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {uniqueCalendarEvents.map((event) => (
                                        <TableRow key={event.id} hover>
                                            <TableCell>{event.title}</TableCell>
                                            <TableCell>{format(new Date(event.dateStart), 'dd/MM/yyyy', { locale: es })}</TableCell>
                                            <TableCell>{event.timeStart} - {event.timeEnd}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Paper>
            </div>
        </div>
    )
}

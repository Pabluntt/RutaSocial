import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, List, ListItem, ListItemText, Popover, TextField, Tooltip, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import CancelIcon from '@mui/icons-material/Cancel'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import { HexColorPicker } from 'react-colorful'
import { useState } from 'react'
import { Institution } from '../../api/models/Institution'
import { IUser } from '../../api/models/User'
import { InstitutionService } from '../../api/services/InstitutionService'
import CloseDialogButton from '../Button/CloseDialogButton'
import ConfirmDialog from './ConfirmDialog'

const NIL_INSTITUTION_ID = '000000000000000000000000'

interface Props {
    open: boolean
    setOpen: (open: boolean) => void
    institutions: Institution[]
    setInstitutions: (institutions: Institution[]) => void
    users: IUser[]
    setUsers: (users: IUser[]) => void
}

export default function DialogManageInstitutions({ open, setOpen, institutions, setInstitutions, users, setUsers }: Props) {
    const [editingId, setEditingId] = useState<string | null>(null)
    const [name, setName] = useState('')
    const [color, setColor] = useState('#28bdc8')
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
    const [confirmDelete, setConfirmDelete] = useState<Institution | null>(null)
    const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
    const [isSaving, setIsSaving] = useState(false)

    const showAlert = (type: 'success' | 'error', message: string) => {
        setAlert({ type, message })
        setTimeout(() => { setAlert(null); }, 3000)
    }

    const resetForm = () => {
        setEditingId(null)
        setName('')
        setColor('#28bdc8')
        setAnchorEl(null)
    }

    const handleClose = () => {
        resetForm()
        setOpen(false)
    }

    const startCreate = () => {
        setEditingId('new')
        setName('')
        setColor('#28bdc8')
    }

    const startEdit = (institution: Institution) => {
        setEditingId(institution.id)
        setName(institution.name)
        setColor(institution.color)
    }

    const refreshInstitutions = async () => {
        const updated = await InstitutionService.FindAll()
        setInstitutions(updated)
    }

    const saveInstitution = async () => {
        if (!name.trim()) {
            showAlert('error', 'El nombre de la institución es obligatorio')
            return
        }
        if (!color.trim()) {
            showAlert('error', 'Debes elegir un color para la institución')
            return
        }

        setIsSaving(true)
        try {
            if (editingId === 'new') {
                await InstitutionService.CreateInstitution({ name: name.trim(), color })
                showAlert('success', 'Institución creada exitosamente')
            } else if (editingId) {
                await InstitutionService.UpdateInstitution({ _id: editingId, name: name.trim(), color })
                showAlert('success', 'Institución actualizada exitosamente')
            }
            await refreshInstitutions()
            resetForm()
        } catch (err: any) {
            showAlert('error', err?.status === 403 ? 'No tienes permisos para modificar instituciones' : 'No se pudo guardar la institución')
        } finally {
            setIsSaving(false)
        }
    }

    const deleteInstitution = async () => {
        if (!confirmDelete) return
        const deletedId = confirmDelete.id
        setConfirmDelete(null)
        setIsSaving(true)
        try {
            await InstitutionService.DeleteInstitution(deletedId)
            setInstitutions(institutions.filter((institution) => institution.id !== deletedId))
            setUsers(users.map((user) => user.institutionID === deletedId ? { ...user, institutionID: NIL_INSTITUTION_ID } : user))
            showAlert('success', 'Institución eliminada. Los usuarios asociados quedaron en N/A')
            if (editingId === deletedId) resetForm()
        } catch (err: any) {
            showAlert('error', err?.status === 403 ? 'No tienes permisos para eliminar instituciones' : 'No se pudo eliminar la institución')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" aria-labelledby="manage-institutions-title">
            <DialogTitle id="manage-institutions-title">Editar instituciones</DialogTitle>
            <CloseDialogButton handleClose={handleClose} />
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {alert && <Alert severity={alert.type}>{alert.message}</Alert>}

                {editingId ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Typography variant="subtitle2">{editingId === 'new' ? 'Nueva institución' : 'Editar institución'}</Typography>
                        <TextField
                            label="Nombre"
                            value={name}
                            onChange={(e) => { setName(e.target.value); }}
                            size="small"
                            fullWidth
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box
                                onClick={(event) => { setAnchorEl(event.currentTarget); }}
                                sx={{ width: 42, height: 42, bgcolor: color, borderRadius: 1, border: '1px solid #ddd', cursor: 'pointer' }}
                            />
                            <Typography variant="body2" color="text.secondary">Editar color</Typography>
                        </Box>
                        <Popover
                            open={Boolean(anchorEl)}
                            anchorEl={anchorEl}
                            onClose={() => { setAnchorEl(null); }}
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                        >
                            <Box sx={{ p: 1 }}>
                                <HexColorPicker color={color} onChange={setColor} />
                            </Box>
                        </Popover>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button variant="contained" startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />} onClick={saveInstitution} disabled={isSaving}>
                                Guardar
                            </Button>
                            <Button variant="outlined" color="error" startIcon={<CancelIcon />} onClick={resetForm} disabled={isSaving}>
                                Cancelar
                            </Button>
                        </Box>
                    </Box>
                ) : (
                    <Button variant="contained" startIcon={<AddIcon />} onClick={startCreate} disabled={isSaving}>
                        Agregar institución
                    </Button>
                )}

                <List dense>
                    {institutions.length === 0 ? (
                        <Typography color="text.secondary" sx={{ py: 2 }}>No hay instituciones registradas</Typography>
                    ) : institutions.map((institution) => (
                        <ListItem
                            key={institution.id}
                            divider
                            secondaryAction={
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                    <Tooltip title="Editar">
                                        <IconButton size="small" onClick={() => { startEdit(institution); }} disabled={isSaving}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Eliminar">
                                        <IconButton size="small" color="error" onClick={() => { setConfirmDelete(institution); }} disabled={isSaving}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            }
                        >
                            <Box sx={{ width: 24, height: 24, bgcolor: institution.color, borderRadius: 1, border: '1px solid #ddd', mr: 2 }} />
                            <ListItemText primary={institution.name} secondary={institution.color} />
                        </ListItem>
                    ))}
                </List>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cerrar</Button>
            </DialogActions>
            {confirmDelete && (
                <ConfirmDialog
                    open={Boolean(confirmDelete)}
                    title="Eliminar institución"
                    message={`¿Eliminar "${confirmDelete.name}"? Los usuarios asociados quedarán con institución N/A.`}
                    confirmText="Eliminar"
                    cancelText="Cancelar"
                    confirmColor="error"
                    severity="warning"
                    onConfirm={deleteInstitution}
                    onCancel={() => { setConfirmDelete(null); }}
                />
            )}
        </Dialog>
    )
}

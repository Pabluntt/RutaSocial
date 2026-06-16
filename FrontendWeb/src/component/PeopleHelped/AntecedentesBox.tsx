import { Paper, Typography, IconButton, TextField, Button, Divider } from "@mui/material"
import AddIcon from '@mui/icons-material/Add'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import { AntecedenteEntry } from "../../api/models/Persona"
import { useState } from "react"
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

type AntecedentesBoxProps = {
    title: string
    entries: AntecedenteEntry[]
    onAdd: (descripcion: string) => void
    onDelete: (entryId: string) => void
}

export default function AntecedentesBox({ title, entries, onAdd, onDelete }: AntecedentesBoxProps) {
    const [adding, setAdding] = useState(false)
    const [text, setText] = useState('')

    const handleAdd = () => {
        if (!text.trim()) return
        onAdd(text.trim())
        setText('')
        setAdding(false)
    }

    return (
        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: '12px', bgcolor: '#fafafa' }}>
            <div className="flex items-center justify-between mb-3">
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{title}</Typography>
                <Button
                    startIcon={<AddIcon />}
                    variant="outlined"
                    size="small"
                    onClick={() => setAdding(!adding)}
                    sx={{ borderRadius: '8px', textTransform: 'none' }}
                >
                    Añadir
                </Button>
            </div>

            {adding && (
                <div className="flex gap-2 mb-3">
                    <TextField
                        fullWidth
                        size="small"
                        multiline
                        minRows={2}
                        placeholder="Escribe el antecedente..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        slotProps={{ inputLabel: { shrink: true } }}
                    />
                    <div className="flex flex-col gap-1">
                        <Button variant="contained" size="small" onClick={handleAdd} sx={{ borderRadius: '8px', textTransform: 'none', whiteSpace: 'nowrap' }}>
                            Guardar
                        </Button>
                        <Button variant="text" size="small" onClick={() => { setAdding(false); setText('') }} sx={{ borderRadius: '8px', textTransform: 'none' }}>
                            Cancelar
                        </Button>
                    </div>
                </div>
            )}

            {entries.length === 0 ? (
                <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center', fontSize: 14 }}>
                    Sin registros
                </Typography>
            ) : (
                <div className="flex flex-col gap-2">
                    {entries.map((entry) => (
                        <Paper key={entry.id} variant="outlined" sx={{ p: 2, borderRadius: '8px', bgcolor: 'white' }}>
                            <div className="flex justify-between items-start gap-2">
                                <div className="flex-1">
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                                        {format(entry.fecha, "dd/MM/yyyy HH:mm", { locale: es })}
                                    </Typography>
                                    <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>
                                        {entry.descripcion}
                                    </Typography>
                                </div>
                                <IconButton size="small" color="error" onClick={() => onDelete(entry.id)}>
                                    <DeleteOutlineIcon fontSize="small" />
                                </IconButton>
                            </div>
                        </Paper>
                    ))}
                </div>
            )}
            <Divider sx={{ mt: 1 }} />
        </Paper>
    )
}

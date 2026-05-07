import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { Position } from "../../utils/getCurrentLocation";
import { useState, useEffect } from "react";

type Props = {
    stateOpen: [boolean, React.Dispatch<React.SetStateAction<boolean>>]
    location: Position
    onCreate: (data: { id: string, coords: number[], name: string, cupos: number }) => void
}

export default function DialogCreateAlojamiento({ stateOpen, location, onCreate }: Props) {
    const [ open, setOpen ] = stateOpen
    const [ name, setName ] = useState('')
    const [ cupos, setCupos ] = useState<number>(1)

    useEffect(() => {
        if(!open) {
            setName('')
            setCupos(1)
        }
    }, [open])

    const handleClose = () => {
        setOpen(false)
    }

    const handleSubmit = () => {
        const id = Date.now().toString()
        const coords = [location.latitude, location.longitude]
        onCreate({ id, coords, name: name || 'Alojamiento', cupos })
        setOpen(false)
    }

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Añadir Alojamiento</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Nombre"
                    fullWidth
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <TextField
                    margin="dense"
                    label="Cupos disponibles"
                    type="number"
                    fullWidth
                    value={cupos}
                    onChange={(e) => setCupos(Number(e.target.value))}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancelar</Button>
                <Button onClick={handleSubmit} variant="contained">Crear</Button>
            </DialogActions>
        </Dialog>
    )
}

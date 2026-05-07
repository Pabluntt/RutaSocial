import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { Position } from "../../utils/getCurrentLocation";
import { useState, useEffect } from "react";

export type AlojamientoData = {
    id: string
    coords: [number, number]
    name: string
    cupos: number
}

type Props = {
    stateOpen: [boolean, (value: boolean) => void]
    location: Position
    onCreate: (data: AlojamientoData) => void
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
        const coords: [number, number] = [location.latitude, location.longitude]
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
                    onChange={(e: { target: { value: string } }) => setName(e.target.value)}
                />
                <TextField
                    margin="dense"
                    label="Cupos disponibles"
                    type="number"
                    fullWidth
                    value={cupos}
                    onChange={(e: { target: { value: string } }) => setCupos(Math.max(0, Number(e.target.value) || 0))}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancelar</Button>
                <Button onClick={handleSubmit} variant="contained">Crear</Button>
            </DialogActions>
        </Dialog>
    )
}

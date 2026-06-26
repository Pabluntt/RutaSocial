import { useState } from 'react'
import {
  Fab,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import { useTourStore } from '../stores/useTourStore'

export default function HelpButton() {
  const [openDialog, setOpenDialog] = useState(false)
  const { startTour } = useTourStore()

  const handleFabClick = () => {
    setOpenDialog(true)
  }

  const handleStart = () => {
    setOpenDialog(false)
    startTour()
  }

  return (
    <>
      <Tooltip title="¿Necesitas ayuda?" placement="left">
        <Fab
          onClick={handleFabClick}
          size="medium"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 90,
            bgcolor: '#009BA5',
            color: '#fff',
            '&:hover': { bgcolor: '#007a82' },
          }}
        >
          <HelpOutlineIcon />
        </Fab>
      </Tooltip>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>🤖 ¡Hola! Soy tu guía</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Quieres que te ayude a identificar cada sección de la barra lateral?
            Te explicaré una por una para que conozcas todo lo que puedes hacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="inherit">
            No, gracias
          </Button>
          <Button onClick={handleStart} variant="contained" sx={{ bgcolor: '#009BA5' }}>
            ¡Sí, quiero!
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

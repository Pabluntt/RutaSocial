import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  Fab,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
} from '@mui/material'
import { useTourStore } from '../stores/useTourStore'
import { mascotAssets } from '../assets/mascot/mascotAssets'

export default function HelpButton() {
  const location = useLocation()
  const [openDialog, setOpenDialog] = useState(false)
  const { startTour } = useTourStore()

  if (location.pathname.includes('login')) return null

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
          aria-label="Abrir ayuda guiada"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 90,
            width: 64,
            height: 64,
            bgcolor: '#fff',
            border: '2px solid #009BA5',
            color: '#009BA5',
            overflow: 'visible',
            '&:hover': { bgcolor: '#E6F7F8' },
          }}
        >
          <Box
            component="img"
            src={mascotAssets.thinking}
            alt="Mascota de ayuda"
            sx={{ width: 55, height: 55, objectFit: 'contain' }}
          />
          <Box
            component="span"
            sx={{
              position: 'absolute',
              top: -4,
              right: -4,
              width: 22,
              height: 22,
              borderRadius: '50%',
              bgcolor: '#009BA5',
              color: '#fff',
              border: '2px solid #fff',
              fontWeight: 800,
              fontSize: 14,
              lineHeight: '18px',
            }}
          >
            ?
          </Box>
        </Fab>
      </Tooltip>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            component="img"
            src={mascotAssets.wave}
            alt="Mascota saludando"
            sx={{ width: 88, height: 88, objectFit: 'contain' }}
          />
          ¡Hola! Soy tu guía
        </DialogTitle>
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

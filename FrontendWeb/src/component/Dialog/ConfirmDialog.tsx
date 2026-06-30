import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmText: string
  cancelText: string
  confirmColor?: 'primary' | 'error' | 'success' | 'warning'
  loading?: boolean
  severity?: 'info' | 'warning' | 'error' | 'success'
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmText,
  cancelText,
  confirmColor = 'primary',
  loading = false,
  severity,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={loading ? undefined : onCancel} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: 700 }}>{title}</DialogTitle>
      <DialogContent>
        {severity ? (
          <Alert severity={severity} sx={{ mb: 2 }}>
            {message}
          </Alert>
        ) : (
          <Typography color="text.secondary">{message}</Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onCancel} disabled={loading} variant="outlined" sx={{ textTransform: 'none', borderRadius: '8px' }}>
          {cancelText}
        </Button>
        <Button onClick={onConfirm} disabled={loading} variant="contained" color={confirmColor} sx={{ textTransform: 'none', borderRadius: '8px' }}>
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

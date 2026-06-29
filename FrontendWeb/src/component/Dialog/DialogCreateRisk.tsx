import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { Alert, CircularProgress, Typography, Zoom, Chip, Paper, useTheme, useMediaQuery } from '@mui/material';
import { useEffect, useState } from 'react';
import getCurrentLocation, { Position } from '../../utils/getCurrentLocation';
import InputDescription from '../Input/InputDescription';
import CloseDialogButton from '../Button/CloseDialogButton';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import ReplayIcon from '@mui/icons-material/Replay';
import { LocationMethod } from '../../Enums/LocationMethod';
import { useCreateRisk, useRisks } from '../../api/hooks/RiskHooks';
import { RiskStatus } from '../../Enums/RiskStatus';
import { useProfile } from '../../api/hooks/UserHooks';
import { useAppSnackbar } from '../../context/SnackbarContext';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(0, 3),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1.5, 3),
  },
  '& .MuiDialog-paper': {
    borderRadius: '16px',
  },
}));

export type DialogCreateRiskProps = { 
    stateOpen : [ boolean, React.Dispatch<React.SetStateAction<boolean>>]
    stateOnSelectLocationMap : [ boolean, React.Dispatch<React.SetStateAction<boolean>> ]
    stateLocationMethod : [ LocationMethod, React.Dispatch<React.SetStateAction<LocationMethod>> ]
    stateDescription : [ string, React.Dispatch<React.SetStateAction<string>> ]
    location : Position
}

export default function DialogCreateRisk({ stateOpen, stateOnSelectLocationMap, location, stateLocationMethod, stateDescription } : DialogCreateRiskProps) {

    const theme = useTheme();
    const fullScreen = !useMediaQuery(theme.breakpoints.up('sm'));
    const [ open, setOpen ] = stateOpen
    const [ , setOnSelectLocationMap ] = stateOnSelectLocationMap 

    const authorID = useProfile().data?.id

    const [ description, setDescription ] = stateDescription
    const [ coords, setCoords ] = useState<number[]>([])
    const [ required, setRequired ] = useState(false)
    const [ createButtonDisable, setCreateButtonDisable ] = useState(true)
    const [ locationMethod, setLocationMethod ] = stateLocationMethod
    const [ error, setError ] = useState<string | undefined>()

    const { mutate, data, isError, isSuccess, isPending, isIdle, reset } = useCreateRisk()
    const { refetch } = useRisks()
    const { showSnackbar } = useAppSnackbar()

    const handleCurrentLocation = async () => {
        setLocationMethod(LocationMethod.Current)
        try {
            const currentPosition = await getCurrentLocation()
            setCoords([currentPosition.latitude, currentPosition.longitude])
        } catch (e) {
            setError((e as Error).message)
            showSnackbar((e as Error).message, 'error')
        }
    }
    
    const handleSelectLocationMap = () => {
        setLocationMethod(LocationMethod.Map)
        setOnSelectLocationMap(true)
        setOpen(false)
    }

    useEffect(() => {
        if(location.latitude != 0) {
            setLocationMethod(LocationMethod.Map)
            setCoords([location.latitude, location.longitude])
        }
    }, [location])

    useEffect(() => {
        if(coords.length != 0) {
            setCreateButtonDisable(false)
        }
    }, [coords])

    const handleClose = () => {
        setOpen(false)
    }

    const handleSubmit = () => {
        if(!description) {
            setRequired(true)
            return
        }
        if(coords.length != 2) {
            return 
        }
        if(!authorID) {
            return
        }

        mutate({
            description,
            coords,
            authorID: authorID,
            status : RiskStatus.Environment
        })
    }

    useEffect(() => {
        if(isSuccess) {
            refetch()
            setTimeout(() => {
                handleClose()
            }, 1000)   
        }
    }, [isSuccess])

    return (
        <BootstrapDialog 
            fullScreen={fullScreen}
            fullWidth
            maxWidth="sm"
            open={open} 
            onClose={handleClose}
            aria-labelledby='risk-titulo'
            keepMounted
            slotProps={{
                transition : {
                    onExited: () => {
                        reset()
                        setRequired(false)
                        setDescription('')
                        setLocationMethod(LocationMethod.None)
                        setError(undefined)
                        setCreateButtonDisable(true)
                        setCoords([])
                    }
                }
            }}      
        >
            <DialogTitle sx={{ m: 0, p: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip 
                    label={isIdle ? 'Nuevo' : isPending ? 'Enviando...' : isSuccess ? 'Completado' : 'Error'} 
                    size="small"
                    color={isSuccess ? 'success' : isError ? 'error' : isPending ? 'warning' : 'default'}
                    variant="outlined"
                    sx={{ fontWeight: 600, fontSize: 11 }}
                />
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                    { 
                        isIdle ? 'Crear un riesgo' :
                        isPending ? 'Cargando...' :
                        isSuccess ? 'Riesgo Creado' :
                        isError ? 'Ha ocurrido un error' :
                        'Error desconocido'
                    }
                </Typography>
            </DialogTitle>
            <CloseDialogButton handleClose={handleClose} />
            
            <DialogContent dividers sx={{ borderTop: 'none', borderBottom: 'none' }}>
                { isIdle ? 
                    <div className='flex flex-col gap-4 py-3'>
                        <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: '8px' }}>
                            <Typography variant="body2" sx={{ lineHeight: 1.8, color: '#555' }}>
                                {"\u2022"} Un riesgo señala una zona de <b>alerta</b> en el sector. <br/>
                                {"\u2022"} Podrás detallar la causa del riesgo agregando una breve descripción. <br />
                                {"\u2022"} Se podrá actualizar a lo largo del tiempo, reflejando el estado actual del riesgo.
                            </Typography>
                        </Paper>
                        <InputDescription 
                            maxLength={100}
                            maxRows={6}
                            required
                            error={required}
                            variant='outlined'
                            label='Descripción del riesgo'
                            placeholder='Ingresa la descripción del riesgo'
                            value={description}       
                            onChange={(e) => {setDescription(e.target.value); setRequired(false)}}    
                            onBlur={(_) => {if(!description) setRequired(true)}}            
                        />
                        {required ? <Typography variant="caption" color="error" sx={{ mt: -1 }}>Debes ingresar una descripción</Typography> : null}
                        <div className='flex flex-col gap-2'>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Seleccionar ubicación</Typography>
                            <div className='flex grow justify-center items-center gap-2'>
                                <Button 
                                    color={locationMethod === LocationMethod.Current ? error ? 'error' : 'success' : 'primary'} 
                                    fullWidth variant='contained' 
                                    onClick={handleCurrentLocation}
                                    sx={{ textTransform: 'none', borderRadius: '8px', py: 1 }}
                                >
                                    <Zoom in style={{ transition: 'ease-in-out'}}>
                                        <div className="flex items-center gap-1">
                                            { locationMethod === LocationMethod.Current ? 
                                                error ? <ReplayIcon fontSize="small" />  : <TaskAltIcon fontSize="small" />
                                            : 
                                                <span>Obtener ubicación actual</span>
                                            }
                                        </div>
                                    </Zoom>
                                </Button>
                                <Button 
                                    fullWidth 
                                    variant='contained' 
                                    color={ locationMethod === LocationMethod.Map ? error ? 'error' : 'success' : 'secondary'}
                                    onClick={handleSelectLocationMap}
                                    sx={{ textTransform: 'none', borderRadius: '8px', py: 1 }}
                                >
                                    <Zoom in style={{ transition: 'ease-in-out'}}>
                                        <div className="flex items-center gap-1">
                                            { locationMethod === LocationMethod.Map ? 
                                                error ? <ReplayIcon fontSize="small" /> : <TaskAltIcon fontSize="small" />
                                            : 
                                                <span>Seleccionar en el mapa</span>
                                            }
                                        </div>
                                    </Zoom>
                                </Button>
                            </div>
                            <Alert severity={error ? 'error' : coords.length != 0 ? 'success' : 'warning'} sx={{ borderRadius: '8px' }}> 
                                {error ? error : coords.length != 0 ? 'Ubicación completada' : 'Necesitas seleccionar una opción'}
                            </Alert>
                        </div>
                    </div>
                    :
                    isPending ? 
                    <div className='flex grow items-center justify-center py-8'>
                        <CircularProgress size={60} />
                    </div>    
                    :
                    <Alert sx={{ mt: 2, borderRadius: '8px' }} variant='outlined' severity={ isSuccess ? 'success' : isError ? 'error' : 'info'}>
                            {isSuccess ? 'Se creó el riesgo exitosamente' : isError ? 'Hubo un error al intentar crear el riesgo' : 'Error desconocido'}
                    </Alert>
                }
            </DialogContent>
            <DialogActions>
                { isSuccess ?
                    <></>
                    :
                    <>
                        <Button variant='contained' disabled={createButtonDisable} onClick={handleSubmit} sx={{ borderRadius: '8px', textTransform: 'none' }}>
                            Crear Riesgo
                        </Button>
                        <Button variant='outlined' color='error' onClick={handleClose} sx={{ borderRadius: '8px', textTransform: 'none' }}>
                            Cancelar
                        </Button>
                    </>
                }
            </DialogActions>
        </BootstrapDialog>
    )    
};

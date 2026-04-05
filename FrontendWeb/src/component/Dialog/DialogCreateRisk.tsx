import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { Alert, CircularProgress, Typography, Zoom } from '@mui/material';
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

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(0, 3),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
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


    const handleCurrentLocation = async () => {
        setLocationMethod(LocationMethod.Current)
        try {
            const currentPosition = await getCurrentLocation()
            setCoords([currentPosition.latitude, currentPosition.longitude])
        } catch (e) {
            setError((e as Error).message)
            alert(`error : ${(e as Error).message}`)
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
        //reset()
        //setRequired(false)
        //setDescription('')
        //setLocationMethod(LocationMethod.None)
        //setError(undefined)
        //setCreateButtonDisable(true)
        //setCoords([])
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
            status : RiskStatus.Enviroment
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
            fullWidth
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
            <DialogTitle className='m-0 p-2' id="risk-titulo">
                { 
                    isIdle ? 'Crear un riesgo' :
                    isPending ? 'Cargando...' :
                    isSuccess ? 'Riesgo Creado':
                    isError ? 'Ha ocurrido un error' :
                    'Error desconocido'
                }
            </DialogTitle>
            <CloseDialogButton handleClose={handleClose} />
            
            <DialogContent>
                { isIdle ? 
                    <div className='flex flex-col gap-4'>
                        <Typography variant="body1" sx={{ lineHeight: 2, fontSize: {
                                xs : '0.75rem',
                                sm : '0.75rem',
                                md : '0.95rem' 
                            }}}>
                            {"\u2022"} Un riesgo señala una zona de <b>alerta</b> en el sector. <br/>
                            {"\u2022"} Podrás detallar la causa del riesgo agregando una breve descripción. <br />
                            {"\u2022"} Se podrá actualizar a lo largo del tiempo, reflejando el estado actual del riesgo.
                        </Typography>
                        <InputDescription 
                            maxLength={100}
                            maxRows={6}
                            required
                            error={required}
                            variant='standard'
                            label='Descripción'
                            placeholder='ingresa la descripción del riesgo'
                            value={description}       
                            onChange={(e) => {setDescription(e.target.value); setRequired(false)}}    
                            onBlur={(_) => {if(!description) setRequired(true)}}            
                        />
                        {required ? <p className='text-red-600'> Debes de Ingresar una descripción</p> : <br />}
                        <div className='flex flex-col gap-2'>
                            <Typography>Seleccionar Ubicación</Typography>
                            <div className='flex grow justify-center items-center gap-2'>
                                <Button 
                                    color={locationMethod === LocationMethod.Current ? error ? 'error' : 'success' : 'primary'} 
                                    fullWidth variant='contained' 
                                    onClick={handleCurrentLocation}
                                    loadingIndicator
                                >
                                    <Zoom in style={{ transition: 'ease-in-out'}}>
                                        <div>
                                            { locationMethod === LocationMethod.Current ? 
                                                error ? <ReplayIcon />  : <TaskAltIcon />
                                            : 
                                                <span>Obtener Ubicación actual</span>
                                            }
                                        </div>
                                    </Zoom>
                                </Button>
                                <Button 
                                    fullWidth 
                                    variant='contained' 
                                    color={ locationMethod === LocationMethod.Map ? error ? 'error' : 'success' : 'secondary'}
                                    onClick={handleSelectLocationMap}
                                >
                                    <Zoom in style={{ transition: 'ease-in-out'}}>
                                        <div>
                                            { locationMethod === LocationMethod.Map ? 
                                                error ? <ReplayIcon /> : <TaskAltIcon/>
                                            : 
                                                <span>Seleccionar en el mapa</span>
                                            }
                                        </div>
                                    </Zoom>
                                </Button>
                            </div>
                            <Alert severity={error ? 'error' : coords.length != 0 ? 'success' : 'warning'}> 
                                {error ? error : coords.length != 0 ? 'Ubicación Completada' : ' Necesitas Seleccionar un opción'}
                            </Alert>
                        </div>
                    </div>
                    :
                    isPending ? 
                    <div className='flex grow items-center justify-center'>
                        <CircularProgress size={70} />
                    </div>    
                    :
                    <Alert sx={{ mt: 2, width: '100%', minHeight: '80px', display: 'flex', alignItems: 'center', fontSize: '1rem' }} variant='standard' severity={ isSuccess ? 'success' : isError ? 'error' : 'info'}>
                            {isSuccess ? 'Se Creo el riesgo exitosamente' : isError ? 'Hubo un error al intentar finalizar' : 'Error desconocido'}
                    </Alert>
                }
            </DialogContent>
            <DialogActions>
                { isSuccess ?
                    <></>
                    :
                    <>
                        <Button  variant='contained' disabled={createButtonDisable} onClick={handleSubmit}>
                            Crear Riesgo
                        </Button>
                        <Button variant='contained' color='error' onClick={handleClose}>
                            Cancelar
                        </Button>
                    </>
                }
            </DialogActions>
        </BootstrapDialog>
    )    
};

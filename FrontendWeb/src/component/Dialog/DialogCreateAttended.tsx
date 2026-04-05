import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import ReplayIcon from '@mui/icons-material/Replay';
import { Alert, CircularProgress, TextField, Typography, Zoom } from '@mui/material';
import ComboBox from '../Button/ComboBox';
import { useEffect, useState } from 'react';
import getCurrentLocation, { Position } from '../../utils/getCurrentLocation';
import useSessionStore from '../../stores/useSessionStore';
import CloseDialogButton from '../Button/CloseDialogButton';
import { LocationMethod } from '../../Enums/LocationMethod';
import { useCreateHelpPoint, useHelpPoints } from '../../api/hooks/HelpPointHooks';
import { TUserRegister } from '../../pages/home';
import { useProfile } from '../../api/hooks/UserHooks';


const SIN_ESPECIFICAR = "Sin especificar" 

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(3),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));



export type DialogCreateAttendedProps = { 
    stateOpen : [ boolean, React.Dispatch<React.SetStateAction<boolean>>]
    stateOnSelectLocationMap : [ boolean, React.Dispatch<React.SetStateAction<boolean>> ]
    stateLocationMethod : [ LocationMethod, React.Dispatch<React.SetStateAction<LocationMethod>> ]
    stateAttended : [ TUserRegister, React.Dispatch<React.SetStateAction<TUserRegister>>]
    location : Position
}


export default function DialogCreateAttended({ stateAttended, stateOpen, stateOnSelectLocationMap, location, stateLocationMethod } : DialogCreateAttendedProps) {

    const authorID = useProfile().data?.id
    const { accessToken, routeId } = useSessionStore()
    const [ open, setOpen ] = stateOpen
    const [ _, setOnSelectLocationMap ] = stateOnSelectLocationMap

    const [ attendedP, setAttendedP] = stateAttended

    const gender = attendedP.gender
    const name = attendedP.name
    const age = attendedP.age

    const setName = (name: string) => setAttendedP(prev => ({ ...prev, name }))
    const setAge = (age: number) => setAttendedP(prev => ({ ...prev, age }))
    const setGender = (gender: string) => setAttendedP(prev => ({ ...prev, gender }))

    const [ coords, setCoords ] = useState<number[]>([])

    const [ locationMethod, setLocationMethod ] = stateLocationMethod
    const [ createButtonDisable, setCreateButtonDisable ] = useState(true)
    const [ error, setError ] = useState<string | undefined>()

    const { mutate, data, isError, isSuccess, isPending, isIdle, reset } = useCreateHelpPoint()
    const { refetch } = useHelpPoints()



    const handleCurrentLocation = async () => {
        setLocationMethod(LocationMethod.Current)
        try {
            const currentPosition = await getCurrentLocation()
            console.log(currentPosition)
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

    useEffect(() => {
        console.log(attendedP.name)
    }, [])




    const clearStates = () => {
        reset()
        setCoords([])
        setCreateButtonDisable(true)
        setLocationMethod(LocationMethod.None)
    }

    const handleClose = () => {
        setOpen(false)
    }

    const handleSubmit = () => {
        if(coords.length != 2) {
            alert('no hay coordenadas registradas')
            return
        }
        if(!authorID) {
            alert('ha ocurrido un error inesperado')
            return
        }
        mutate({
            routeID: (routeId as string),
            coords: coords,
            peopleHelped: {
                name : name === '' ? SIN_ESPECIFICAR : name,
                age  : age,
                gender : gender === '' ? SIN_ESPECIFICAR : gender
            },
            authorID: authorID as string,
            disabled: false
        })
    }

    useEffect(() => {
        if(isSuccess) {
            refetch()
            setAttendedP({name: 'Sin Especificar', gender: 'Sin Especificar', age: -1})
            setTimeout(() => {
                handleClose()
            }, 2000)
        }
    }, [isSuccess])


    return (
        <BootstrapDialog 
            fullWidth
            open={open} 
            onClose={handleClose}
            aria-labelledby='attended-titulo'
            keepMounted
            slotProps={{
                transition : {
                    onExited: () => {
                        clearStates()
                    }
                }
            }}    
        >
            <DialogTitle className='m-0 p-2' id="attended-titulo">
                {
                    isIdle ? 'Crear un Registro' : 
                    isPending ? 'Cargando...' :
                    isSuccess ? 'Registro Guardado' :
                    isError ? 'Ha ocurrido un error' :
                    'Error desconocido'
                }
            </DialogTitle>
            <CloseDialogButton handleClose={handleClose} />

            <DialogContent>
                { isIdle ?
                    <form className='flex flex-col gap-10 p-2'>
                        <div className='flex grow flex-row gap-5'>
                            <TextField
                                fullWidth
                                id="name" 
                                variant='standard'
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                label='Nombre '
                                slotProps={{
                                    inputLabel: {
                                    shrink: true,
                                    },
                                }}    
                                onFocus={(event) => {
                                        event.target.select();
                                }}
                            />
                            <TextField
                                id="edad"
                                variant='standard'
                                onChange={(e) => {setAge(Number(e.target.value))}}
                                label='edad'
                                type='number'
                                value={age}
                                slotProps={{
                                    inputLabel: {
                                        shrink: true,
                                    }
                                }}
                            />
                        </div>
                        <div className='flex grow'>
                            <ComboBox 
                                className='grow'
                                label={'Género'} 
                                value={gender}
                                onChange={(e, value) => {setGender(value as string)}}
                                options={['Hombre', 'Mujer', 'Sin Especificar']}  
                                defaultValue={'Sin Especificar'}                          
                            />  
                        </div>
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
                                {error ? error : coords.length != 0 ? 'Ubicación Completada' : 'Selecciona una opción para establecer la ubicación'}
                            </Alert>
                        </div>
                    </form>
                    :
                    isPending ? 
                    <div className='flex grow items-center justify-center'>
                        <CircularProgress size={70} />
                    </div>
                    :
                    <Alert sx={{ mt: 2, width: '100%', minHeight: '80px', display: 'flex', alignItems: 'center', fontSize: '1rem' }} variant='standard' severity={ isSuccess ? 'success' : isError ? 'error' : 'info'}>
                            {isSuccess ? 'Se Creo el registro exitosamente' : isError ? 'Hubo un error al intentar finalizar' : 'Error desconocido'}
                    </Alert>
                }
                
            </DialogContent>
            <DialogActions>
                { isSuccess ?
                    <>
                    </>
                    :
                    <>
                        <Button variant='contained' disabled={createButtonDisable} onClick={handleSubmit}>
                            Crear Registro
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

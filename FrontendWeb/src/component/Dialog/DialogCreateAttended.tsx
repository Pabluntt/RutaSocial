import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import ReplayIcon from '@mui/icons-material/Replay';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import { Alert, CircularProgress, IconButton, TextField, Typography, Zoom } from '@mui/material';
import { useEffect, useMemo, useState, useRef } from 'react';
import getCurrentLocation, { Position } from '../../utils/getCurrentLocation';
import useSessionStore from '../../stores/useSessionStore';
import CloseDialogButton from '../Button/CloseDialogButton';
import { LocationMethod } from '../../Enums/LocationMethod';
import { useCreateHelpPoint, useHelpPoints } from '../../api/hooks/HelpPointHooks';
import { TUserRegister } from '../../pages/home';
import { useProfile } from '../../api/hooks/UserHooks';
import { HelpedPerson } from '../../api/models/HelpPoint';

const SIN_ESPECIFICAR = 'Sin especificar';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(3),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

type PersonDraft = {
    id: string
    name: string
    rut: string
    age: string
};

export type DialogCreateAttendedProps = { 
    stateOpen : [ boolean, React.Dispatch<React.SetStateAction<boolean>> ]
    stateOnSelectLocationMap : [ boolean, React.Dispatch<React.SetStateAction<boolean>> ]
    stateLocationMethod : [ LocationMethod, React.Dispatch<React.SetStateAction<LocationMethod>> ]
    stateAttended : [ TUserRegister, React.Dispatch<React.SetStateAction<TUserRegister>> ]
    statePeople : [ PersonDraft[], React.Dispatch<React.SetStateAction<PersonDraft[]>> ]
    stateCoords : [ number[], React.Dispatch<React.SetStateAction<number[]>> ]
    location : Position
}

function createPersonDraft(seed?: Partial<TUserRegister>): PersonDraft {
    return {
        id: `${Date.now()}-${Math.random()}`,
        name: seed?.name && seed.name !== SIN_ESPECIFICAR ? seed.name : '',
        rut: '',
        age: seed?.age && seed.age > 0 ? String(seed.age) : '',
    }
}

function normalizeRut(rut: string) {
    return rut.replace(/\s+/g, '').toUpperCase();
}

function isValidRutFormat(rut: string) {
    if (!rut) return true;
    return /^(?:\d{1,2}\.\d{3}\.\d{3}-[\dkK]|\d{7,8}-[\dkK])$/.test(normalizeRut(rut));
}

export default function DialogCreateAttended({ stateAttended, stateOpen, stateOnSelectLocationMap, location, stateLocationMethod, statePeople, stateCoords } : DialogCreateAttendedProps) {

    const authorID = useProfile().data?.id
    const { routeId } = useSessionStore()
    const [ open, setOpen ] = stateOpen
    const [ onSelectLocationMap, setOnSelectLocationMap ] = stateOnSelectLocationMap
    const [ attendedP, setAttendedP ] = stateAttended
    const [ people, setPeople ] = statePeople
    const [ coords, setCoords ] = stateCoords

    const [ locationMethod, setLocationMethod ] = stateLocationMethod
    const [ createButtonDisable, setCreateButtonDisable ] = useState(true)
    const [ error, setError ] = useState<string | undefined>()
    const [ comment, setComment ] = useState('')

    const { mutate, isError, isSuccess, isPending, isIdle, reset } = useCreateHelpPoint()
    const { refetch } = useHelpPoints()
    
    // Rastrear el valor anterior de onSelectLocationMap
    const prevOnSelectLocationMapRef = useRef(onSelectLocationMap)
    const hasLocationRef = useRef(false)
    const isSelectingLocationRef = useRef(false)

    useEffect(() => {
        // Actualizar la ref cada vez que onSelectLocationMap cambia
        isSelectingLocationRef.current = onSelectLocationMap
    }, [onSelectLocationMap])

    const primaryPerson = useMemo(() => people[0], [people])

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
        console.log('[DialogCreateAttended] handleSelectLocationMap presionado. Antes: onSelectLocationMap=', onSelectLocationMap)
        setLocationMethod(LocationMethod.Map)
        setOnSelectLocationMap(true)
        console.log('[DialogCreateAttended] handleSelectLocationMap ejecutado. Después: onSelectLocationMap debería ser true')
    }

    useEffect(() => {
        // Detectar transición de true a false
        const wasSelecting = prevOnSelectLocationMapRef.current
        const nowSelecting = onSelectLocationMap
        
        console.log('[DialogCreateAttended] onSelectLocationMap cambió. wasSelecting:', wasSelecting, 'nowSelecting:', nowSelecting)
        
        if (wasSelecting && !nowSelecting) {
            console.log('[DialogCreateAttended] TRANSICIÓN DETECTADA: true -> false, setea hasLocationRef.current = true')
            hasLocationRef.current = true
        }
        
        prevOnSelectLocationMapRef.current = onSelectLocationMap
    }, [onSelectLocationMap])

    useEffect(() => {
        console.log('[DialogCreateAttended] location cambió:', location)
        if(location.latitude != 0) {
            console.log('[DialogCreateAttended] ESTABLECIENDO COORDS:', [location.latitude, location.longitude])
            setLocationMethod(LocationMethod.Map)
            setCoords([location.latitude, location.longitude])
            // NO resetear hasLocationRef, solo setear coords
        }
    }, [location])

    useEffect(() => {
        console.log('[DialogCreateAttended] useEffect coords cambió:', coords, 'createButtonDisable:', createButtonDisable)
        if(coords.length === 2) {
            setCreateButtonDisable(false)
        }
    }, [coords])

    useEffect(() => {
        if(primaryPerson) {
            setAttendedP(prev => ({
                ...prev,
                name: primaryPerson.name || SIN_ESPECIFICAR,
                age: primaryPerson.age ? Number(primaryPerson.age) : -1,
                gender: SIN_ESPECIFICAR,
            }))
        }
    }, [primaryPerson, setAttendedP])

    const clearStates = () => {
        reset()
        // No limpiar coords ya que se mantiene en el padre
        // setCoords([])
        setCreateButtonDisable(true)
        setLocationMethod(LocationMethod.None)
        setError(undefined)
        setComment('')
        setPeople([createPersonDraft()])  // Resetear a 1 persona vacía
    }

    const handleClose = () => {
        // Usar la ref para determinar si estamos en modo seleccionar ubicación
        // Esto asegura que tenemos el valor actual, no el del closure anterior
        if (isSelectingLocationRef.current) {
            // Do nothing - dejar todo como está, solo se ocultará visualmente
            return
        }
        
        // Si es un cierre real (no por seleccionar ubicación), limpiar todo
        clearStates()
        setOpen(false)
        reset()
    }

    const updatePerson = (id: string, field: keyof Omit<PersonDraft, 'id'>, value: string) => {
        setPeople(prev => prev.map(person => person.id === id ? { ...person, [field]: value } : person))
    }

    const addPerson = () => {
        setPeople(prev => [...prev, createPersonDraft()])
    }

    const removePerson = (id: string) => {
        setPeople(prev => prev.length > 1 ? prev.filter(person => person.id !== id) : prev)
    }

    const handleSubmit = () => {
        if(coords.length !== 2) {
            alert('no hay coordenadas registradas')
            return
        }
        if(!authorID) {
            alert('ha ocurrido un error inesperado')
            return
        }

        // Filtrar solo personas que tienen al menos nombre (es lo único obligatorio)
        const validPeople = people
            .filter(person => person.name.trim().length > 0)
            .map(person => ({
                name: person.name.trim(),
                rut: normalizeRut(person.rut),
                age: person.age.trim(),
            }))

        if(validPeople.length === 0) {
            alert('Debes agregar al menos una persona con nombre')
            return
        }

        // Validar formato de RUT si está presente
        if(validPeople.some(person => person.rut.length > 0 && !isValidRutFormat(person.rut))) {
            alert('El formato del RUT no es válido')
            return
        }

        mutate({
            routeID: routeId as string,
            coords,
            comment,
            people: validPeople.map(person => ({
                name: person.name,
                rut: person.rut,
                age: person.age.length > 0 ? Number(person.age) : -1,
                gender: SIN_ESPECIFICAR,
            })) as HelpedPerson[],
            peopleHelped: validPeople[0]
                ? {
                    name: validPeople[0].name,
                    rut: validPeople[0].rut,
                    age: validPeople[0].age.length > 0 ? Number(validPeople[0].age) : -1,
                    gender: SIN_ESPECIFICAR,
                }
                : undefined,
            authorID: authorID as string,
            disabled: false,
        })
    }

    useEffect(() => {
        if(isSuccess) {
            refetch()
            setAttendedP({ name: SIN_ESPECIFICAR, gender: SIN_ESPECIFICAR, age: -1 })
            setTimeout(() => {
                handleClose()
            }, 2000)
        }
    }, [isSuccess])

    return (
        <BootstrapDialog 
            fullWidth
            open={open && !onSelectLocationMap}
            onClose={handleClose}
            aria-labelledby='attended-titulo'
            keepMounted
        >
            <DialogTitle className='m-0 p-2' id="attended-titulo">
                {
                    isIdle ? 'Crear un Punto' : 
                    isPending ? 'Cargando...' :
                    isSuccess ? 'Punto Guardado' :
                    isError ? 'Ha ocurrido un error' :
                    'Error desconocido'
                }
            </DialogTitle>
            <CloseDialogButton handleClose={handleClose} />

            <DialogContent>
                { isIdle ?
                    <form className='flex flex-col gap-8 p-2'>
                        <div className='flex flex-col gap-3'>
                            <div className='flex items-center justify-between gap-2'>
                                <Typography variant='h6'>Personas vistas</Typography>
                                <Button startIcon={<AddIcon />} variant='outlined' onClick={addPerson}>
                                    Agregar persona
                                </Button>
                            </div>
                            <div className='flex flex-col gap-4'>
                                {people.map((person, index) => (
                                    <div key={person.id} className='flex flex-col gap-3 rounded border border-dashed border-gray-300 p-3'>
                                        <div className='flex items-center justify-between'>
                                            <Typography variant='subtitle2'>Persona {index + 1}</Typography>
                                            {people.length > 1 ? (
                                                <IconButton color='error' onClick={() => removePerson(person.id)}>
                                                    <DeleteOutlineIcon fontSize='small' />
                                                </IconButton>
                                            ) : null}
                                        </div>
                                        <div className='flex flex-col gap-3 md:flex-row'>
                                            <TextField
                                                fullWidth
                                                id={`name-${person.id}`}
                                                variant='standard'
                                                value={person.name}
                                                onChange={(e) => updatePerson(person.id, 'name', e.target.value)}
                                                label='Nombre *'
                                                slotProps={{ inputLabel: { shrink: true } }}
                                            />
                                            <TextField
                                                fullWidth
                                                id={`rut-${person.id}`}
                                                variant='standard'
                                                value={person.rut}
                                                onChange={(e) => updatePerson(person.id, 'rut', e.target.value)}
                                                label='RUT'
                                                placeholder='12.345.678-9'
                                                slotProps={{ inputLabel: { shrink: true } }}
                                            />
                                            <TextField
                                                fullWidth
                                                id={`age-${person.id}`}
                                                variant='standard'
                                                onChange={(e) => updatePerson(person.id, 'age', e.target.value)}
                                                label='Edad'
                                                type='number'
                                                value={person.age}
                                                slotProps={{ inputLabel: { shrink: true } }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <TextField
                            fullWidth
                            id='comment'
                            variant='standard'
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            label='Comentario del punto'
                            multiline
                            minRows={3}
                            slotProps={{ inputLabel: { shrink: true } }}
                        />

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
                            <Alert severity={error ? 'error' : coords.length !== 0 ? 'success' : 'warning'}> 
                                {error ? error : coords.length !== 0 ? 'Ubicación Completada' : 'Selecciona una opción para establecer la ubicación'}
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
                            {isSuccess ? 'Se Creo el punto exitosamente' : isError ? 'Hubo un error al intentar finalizar' : 'Error desconocido'}
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
                            Crear Punto
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

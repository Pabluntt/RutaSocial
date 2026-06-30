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
import { Alert, CircularProgress, IconButton, TextField, Typography, Zoom, Chip, Paper, Divider, useTheme, useMediaQuery, List, ListItemButton, ListItemText, ListItemAvatar, Avatar, InputAdornment, MenuItem } from '@mui/material';
import { useEffect, useMemo, useState, useRef } from 'react';
import getCurrentLocation, { Position } from '../../utils/getCurrentLocation';
import useSessionStore from '../../stores/useSessionStore';
import CloseDialogButton from '../Button/CloseDialogButton';
import { LocationMethod } from '../../Enums/LocationMethod';
import { useCreateHelpPoint, useHelpPoints } from '../../api/hooks/HelpPointHooks';
import { TUserRegister } from '../../pages/home';
import { useProfile } from '../../api/hooks/UserHooks';
import { HelpedPerson } from '../../api/models/HelpPoint';
import { PersonaService } from '../../api/services/PersonaService';
import { Persona } from '../../api/models/Persona';
import SearchIcon from '@mui/icons-material/Search';
import { useAppSnackbar } from '../../context/SnackbarContext';

const NO_ESPECIFICADO = 'No especificado';
const GENDER_OPTIONS = ['Hombre', 'Mujer', NO_ESPECIFICADO];

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(3),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1.5, 3),
  },
  '& .MuiDialog-paper': {
    borderRadius: '16px',
  },
}));

interface PersonDraft {
    id: string
    name: string
    rut: string
    age: string
    gender: string
    personaID?: string
}

export interface DialogCreateAttendedProps { 
    stateOpen : [ boolean, React.Dispatch<React.SetStateAction<boolean>> ]
    stateOnSelectLocationMap : [ boolean, React.Dispatch<React.SetStateAction<boolean>> ]
    stateLocationMethod : [ LocationMethod, React.Dispatch<React.SetStateAction<LocationMethod>> ]
    stateAttended : [ TUserRegister, React.Dispatch<React.SetStateAction<TUserRegister>> ]
    statePeople : [ PersonDraft[], React.Dispatch<React.SetStateAction<PersonDraft[]>> ]
    stateCoords : [ number[], React.Dispatch<React.SetStateAction<number[]>> ]
    stateComment : [ string, React.Dispatch<React.SetStateAction<string>> ]
    location : Position
}

function createPersonDraft(seed?: Partial<TUserRegister>): PersonDraft {
    return {
        id: `${Date.now()}-${Math.random()}`,
        name: seed?.name && seed.name !== NO_ESPECIFICADO ? seed.name : '',
        rut: '',
        age: seed?.age && seed.age > 0 ? String(seed.age) : '',
        gender: normalizeGender(seed?.gender),
    }
}

function normalizeGender(gender?: string) {
    const normalized = (gender || '').trim().toLowerCase();
    if (normalized === 'hombre') return 'Hombre';
    if (normalized === 'mujer') return 'Mujer';
    return NO_ESPECIFICADO;
}

function normalizeRut(rut: string) {
    return rut.replace(/\s+/g, '').toUpperCase();
}

function isValidRutFormat(rut: string) {
    if (!rut) return true;
    return /^(?:\d{1,2}\.\d{3}\.\d{3}-[\dkK]|\d{7,8}-[\dkK])$/.test(normalizeRut(rut));
}

export default function DialogCreateAttended({ stateAttended, stateOpen, stateOnSelectLocationMap, location, stateLocationMethod, statePeople, stateCoords, stateComment } : DialogCreateAttendedProps) {

    const authorID = useProfile().data?.id
    const { routeId } = useSessionStore()
    const [ open, setOpen ] = stateOpen
    const [ onSelectLocationMap, setOnSelectLocationMap ] = stateOnSelectLocationMap
    const [ attendedP, setAttendedP ] = stateAttended
    const [ people, setPeople ] = statePeople
    const [ coords, setCoords ] = stateCoords
    const [ comment, setComment ] = stateComment

    const theme = useTheme();
    const fullScreen = !useMediaQuery(theme.breakpoints.up('sm'));
    const [ locationMethod, setLocationMethod ] = stateLocationMethod
    const [ createButtonDisable, setCreateButtonDisable ] = useState(true)
    const [ error, setError ] = useState<string | undefined>()
    const [ searchOpen, setSearchOpen ] = useState(false)
    const [ searchQuery, setSearchQuery ] = useState('')
    const [ searchResults, setSearchResults ] = useState<Persona[]>([])
    const [ searchTargetPersonId, setSearchTargetPersonId ] = useState<string | null>(null)
    const { showSnackbar } = useAppSnackbar()

    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

    const handleSearchInput = (query: string) => {
        setSearchQuery(query)
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
        if (query.length < 2) {
            setSearchResults([])
            return
        }
        searchTimerRef.current = setTimeout(async () => {
            try {
                const results = await PersonaService.Search(query)
                setSearchResults(results)
            } catch (error) {
                console.error('Error al buscar personas', error)
                setSearchResults([])
            }
        }, 300)
    }

    const handleOpenSearch = (personId: string) => {
        setSearchTargetPersonId(personId)
        setSearchQuery('')
        setSearchResults([])
        setSearchOpen(true)
    }

    const handleSelectPersona = (persona: Persona) => {
        if (!searchTargetPersonId) return
        setPeople(prev => prev.map(p =>
            p.id === searchTargetPersonId
                ? {
                    ...p,
                    name: persona.nombre,
                    rut: persona.rut || '',
                    age: persona.edad > 0 ? String(persona.edad) : '',
                    gender: normalizeGender(persona.genero),
                    personaID: persona.id,
                }
                : p
        ))
        setSearchOpen(false)
        setSearchTargetPersonId(null)
    }

    const { mutate, isError, isSuccess, isPending, isIdle, reset } = useCreateHelpPoint()
    const { refetch } = useHelpPoints()
    
    const prevOnSelectLocationMapRef = useRef(onSelectLocationMap)
    const hasLocationRef = useRef(false)
    const isSelectingLocationRef = useRef(false)

    useEffect(() => {
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
            showSnackbar((e as Error).message, 'error')
        }
    }

    const handleSelectLocationMap = () => {
        setLocationMethod(LocationMethod.Map)
        setOnSelectLocationMap(true)
    }

    useEffect(() => {
        const wasSelecting = prevOnSelectLocationMapRef.current
        const nowSelecting = onSelectLocationMap
        
        if (wasSelecting && !nowSelecting) {
            hasLocationRef.current = true
        }
        
        prevOnSelectLocationMapRef.current = onSelectLocationMap
    }, [onSelectLocationMap])

    useEffect(() => {
        if(location.latitude != 0) {
            setLocationMethod(LocationMethod.Map)
            setCoords([location.latitude, location.longitude])
        }
    }, [location])

    useEffect(() => {
        if(coords.length === 2) {
            setCreateButtonDisable(false)
        }
    }, [coords])

    useEffect(() => {
        if(primaryPerson) {
            setAttendedP(prev => ({
                ...prev,
                name: primaryPerson.name || NO_ESPECIFICADO,
                age: primaryPerson.age ? Number(primaryPerson.age) : -1,
                gender: normalizeGender(primaryPerson.gender),
            }))
        }
    }, [primaryPerson, setAttendedP])

    const clearStates = () => {
        reset()
        setCreateButtonDisable(true)
        setLocationMethod(LocationMethod.None)
        setError(undefined)
        setComment('')
        setPeople([createPersonDraft()])
    }

    const handleClose = () => {
        if (isSelectingLocationRef.current) {
            return
        }
        
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
            showSnackbar('No hay coordenadas registradas', 'warning')
            return
        }
        if(!authorID) {
            showSnackbar('Ha ocurrido un error inesperado', 'error')
            return
        }

        const validPeople = people
            .filter(person => person.name.trim().length > 0)
            .map(person => ({
                name: person.name.trim(),
                rut: normalizeRut(person.rut),
                age: person.age.trim(),
                gender: normalizeGender(person.gender),
                personaID: person.personaID,
            }))

        if(validPeople.length === 0) {
            showSnackbar('Debes agregar al menos una persona con nombre', 'warning')
            return
        }

        if(validPeople.some(person => person.rut.length > 0 && !isValidRutFormat(person.rut))) {
            showSnackbar('El formato del RUT no es válido', 'warning')
            return
        }

        mutate({
            routeID: routeId!,
            coords,
            comment,
            people: validPeople.map(person => ({
                name: person.name,
                rut: person.rut,
                age: person.age.length > 0 ? Number(person.age) : -1,
                gender: person.gender,
                personaID: person.personaID,
            })) as HelpedPerson[],
            peopleHelped: validPeople[0]
                ? {
                    name: validPeople[0].name,
                    rut: validPeople[0].rut,
                    age: validPeople[0].age.length > 0 ? Number(validPeople[0].age) : -1,
                    gender: validPeople[0].gender,
                    personaID: validPeople[0].personaID,
                }
                : undefined,
            authorID: authorID,
            disabled: false,
        })
    }

    useEffect(() => {
        if(isSuccess) {
            refetch()
            setAttendedP({ name: NO_ESPECIFICADO, gender: NO_ESPECIFICADO, age: -1 })
            setTimeout(() => {
                handleClose()
            }, 2000)
        }
    }, [isSuccess])

    return (
        <>
        <BootstrapDialog 
            fullScreen={fullScreen}
            fullWidth
            maxWidth="md"
            open={open && !onSelectLocationMap}
            onClose={handleClose}
            aria-labelledby='attended-titulo'
            keepMounted
        >
            <DialogTitle component="div" sx={{ m: 0, p: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip 
                    label={isIdle ? 'Nuevo' : isPending ? 'Enviando...' : isSuccess ? 'Completado' : 'Error'} 
                    size="small"
                    color={isSuccess ? 'success' : isError ? 'error' : isPending ? 'warning' : 'default'}
                    variant="outlined"
                    sx={{ fontWeight: 600, fontSize: 11 }}
                />
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                    {
                        isIdle ? 'Crear un punto de registro' : 
                        isPending ? 'Cargando...' :
                        isSuccess ? 'Punto guardado' :
                        isError ? 'Ha ocurrido un error' :
                        'Error desconocido'
                    }
                </Typography>
            </DialogTitle>
            <CloseDialogButton handleClose={handleClose} />

            <DialogContent dividers>
                { isIdle ?
                    <div className='flex flex-col gap-6 py-2'>
                        <div className='flex flex-col gap-3'>
                            <div className='flex items-center justify-between'>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Personas vistas</Typography>
                                <Button startIcon={<AddIcon />} variant='outlined' onClick={addPerson} size="small" sx={{ borderRadius: '8px', textTransform: 'none' }}>
                                    Agregar persona
                                </Button>
                            </div>
                            <div className='flex flex-col gap-4'>
                                {people.map((person, index) => (
                                    <Paper key={person.id} variant="outlined" sx={{ p: 2, borderRadius: '10px', bgcolor: '#fafafa' }}>
                                        <div className='flex items-center justify-between mb-2'>
                                            <Chip label={`Persona ${index + 1}`} size="small" variant="outlined" sx={{ fontWeight: 500 }} />
                                            {people.length > 1 ? (
                                                <IconButton color='error' size="small" onClick={() => { removePerson(person.id); }}>
                                                    <DeleteOutlineIcon fontSize='small' />
                                                </IconButton>
                                            ) : null}
                                        </div>
                                        <div className='flex flex-col gap-3 md:flex-row'>
                                            <TextField
                                                fullWidth
                                                id={`name-${person.id}`}
                                                variant='outlined'
                                                size="small"
                                                value={person.name}
                                                onChange={(e) => { updatePerson(person.id, 'name', e.target.value); }}
                                                label='Nombre *'
                                                slotProps={{ inputLabel: { shrink: true } }}
                                            />
                                            <TextField
                                                fullWidth
                                                id={`rut-${person.id}`}
                                                variant='outlined'
                                                size="small"
                                                value={person.rut}
                                                onChange={(e) => { updatePerson(person.id, 'rut', e.target.value); }}
                                                label='RUT'
                                                placeholder='12.345.678-9'
                                                slotProps={{ inputLabel: { shrink: true } }}
                                            />
                                            <TextField
                                                fullWidth
                                                id={`age-${person.id}`}
                                                variant='outlined'
                                                size="small"
                                                onChange={(e) => { updatePerson(person.id, 'age', e.target.value); }}
                                                label='Edad'
                                                type='number'
                                                value={person.age}
                                                slotProps={{ inputLabel: { shrink: true } }}
                                            />
                                            <TextField
                                                fullWidth
                                                select
                                                id={`gender-${person.id}`}
                                                variant='outlined'
                                                size="small"
                                                value={person.gender}
                                                onChange={(e) => { updatePerson(person.id, 'gender', e.target.value); }}
                                                label='Género'
                                                slotProps={{ inputLabel: { shrink: true } }}
                                            >
                                                {GENDER_OPTIONS.map(option => (
                                                    <MenuItem key={option} value={option}>{option}</MenuItem>
                                                ))}
                                            </TextField>
                                        </div>
                                        <div className='mt-2'>
                                            <Button
                                                size="small"
                                                variant="text"
                                                startIcon={<SearchIcon />}
                                                onClick={() => { handleOpenSearch(person.id); }}
                                                sx={{ borderRadius: '8px', textTransform: 'none', fontSize: 12 }}
                                            >
                                                {person.personaID ? 'Cambiar persona existente' : 'Buscar persona existente'}
                                            </Button>
                                            {person.personaID && (
                                                <Chip
                                                    label="Vinculada"
                                                    size="small"
                                                    color="success"
                                                    variant="outlined"
                                                    sx={{ ml: 1, fontSize: 11 }}
                                                />
                                            )}
                                        </div>
                                    </Paper>
                                ))}
                            </div>
                        </div>

                        <TextField
                            fullWidth
                            id='comment'
                            variant='outlined'
                            value={comment}
                            onChange={(e) => { setComment(e.target.value); }}
                            label='Comentario del punto'
                            multiline
                            minRows={3}
                            size="small"
                            slotProps={{ inputLabel: { shrink: true } }}
                        />

                        <Divider />

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
                            <Alert severity={error ? 'error' : coords.length !== 0 ? 'success' : 'warning'} sx={{ borderRadius: '8px' }}> 
                                {error ? error : coords.length !== 0 ? 'Ubicación completada' : 'Selecciona una opción para establecer la ubicación'}
                            </Alert>
                        </div>
                    </div>
                    :
                    isPending ? 
                    <div className='flex grow items-center justify-center py-8'>
                        <CircularProgress size={60} />
                    </div>
                    :
                    <Alert sx={{ borderRadius: '8px' }} variant='outlined' severity={ isSuccess ? 'success' : isError ? 'error' : 'info'}>
                            {isSuccess ? 'Se creó el punto exitosamente' : isError ? 'Hubo un error al intentar crear el punto' : 'Error desconocido'}
                    </Alert>
                }
                
            </DialogContent>
            <DialogActions>
                { isSuccess ?
                    <></>
                    :
                    <>
                        <Button variant='contained' disabled={createButtonDisable} onClick={handleSubmit} sx={{ borderRadius: '8px', textTransform: 'none' }}>
                            Crear Punto
                        </Button>
                        <Button variant='outlined' color='error' onClick={handleClose} sx={{ borderRadius: '8px', textTransform: 'none' }}>
                            Cancelar
                        </Button>
                    </>
                }
            </DialogActions>
        </BootstrapDialog>

            <Dialog open={searchOpen} onClose={() => { setSearchOpen(false); }} fullWidth maxWidth="sm">
                <DialogTitle sx={{ fontWeight: 600, fontSize: '1rem' }}>Buscar persona existente</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        size="small"
                        autoFocus
                        placeholder="Escribe nombre o RUT..."
                        value={searchQuery}
                        onChange={(e) => { handleSearchInput(e.target.value); }}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start"><SearchIcon /></InputAdornment>
                                )
                            }
                        }}
                        sx={{ mb: 2 }}
                    />
                    {searchResults.length > 0 ? (
                        <List>
                            {searchResults.map(persona => (
                                <ListItemButton
                                    key={persona.id}
                                    onClick={() => { handleSelectPersona(persona); }}
                                    sx={{ borderRadius: '8px' }}
                                >
                                    <ListItemAvatar>
                                        <Avatar>{persona.nombre.charAt(0)}</Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={persona.nombre}
                                        secondary={`RUT: ${persona.rut || 'Sin RUT'} | Edad: ${persona.edad > 0 ? persona.edad : 'Sin especificar'}`}
                                    />
                                </ListItemButton>
                            ))}
                        </List>
                    ) : searchQuery.length >= 2 ? (
                        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>Sin resultados</Typography>
                    ) : (
                        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>Escribe al menos 2 caracteres para buscar</Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button variant="outlined" onClick={() => { setSearchOpen(false); }} sx={{ borderRadius: '8px', textTransform: 'none' }}>Cancelar</Button>
                </DialogActions>
            </Dialog>
        </>
    )    
};

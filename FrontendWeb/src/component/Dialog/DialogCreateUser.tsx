import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { FormControl, FormHelperText, Input, InputLabel, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useRegister } from '../../api/hooks/UserHooks';
import { IUser } from '../../api/models/User';
import ComboBox from '../Button/ComboBox';
import { useInstitutions } from '../../api/hooks/InstitutionHooks';
import { Role } from '../../Enums/Role';


const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
    justifyContent: 'center',
  },
  '& .MuiPaper-root': {
    width: '620px',
    height: '470px', 
    maxWidth: 'none',
  }
}));

type UserRegister = Pick<IUser, 
    'name'          | 
    'email'         | 
    'password'      | 
    'phone'         | 
    'institutionID' |
    'role'
>

type UserRegisterError = Omit<{
    [k in keyof UserRegister]: string
}, 'password'>



export default function DialogCreateUser({ open, setOpen } : { open : boolean, setOpen: (ar : boolean) => void}) {

    const [ user, setUser ] = useState<UserRegister>({
        name : '',
        email : '',
        password : '',
        phone : '',
        institutionID : '',
        role : ''
    })

    const [ inputError, setInputError ] = useState<UserRegisterError>({
        name : '',
        email : '',
        phone : '',
        institutionID : '',
        role: ''
    })


    const [ loading, setLoading ] = useState(false)
    const { isError, isSuccess, mutate, error, data, reset } = useRegister()
    const institutions = useInstitutions().data 

    const handleInputChange = (input: keyof Omit<UserRegister, "password">) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setUser({ ...user, [input]: e.target.value });
        setInputError({ ...inputError, [input]: (e.target.value.trim() === '' ? `Campo ${input} es obligatorio` : '')});
    };


    useEffect(() => {
        if(data || isSuccess) {
            
            setTimeout(() => {
                handleOnClose()
            }, 1000)
        }
    }, [data, isSuccess])

    const validateForm = () => {
        if(user.name === '') {
            setInputError({... inputError, name : 'Debe ingresar un nombre al usuario'})
            return false
        }
        if(user.email === '') {
            setInputError({...inputError, email: 'Debe ingresar el correo del usuario'})
            return false
        }
        if(user.phone === '') {
            setInputError({...inputError, phone : 'Debe ingresar el teléfono del usuario'})
            return false
        }
        if(user.institutionID === '') {
            setInputError({...inputError, institutionID : 'Debe seleccionar una institución'})
            return false 
        }
        if(user.role === '') {
            setInputError({...inputError, role : 'Debes seleccionar un rol para el usuario' })
            return false
        }
        setInputError({name: '', email: '', institutionID:'', role: '', phone: ''})
        return true
    }

    const handleUserRegister = () => {
        setLoading(true)
        if(!validateForm()) return
        mutate({
            ...user,
            password: Math.random().toString(36).slice(-8)
        })
    }

    const handleOnClose = () => {
        setLoading(false)
        setInputError({name :'', email : '', phone : '', institutionID : '', role: ''})
        reset()
        setOpen(false)
    }

    return (
        <>
            <BootstrapDialog 
                fullWidth
                open={open} 
                onClose={handleOnClose}
                aria-labelledby='aviso-titulo'
            >
                <DialogTitle className='m-0 p-2' id="aviso-titulo">
                    Agrega nuevo usuario
                </DialogTitle>
                <IconButton
                    aria-label="close"
                    onClick={handleOnClose}
                    sx={(theme) => ({
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: theme.palette.grey[500],
                    })}
                    >
                    <CloseIcon />
                </IconButton>
                <DialogContent>
                    <div className="flex flex-col gap-6">
                        <div className='flex flex-col gap-6 px-2'>
                            <FormControl variant="standard" required error={inputError.name !== ''} className='rounded-b-sm border border-gray-600'>
                                <InputLabel htmlFor="nombres-input" shrink>Nombre Completo</InputLabel>
                                <Input onBlur={handleInputChange('name')} onChange={handleInputChange('name')} id="nombres-input" placeholder="Ingresa el Nombre Completo" />
                                <FormHelperText error={inputError.name !== ''}>{inputError.name}</FormHelperText>
                            </FormControl>
                             <FormControl variant="standard" required error={inputError.email !== ''} className='rounded-b-sm border border-gray-600'>
                                <InputLabel htmlFor="email-input" shrink>Correo Electrónico</InputLabel>
                                <Input onBlur={handleInputChange('email')} onChange={handleInputChange('email')} id="email-input" placeholder="Ingresa el Correo Electrónico" />
                                <FormHelperText error={inputError.email !== ''}>{inputError.email}</FormHelperText>
                            </FormControl>
                            <FormControl variant="standard" required error={inputError.phone !== ''} className='rounded-b-sm border border-gray-600'>
                                <InputLabel htmlFor="phone-input" shrink>Teléfono</InputLabel>
                                <Input onBlur={handleInputChange('phone')} onChange={handleInputChange('phone')} id="phone-input" placeholder="Ingresa el Número de Teléfono" />
                                <FormHelperText error={inputError.phone !== ''}>{inputError.phone}</FormHelperText>
                            </FormControl>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <FormControl
                                        variant="standard"
                                        required
                                        error={inputError.institutionID !== ''}
                                        fullWidth
                                    >
                                    <InputLabel variant='standard' htmlFor='institucion-input' shrink>Institución</InputLabel>
                                    <ComboBox
                                        fullWidth
                                        variant="standard"
                                        size="medium"
                                        label="Institución"
                                        options={institutions?.map(i => i.name) ?? []}
                                        onChange={(e, v) => {
                                            if (!institutions) return;
                                            const instName = v as string;
                                            const inst = institutions.find(v => v.name === instName);
                                            if (!inst) return;
                                            setUser({ ...user, institutionID: inst.id });
                                        }}
                                    />
                                    <FormHelperText error={inputError.institutionID !== ''}>{inputError.institutionID}</FormHelperText>
                                    </FormControl>
                                </div>

                                <div className="w-1/4">
                                    <FormControl required variant="standard" fullWidth>
                                        <InputLabel htmlFor='rol-input' shrink>Rol</InputLabel>
                                        <ComboBox
                                            fullWidth
                                            variant="standard"
                                            size="medium"
                                            label="Rol"
                                            options={Object.values(Role)}
                                            onChange={(e, v) => {
                                                const role = v as Role;
                                                console.log(role)
                                                if (!role) return;
                                                setUser({ ...user, role: role });
                                            }}
                                        />
                                    </FormControl>
                                    <FormHelperText error={inputError.role !== ''}>{inputError.role}</FormHelperText>
                                </div>
                            </div>

                        </div>
                        <div className='px-2'>
                            {<Typography className={isSuccess ? 'text-blue-600' : 'text-red-700'}>{isSuccess ? 'Se creo correctamente' : (error ? (error as any).error : '')}</Typography>}
                        </div>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button fullWidth size="large" onClick={handleUserRegister} variant='contained' loading={loading}>
                        Agregar Usuario
                    </Button>
                </DialogActions>
            </BootstrapDialog>
        </>
    )    
};

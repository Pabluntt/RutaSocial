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
import { useAdminCreateUser } from '../../api/hooks/UserHooks';
import { IUser } from '../../api/models/User';
import ComboBox from '../Button/ComboBox';
import { useInstitutions } from '../../api/hooks/InstitutionHooks';


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

type AdminCreateUser = Pick<IUser,
    'email' |
    'password' |
    'institutionID'
> & Partial<Pick<IUser,
    'name' |
    'phone'
>>

type AdminCreateUserError = {
    name: string
    email: string
    password: string
    phone: string
    institutionID: string
}



export default function DialogCreateUser({ open, setOpen } : { open : boolean, setOpen: (ar : boolean) => void}) {

    const [ user, setUser ] = useState<AdminCreateUser>({
        name : '',
        email : '',
        password : '',
        phone : '',
        institutionID : ''
    })

    const [ inputError, setInputError ] = useState<AdminCreateUserError>({
        name : '',
        email : '',
        password : '',
        phone : '',
        institutionID : ''
    })


    const [ loading, setLoading ] = useState(false)
    const { isSuccess, mutate, error, data, reset } = useAdminCreateUser()
    const institutions = useInstitutions().data 

    const handleInputChange = (input: keyof AdminCreateUser) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = e.target.value;
        setUser({ ...user, [input]: value });

        if (input === 'email' || input === 'password') {
            setInputError({ ...inputError, [input]: (value.trim() === '' ? `Campo ${input} es obligatorio` : '')});
        }
    };


    useEffect(() => {
        if(data || isSuccess) {
            
            setTimeout(() => {
                handleOnClose()
            }, 1000)
        }
    }, [data, isSuccess])

    const validateForm = () => {
        if(user.email.trim() === '') {
            setInputError({...inputError, email: 'Debe ingresar el correo del usuario'})
            return false
        }
        if(user.password.trim() === '') {
            setInputError({...inputError, password: 'Debe ingresar la contraseña del usuario'})
            return false
        }
        if(user.password.length < 8) {
            setInputError({...inputError, password: 'La contraseña debe tener al menos 8 caracteres'})
            return false
        }
        if(user.institutionID.trim() === '') {
            setInputError({...inputError, institutionID : 'Debe seleccionar una institución'})
            return false 
        }
        setInputError({name: '', email: '', password: '', institutionID:'', phone: ''})
        return true
    }

    const handleUserRegister = () => {
        setLoading(true)
        if(!validateForm()) return
        mutate({
            ...user,
            role: 'usuario'
        })
    }

    const handleOnClose = () => {
        setLoading(false)
        setInputError({name :'', email : '', password: '', phone : '', institutionID : ''})
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
                            <FormControl variant="standard" error={inputError.name !== ''} className='rounded-b-sm border border-gray-600'>
                                <InputLabel htmlFor="nombres-input" shrink>Nombre Completo</InputLabel>
                                <Input onBlur={handleInputChange('name')} onChange={handleInputChange('name')} id="nombres-input" placeholder="Ingresa el Nombre Completo" />
                                <FormHelperText error={inputError.name !== ''}>{inputError.name}</FormHelperText>
                            </FormControl>
                             <FormControl variant="standard" required error={inputError.email !== ''} className='rounded-b-sm border border-gray-600'>
                                <InputLabel htmlFor="email-input" shrink>Correo Electrónico</InputLabel>
                                <Input onBlur={handleInputChange('email')} onChange={handleInputChange('email')} id="email-input" placeholder="Ingresa el Correo Electrónico" />
                                <FormHelperText error={inputError.email !== ''}>{inputError.email}</FormHelperText>
                            </FormControl>
                            <FormControl variant="standard" required error={inputError.password !== ''} className='rounded-b-sm border border-gray-600'>
                                <InputLabel htmlFor="password-input" shrink>Contraseña</InputLabel>
                                <Input type="password" onBlur={handleInputChange('password')} onChange={handleInputChange('password')} id="password-input" placeholder="Ingresa la Contraseña" />
                                <FormHelperText error={inputError.password !== ''}>{inputError.password}</FormHelperText>
                            </FormControl>
                            <FormControl variant="standard" error={inputError.phone !== ''} className='rounded-b-sm border border-gray-600'>
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
                                    <FormControl variant="standard" fullWidth>
                                        <InputLabel htmlFor='rol-input' shrink>Rol</InputLabel>
                                        <Input disabled value="usuario" id="rol-input" />
                                    </FormControl>
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

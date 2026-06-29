import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Card, CircularProgress, Divider, FormControl, FormLabel, TextField, Typography } from "@mui/material";
import { isValidEmail } from "../../utils/verifyInput";
import { sxInput } from "../../style/sxInput";
import { useLogin } from "../../api/hooks/UserHooks";


export default function Login() {

    const navigate = useNavigate()

    const [ email, setEmail ] = useState<string>('')
    const [ emailError, setEmailError ] = useState<string>('')
    const [ password, setPassword ] = useState<string>('')
    const [ passwordError, setPasswordError ] = useState<string>('')
    const { mutate, error, isPending } = useLogin()

    const onSubmitForm = (e :React.FormEvent) => {
      e.preventDefault()

      let hasError = false

      if(email === '' || !isValidEmail(email)) {
        setEmailError('Ingresa un Email válido')
        hasError = true
      } else {
        setEmailError('')
      }

      if(password === '') {
        setPasswordError('Ingresa una Contraseña')
        hasError = true
      } else {
        setPasswordError('')
      }

      if (hasError) return
      mutate({ email, password }, {
        onSuccess: () => navigate(`${import.meta.env.VITE_BASE_URL}/calendario`, { replace: true })
      })
    }


    return (
      <Box className="flex w-full min-h-screen justify-center"
          sx={[
          (_) => ({
            '&::before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              zIndex: -1,
              inset: 0,
              backgroundImage:
                'radial-gradient(ellipse at 50% 50%, 	hsl(184, 100%, 95%), hsl(0, 0%, 100%))',
              backgroundRepeat: 'no-repeat',
            },
          })
        ]}
      >
        <div className="flex items-center justify-center w-full p-2">
          <form className="w-full max-w-3xl" onSubmit={onSubmitForm} noValidate>
              <Card variant='elevation' elevation={1} className="flex flex-col gap-6 rounded-2xl w-full p-4 sm:p-8 md:p-16">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-16">
                  <div className="flex flex-col items-start justify-start gap-6 w-full lg:w-90">
                    <Typography variant="h3" gutterBottom fontSize={{
                      xs : '1.8rem',
                      sm : '2.5rem'
                    }}>
                      Iniciar Sesión
                    </Typography>
                    <FormControl fullWidth>
                      <FormLabel htmlFor="email">Email</FormLabel>
                      <TextField
                        error={emailError !== ''}
                        helperText={emailError == '' ? " " : emailError}
                        id="email"
                        type="email"
                        name="email"
                        placeholder="Ingresa tu Correo"
                        autoComplete="email"
                        autoFocus
                        required
                        fullWidth
                        variant="outlined"
                        sx={sxInput}
                        onChange={(e) => setEmail(e.currentTarget.value)}                      
                      />
                    </FormControl>
                    <FormControl fullWidth>
                      <FormLabel htmlFor="password">Contraseña</FormLabel>
                      <TextField
                        error={passwordError !== ''}
                        helperText={passwordError === '' ? " " : passwordError}
                        id="password"
                        type="password"
                        name="password"
                        placeholder="Ingresa tu Contraseña"
                        autoComplete="password"
                        autoFocus
                        required
                        fullWidth
                        variant="outlined"
                        sx={sxInput}
                        slotProps={{
                          formHelperText : { 
                            sx : {
                              minHeight: '1.5em'  
                            }
                          }
                        }}
                        onChange={(e) => setPassword(e.currentTarget.value)}
                      />
                    </FormControl>
                    <Button type="submit" fullWidth variant="contained" disabled={isPending}
                      sx={{
                        color : 'white',
                        background : '#009BA5',
                        py: 1.5,
                      }}
                    >
                      {isPending ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Ingresar'}
                    </Button>
                    <Divider className="w-full" />
                    <Typography variant='body2' minHeight={"1.5em"} alignSelf={'center'} textAlign={'center'} color="error">
                      {error ? (typeof error === 'string' ? error : (error as any).error || 'Error al iniciar sesión') : null}
                    </Typography>
                
                    {/*<Typography alignSelf={'center'}
                      component={'a'}
                      href="/change-password"
                      sx={{
                        textDecoration : 'underline',
                      }}
                      fontSize={{
                        xs : '0.75rem',
                        sm : '0.75rem',
                        md : '1rem'
                      }
                    >
                      ¿Se te olvidó la contraseña?
                    </Typography>*/}
                  </div>
                  <div className="flex w-full lg:w-1/2 flex-col items-center justify-center">
                      <img src="logoHdc.png" loading="lazy" className="max-w-full h-auto"/>
                      <Typography variant='subtitle2' textAlign={'center'} fontSize={{
                        xs : '0.65rem',
                        sm : '1rem',
                      }}>
                        Hecho con ❤️ por <b>YepCoding</b>
                      </Typography>
                  </div>
                </div>
              </Card>
          </form>
        </div>
      </Box>
    )   
}

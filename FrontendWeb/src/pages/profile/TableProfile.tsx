import { Button, Divider, Paper, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import DialogChangePassword from "../../component/Dialog/DialogChangePassword";
import { TResumenActividad } from ".";
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import RouteIcon from '@mui/icons-material/Route';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import ResumeItem from "./ResumeItem";
import { useAuth } from "../../context/AuthContext";
import { IUser } from "../../api/models/User";
import { format } from "date-fns";
import { useUserParticipation } from "../../api/hooks/UserHooks";
import { useRoutesByUser } from "../../api/hooks/RouteHooks";
import compareSort from "../../utils/compareDate";
import { es } from "date-fns/locale";

type TableProfileProps = {
     stateResumenActividad : [ TResumenActividad, React.Dispatch<React.SetStateAction<TResumenActividad>> ]
     stateUser : [IUser , React.Dispatch<React.SetStateAction<IUser | undefined>> ]
     stateHasChanges : [ boolean, React.Dispatch<React.SetStateAction<boolean>>]
} 

export default function TableProfile({ stateUser, stateHasChanges, stateResumenActividad } : TableProfileProps ) {

     const [ resumen, setResumenActividad ] = stateResumenActividad
     const { role, loading } = useAuth()
     const [ open, setOpen ] = useState(false)
     const [ user, setUser ] = stateUser
     const [ , setHasChange ] = stateHasChanges
     const useQueryRoutesByUser = useRoutesByUser(user.id, true)

     useEffect(() => { // Calcular total rutas completadas & última fecha ruta
          console.log(user.id)
          if(useQueryRoutesByUser.data) {
               const routes = useQueryRoutesByUser.data.sort((a, b) => compareSort(a, b))
               setResumenActividad({...resumen, 
                    amountCompletedRoutes : routes.length, 
                    lastRouteDate : routes.length != 0 ? format(routes[0].dateCreated, "d 'de' MMMM 'de' yyyy ", { locale: es}) : 'Sin realizar aún'
               })
          } 
     
     }, [useQueryRoutesByUser.data])

     const helpPoints = useUserParticipation(user.id).data?.total_helpingpoints

     const onChangeName = (name : string) => {
          setHasChange(true)
          setUser({ ...user, name }) 
     }

     const onChangePhone = (phone : string) => {
          setHasChange(true)
          setUser({ ...user, phone })
     }

     return (
          <div className="flex flex-col grow w-full items-center justify-center">
               <div className="flex flex-col w-full md:w-3/4 lg:w-1/2 grow my-6 gap-1">
                    <Typography variant="h6">
                         Acerca de ti
                    </Typography>
                    <Paper elevation={2} className="flex items-center justify-center p-2 sm:p-2 md:p-3 lg:p-5 flex-col gap-3 border border-neutral-300">
                         <TextField 
                              variant="standard"
                              margin="dense"
                              fullWidth
                              label="Nombre"
                              id="name-input"
                              placeholder="Ingresa tu Nombre"
                              color={user.name == '' ? 'warning' : 'primary'}
                              value={user.name}
                              size="small"
                              onChange={(event) => {onChangeName(event.target.value)}}
                              onFocus={(e) => {e.target.select()}}
                              focused={user.name == ''}
                         />
                         <TextField 
                              fullWidth
                              margin="dense"
                              variant="standard"
                              label="Teléfono"
                              id="phone-input"
                              placeholder="Ingresa tu Número de Teléfono"
                              color={user.phone == '' ? 'warning' : 'primary'}
                              value={user.phone}
                              size="small"
                              onChange={((event) => (onChangePhone(event.target.value)))}
                              onFocus={(e) => (e.target.select())}
                              focused={user.phone == ''}
                         />
                         <TextField 
                              fullWidth
                              margin="dense"
                              variant="standard"
                              label="Email"
                              id="email-input"
                              value={user.email}
                              disabled
                              size="small"
                         />
                         <TextField
                              fullWidth
                              margin="dense"
                              variant="standard"
                              label='Rol'
                              id="role-input"
                              value={role}
                              disabled
                              size="small"
                         />
                         <div className="flex flex-col w-full justify-start items-start gap-1">
                              <TextField
                                   fullWidth
                                   margin="dense"
                                   variant="standard"
                                   label="Contraseña"
                                   id="password-input"
                                   value={'------'}
                                   type="password"
                                   disabled
                                   size="small"
                              />
                              <Button size='small' variant="text" onClick={() => {setOpen(true)}}>
                                   Cambiar Contraseña
                              </Button>
                         </div>
                         <DialogChangePassword open={open} setOpen={setOpen} email={user.email} />
                    </Paper>
               </div>
               <div className="flex flex-col w-full md:w-3/4 lg:w-1/2 grow my-1 gap-1">
                    <Typography variant="h6">
                         Resumen de tu Actividad
                    </Typography>
                    <Paper elevation={2} className="flex items-start justify-start py-4 flex-col gap-4 border border-neutral-300">
                         <ResumeItem 
                              icon={<EventAvailableIcon color="action" />} 
                              activityDescription={<Typography variant="button" color="textSecondary">Última ruta realizada</Typography>}
                              activityValue={<Typography variant="button" color="info">{resumen.lastRouteDate}</Typography>}
                         />
                         <Divider className="w-full" />
                         <ResumeItem
                              icon={<RouteIcon color='secondary' />}
                              activityDescription={<Typography variant='button' color='textSecondary'>Rutas completadas</Typography>}
                              activityValue={<Typography variant="body1" color='info'>{resumen.amountCompletedRoutes}</Typography>}
                         />
                         <Divider  className="w-full" /> 
                         <ResumeItem
                              icon={<QuestionAnswerIcon color="info" />}
                              activityDescription={<Typography variant='button' color='textSecondary'>Puntos de ayuda registrados</Typography>}
                              activityValue={<Typography variant="body1" color='info'>{helpPoints}</Typography>}
                         />  
                         <Divider className="w-full" />   
                         <ResumeItem
                              icon={<HowToRegIcon color="success" />}
                              activityDescription={<Typography variant='button' color='textSecondary'>Miembro desde</Typography>}
                              activityValue={<Typography variant="body1" color='info'>{format(user.dateRegister, 'dd-MM-yyyy')}</Typography>}
                         />                                              
                    </Paper>
               </div>
          </div>
    )
};

import { Button, IconButton, InputBase, Paper, Typography, useMediaQuery, useTheme, Alert } from "@mui/material";
import CustomDrawer from "../../../component/CustomDrawer";
import TableUser from "../../../component/TableUser";
import SearchIcon from '@mui/icons-material/Search';
import DrawerList from "../../../component/DrawerList";
import { useEffect, useState } from "react";
import DialogCreateUser from "../../../component/Dialog/DialogCreateUser";
import Sidebar from "../../../component/Sidebar";
import { IUser } from "../../../api/models/User";
import { useUsers } from "../../../api/hooks/UserHooks";
import DialogManageInstitutions from "../../../component/Dialog/DialogManageInstitutions";
import { useInstitutions } from "../../../api/hooks/InstitutionHooks";
import { Institution } from "../../../api/models/Institution";
import { useAuth } from "../../../context/AuthContext";
import { Role } from "../../../Enums/Role";


export default function Usuarios() {

    const { role } = useAuth()
    const [ users, setUsers ] = useState<IUser[]>([])
    const [ institutions, setInstitutions ] = useState<Institution[]>([])
    const { isError, data, isPending } = useUsers()
    const { data: institutionData, isPending: isInstitutionPending } = useInstitutions()

    useEffect(() => {
        if(data) {
            setUsers(data)
        }
    }, [data])

    useEffect(() => {
        if(institutionData) {
            setInstitutions(institutionData)
        }
    }, [institutionData])


    const [ prefix, setPrefix ] = useState<string>('')   
    const [ open, setOpen ] = useState(false) 
    const [ openManageInstitutions, setOpenManageInstitutions ] = useState(false)
    const theme = useTheme();
    const computerDevice = useMediaQuery(theme.breakpoints.up('sm'));

    // Verificar si el usuario está autenticado
    if(!role || (role !== Role.admin && role !== Role.volunteer)) {
        return (
            <div className={"flex h-screen overflow-hidden " + (computerDevice ? 'flex-row' : 'flex-col')}>
                { computerDevice ? 
                    <div className="sticky top-0 self-start flex-shrink-0 z-10">
                        <Sidebar />
                    </div>    
                    :
                    <div className="flex flex-row bg-gray-100">
                        <CustomDrawer DrawerList={DrawerList} />
                        <p className="flex text-2xl text-center font-semibold p-3 items-center">Gestión Usuarios</p>
                    </div>
                }
                <div className="flex w-full h-full items-center justify-center overflow-y-auto">
                    <Alert severity="error">
                        <Typography variant="h6">Acceso Denegado</Typography>
                        <Typography>No tienes permiso para acceder a esta página.</Typography>
                    </Alert>
                </div>
            </div>
        )
    }

    return (
        <div className={"flex h-screen overflow-hidden " + (computerDevice ? 'flex-row' : 'flex-col')}>
            { computerDevice ? 
                <div className="sticky top-0 self-start flex-shrink-0 z-10">
                    <Sidebar />
                </div>    
                :
                <div className="flex flex-row bg-gray-100">
                    <CustomDrawer DrawerList={DrawerList} />
                    <p className="flex text-2xl text-center font-semibold p-3 items-center">Gestión Usuarios</p>
                </div>

            }
            <div className="flex w-full h-full flex-col justify-start gap-5 sm:gap-10 p-3 sm:p-5 bg-gray-100 max-w-full overflow-y-auto">
                { computerDevice ? 
                    <div>
                        <Typography variant="h5">Gestión de Usuarios</Typography>
                    </div>
                    :
                    <></>
                }
                <div className="flex flex-col gap-5 w-full">
                    <div className={"flex gap-3 sm:gap-5 " + (computerDevice ? "flex-row " : "flex-col" )}>
                        <Paper
                            component="form"
                            className={"px-0.5 py-1 flex items-center " + (computerDevice ? 'w-100' : 'grow')}
                        >
                            <InputBase
                                fullWidth
                                sx={{ ml: 1, flex: 1 }}
                                placeholder="Busca un usuario por nombre"
                                inputProps={{ 'aria-label': 'Busca un usuario' }}
                                onChange={(e)=> {setPrefix(e.target.value)}}
                            />
                            <IconButton type="button" sx={{ p: '10px' }} aria-label="search" disabled>
                                <SearchIcon />
                            </IconButton>
                        </Paper>
                        <div className={"flex gap-2 " + (computerDevice ? '' : 'flex-wrap')}>
                            {role === Role.admin && (
                            <Button size="small" variant="contained" onClick={()=>{setOpen(true)}}>
                                Agregar Usuario
                            </Button>
                        )}
                            {role === Role.admin && (
                                <Button size="small" variant="contained" onClick={() => {setOpenManageInstitutions(true)}}>
                                    Editar instituciones
                                </Button>
                            )}
                        </div>
                    </div>
                    { isPending || isInstitutionPending ? 
                        <div className="flex items-center justify-center h-96">
                            <div className="text-center">
                                <Typography variant="body1" sx={{ mb: 2 }}>
                                    {isPending ? 'Cargando usuarios...' : 'Cargando instituciones...'}
                                </Typography>
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                            </div>
                        </div>
                        : 
                        isError ? 
                        <div className="flex items-center justify-center h-96">
                            <Typography color="error" variant="h6">
                                Error al cargar usuarios. Intente recargar la página.
                            </Typography>
                        </div>
                        :
                        <TableUser users={users} setUsers={setUsers} prefixSearch={prefix} institutions={institutions} setInstitutions={setInstitutions} isAdmin={role === Role.admin}/>
                    }
                </div>
            </div>
            <DialogCreateUser
                open={open}
                setOpen={setOpen}
                onCreated={(createdUser) => {
                    setUsers((current) => current.some((user) => user.id === createdUser.id) ? current : [...current, createdUser])
                }}
            />
            <DialogManageInstitutions
                open={openManageInstitutions}
                setOpen={setOpenManageInstitutions}
                institutions={institutions}
                setInstitutions={setInstitutions}
                users={users}
                setUsers={setUsers}
            />
        </div>
    )
};

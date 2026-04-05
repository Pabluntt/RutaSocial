import { Button, IconButton, InputBase, Paper, Tooltip, Typography, useMediaQuery, useTheme } from "@mui/material";
import CustomDrawer from "../../../component/CustomDrawer";
import TableUser from "../../../component/TableUser";
import SearchIcon from '@mui/icons-material/Search';
import DrawerList from "../../../component/DrawerList";
import { useEffect, useState } from "react";
import useSessionStore from "../../../stores/useSessionStore";
import DialogCreateUser from "../../../component/Dialog/DialogCreateUser";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import Sidebar from "../../../component/Sidebar";
import { IUser } from "../../../api/models/User";
import { useUsers } from "../../../api/hooks/UserHooks";
import DialogCreateInstitution from "../../../component/Dialog/DialogCreateInstitution";
import { useInstitutions } from "../../../api/hooks/InstitutionHooks";
import { Institution } from "../../../api/models/Institution";


export default function Usuarios() {


    const [ users, setUsers ] = useState<IUser[]>([])
    const [ institutions, setInstitutions ] = useState<Institution[]>([])
    const { accessToken } = useSessionStore()
    const {isError, isSuccess, data} = useUsers()
    const useQuery = useInstitutions()

    useEffect(() => {
        if(data) {
            setUsers(data)
        }
    }, [data])

    useEffect(() => {
        if(useQuery.data) {
            setInstitutions(useQuery.data)
        }
    }, [useQuery.data])


    const [ prefix, setPrefix ] = useState<string>('')   
    const [ open, setOpen ] = useState(false) 
    const [ openAddInstitution, setOpenAddInstitution ] = useState(false)

    const handleExport = async () => {
        fetch(`${import.meta.env.VITE_URL_BACKEND}/export-data/people-helped`, {
            headers: {
                'Authorization' : `Bearer ${accessToken}`
            }
        })
        .then((response) => response.blob())
        .then((blob) => {
            var _url = window.URL.createObjectURL(blob)
            const a = document.createElement('a');
            a.href = _url;
            a.download = 'personas_ayudadas.xlsx';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(_url);
        }).catch((err) => {
            console.log(err)
        })
    }
    const theme = useTheme();
    const computerDevice = useMediaQuery(theme.breakpoints.up('sm'));

    return (
        <div className={"flex grow " + (computerDevice ? 'flex-row' : 'flex-col')}>
            { computerDevice ? 
                <div className="flex z-10">
                    <Sidebar />
                </div>    
                :
                <div className="flex flex-row bg-gray-100">
                    <CustomDrawer DrawerList={DrawerList} />
                    <p className="flex text-2xl text-center font-semibold p-3 items-center">Gestión Usuarios</p>
                </div>

            }
            <div className="flex w-full h-full flex-col justify-start gap-10 p-5 bg-gray-100">
                { computerDevice ? 
                    <div>
                        <Typography variant="h5">Gestión de Usuarios</Typography>
                    </div>
                    :
                    <></>
                }
                <div className="flex flex-col gap-5 min-w-11/12">
                    <div className={"flex gap-5 " + (computerDevice ? "flex-row " : "flex-col" )}>
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
                        <Button size="small" variant="contained" onClick={()=>{setOpen(true)}}>
                            Agregar Usuario
                        </Button> 
                        <Button size="small" variant="contained" onClick={() => {setOpenAddInstitution(true)}}>
                            Agregar Institución    
                        </Button> 
                        <Tooltip title={'exportar datos'}>
                            <Button color='info' variant="contained" onClick={handleExport}>
                                <FileDownloadIcon fontSize="large" />
                            </Button>    
                        </Tooltip>
                    </div>
                    { isSuccess && useQuery.isSuccess ? <TableUser users={users} setUsers={setUsers} prefixSearch={prefix} institutions={institutions} setInstitutions={setInstitutions}/>: <p>Cargando...</p>}
                </div>
            </div>
            <DialogCreateUser open={open} setOpen={setOpen} />
            <DialogCreateInstitution stateOpen={[openAddInstitution, setOpenAddInstitution]} />
        </div>
    )
};

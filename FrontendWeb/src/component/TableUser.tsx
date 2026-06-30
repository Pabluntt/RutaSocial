import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Divider, Checkbox, alpha, Box, IconButton, TableSortLabel, Toolbar, Tooltip, Typography, useMediaQuery, useTheme, Alert } from "@mui/material";
import { visuallyHidden } from '@mui/utils';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import React, { useState } from "react";
import { Order, getComparator } from "../utils/utilsSort";
import { IUser } from "../api/models/User";
import { useInstitution } from "../api/hooks/InstitutionHooks";
import { Institution } from "../api/models/Institution";
import { useApproveUser, useDeleteUser } from "../api/hooks/UserHooks";
import { useNavigate } from "react-router-dom";
import { UserService } from "../api/services/UserService";
import ConfirmDialog from "./Dialog/ConfirmDialog";

type SortableUserKeys = keyof Omit<IUser, 'listRoutes' | 'dateRegister' | 'completedRoutes' | 'isActive'>;

interface HeadCell {
  disablePadding: boolean;
  id: SortableUserKeys
  label: string;
  align: "center" | "left" | "right" | "justify" | "inherit";
}


const headCells: readonly HeadCell[] = [
  {
    id: 'name',
    align: 'left',
    disablePadding: true,
    label: 'Nombre',
  },
  {
    id: 'email',
    align: 'left',
    disablePadding: false,
    label: 'Email',
  }, {
    id: 'institutionID',
    align : 'left',
    disablePadding : false,
    label: 'Institución'
  },
  {
    id: 'role',
    align: 'center',
    disablePadding: false,
    label: 'Rol',
  }, {
    id : 'phone',
    align : 'center',
    disablePadding : false,
    label: 'Teléfono'
  }
];

interface EnhancedTableProps {
  numSelected: number;
  onRequestSort: (event: React.MouseEvent<unknown>, property: SortableUserKeys) => void;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
  isAdmin: boolean;
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const theme = useTheme();
  const computerDevice = useMediaQuery(theme.breakpoints.up('sm'));
  const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort, isAdmin } =
    props;
  const createSortHandler =
    (property: SortableUserKeys) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{
              'aria-label': 'select all users',
            }}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.align == 'right' ? (computerDevice ? 'right' : 'left') : headCell.align}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
        <TableCell align="center">
          Estado
        </TableCell>
        {isAdmin && (
          <TableCell align="center" sx={{ width: 120 }}>
            Acciones
          </TableCell>
        )}
      </TableRow>
    </TableHead>
  );
}
interface EnhancedTableToolbarProps {
  numSelected: number
  onDeleteUsers : () => void
  isAdmin: boolean
}
function EnhancedTableToolbar(props: EnhancedTableToolbarProps) {
  const { numSelected, onDeleteUsers, isAdmin } = props;

  return (
    <Toolbar
      sx={[
        {
          pl: { sm: 2 },
          pr: { xs: 1, sm: 1 },
        },
        numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
        },
      ]}
    >
      {numSelected > 0 ? (
        <Typography
          sx={{ flex: '1 1 100%' }}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {numSelected} selecionados
        </Typography>
      ) : (
        <div className="flex grow flex-col">
          <Typography
            sx={{ flex: '1 1 100%' }}
            variant="h6"
            id="tableTitle"
            component="div"
          >
            Lista de Usuarios
          </Typography>
          <Divider /> 
        </div>
      )}
      {numSelected > 0 && isAdmin ? (
          <Tooltip title="Eliminar seleccionados">
            <IconButton onClick={onDeleteUsers}>
              <DeleteIcon color="error" />
            </IconButton>
          </Tooltip>
      ) : (
        <>
        </>
      )}
    </Toolbar>
  );
}

export default function TableUser({ users, setUsers, prefixSearch, institutions, setInstitutions, isAdmin = false } : { users : IUser[], setUsers : (newUsers : IUser[]) => void, prefixSearch : string, institutions : Institution[], setInstitutions : (instutions : Institution[]) => void, isAdmin?: boolean }) {
  
  const navigate = useNavigate()
  const [order, setOrder] = React.useState<Order>('asc');
  const [orderBy, setOrderBy] = React.useState<SortableUserKeys>('email');
  const [selected, setSelected] = React.useState<readonly string[]>([]);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error'>('success');
  const [showAlert, setShowAlert] = useState(false);
  const [confirmAction, setConfirmAction] = useState<null | {
    title: string
    message: string
    confirmText: string
    cancelText: string
    confirmColor?: 'primary' | 'error' | 'success' | 'warning'
    severity?: 'info' | 'warning' | 'error' | 'success'
    onConfirm: () => void
  }>(null);
  const theme = useTheme();
  const computerDevice = useMediaQuery(theme.breakpoints.up('sm'));
  const { mutate: deleteUserMutate } = useDeleteUser();
  const { mutate: approveUserMutate } = useApproveUser();
  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: SortableUserKeys,
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = users.map((n) => (n.id));
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event: React.MouseEvent<unknown>, id: string) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: readonly string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    setSelected(newSelected);
  };


  const visibleRows = React.useMemo(
    () =>
      users
        .filter((user, _)=>(user.name.toLowerCase().startsWith(prefixSearch.toLowerCase())))
        .sort(getComparator(order, orderBy)),
    [order, orderBy, users, prefixSearch],
  );

  const onDeleteUsers = async () => {
    if (!isAdmin || selected.length === 0) return

    const usersToDelete = users.filter((user) => selected.includes(user.id))
    const label = usersToDelete.length === 1 ? usersToDelete[0].name : `${usersToDelete.length} usuarios seleccionados`

    setConfirmAction({
      title: 'Eliminar usuarios',
      message: `¿Estás seguro de que deseas eliminar ${label}?`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      confirmColor: 'error',
      severity: 'warning',
      onConfirm: () => { void deleteUsers(usersToDelete) },
    })
  }

  const deleteUsers = async (usersToDelete: IUser[]) => {
    setConfirmAction(null)

    const results = await Promise.allSettled(usersToDelete.map((user) => UserService.DeleteUser(user.id)))
    const deletedIds = usersToDelete
      .filter((_, index) => results[index].status === 'fulfilled')
      .map((user) => user.id)

    if (deletedIds.length > 0) {
      setUsers(users.filter((user) => !deletedIds.includes(user.id)))
    }
    setSelected([])

    if (deletedIds.length === usersToDelete.length) {
      setAlertMessage(deletedIds.length === 1 ? 'Usuario eliminado exitosamente' : 'Usuarios eliminados exitosamente')
      setAlertSeverity('success')
    } else {
      setAlertMessage(deletedIds.length === 0 ? 'No se pudo eliminar ningún usuario' : 'Algunos usuarios no pudieron eliminarse')
      setAlertSeverity('error')
    }
    setShowAlert(true)
    setTimeout(() => { setShowAlert(false); }, 3000)
  }

  const handleEditClick = (user: IUser) => {
    navigate(`${import.meta.env.VITE_BASE_URL}/admin/usuarios/${user.id}`)
  };

  const handleDeleteClick = (user: IUser) => {
    setConfirmAction({
      title: 'Eliminar usuario',
      message: `¿Estás seguro de que deseas eliminar a ${user.name}?`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      confirmColor: 'error',
      severity: 'warning',
      onConfirm: () => {
        setConfirmAction(null)
        deleteUserMutate(user.id, {
          onSuccess: () => {
            setUsers(users.filter((u) => u.id !== user.id));
            setAlertMessage('Usuario eliminado exitosamente');
            setAlertSeverity('success');
            setShowAlert(true);
            setTimeout(() => { setShowAlert(false); }, 3000);
          },
          onError: (error: any) => {
            setAlertMessage(error?.status === 403 ? 'No tienes permisos para eliminar usuarios' : 'Error al eliminar usuario');
            setAlertSeverity('error');
            setShowAlert(true);
            setTimeout(() => { setShowAlert(false); }, 3000);
          }
        });
      },
    })
  };

  const handleApproveClick = (user: IUser) => {
    setConfirmAction({
      title: 'Aprobar cuenta',
      message: `¿Aprobar la cuenta de ${user.name}? Esta persona podrá iniciar sesión después de la aprobación.`,
      confirmText: 'Aprobar',
      cancelText: 'Cancelar',
      confirmColor: 'success',
      severity: 'info',
      onConfirm: () => {
        setConfirmAction(null)
        approveUserMutate(user.id, {
          onSuccess: (approvedUser) => {
            setUsers(users.map((u) => u.id === approvedUser.id ? approvedUser : u));
            setAlertMessage('Usuario aprobado exitosamente');
            setAlertSeverity('success');
            setShowAlert(true);
            setTimeout(() => { setShowAlert(false); }, 3000);
          },
          onError: (error: any) => {
            setAlertMessage(error?.status === 403 ? 'No tienes permisos para aprobar usuarios' : 'Error al aprobar usuario');
            setAlertSeverity('error');
            setShowAlert(true);
            setTimeout(() => { setShowAlert(false); }, 3000);
          }
        })
      },
    })
  }

  return (
    <Box sx={{ width: '100%' }}>
      {showAlert && (
        <Alert severity={alertSeverity} sx={{ mb: 2 }}>
          {alertMessage}
        </Alert>
      )}
      <Paper sx={{ width: '100%', mb: 2 }}>
        <EnhancedTableToolbar numSelected={selected.length} onDeleteUsers={onDeleteUsers} isAdmin={isAdmin}/>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table
            sx={{ minWidth: computerDevice ? 600 : 'auto', tableLayout: computerDevice ? 'fixed' : 'auto', width: '100%' }}
            aria-labelledby="tableTitle"
            size={computerDevice ? 'medium' : 'small'}
            stickyHeader
          >
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={users.length}
              isAdmin={isAdmin}
            />
            <TableBody>
              {visibleRows.map((row, index) => {
                const isItemSelected = selected.includes(row.id);
                const labelId = `enhanced-table-checkbox-${index}`;
                const institution = institutions.find(v => v.id === row.institutionID) ??   { name : 'Institución eliminada', color: '#000000'}
            
                return (
                  <TableRow
                    hover
                    onClick={(event) => { handleClick(event, row.id); }}
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={row.email}
                    selected={isItemSelected}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isItemSelected}
                        inputProps={{
                          'aria-labelledby': labelId,
                        }}
                      />
                    </TableCell>
                    <TableCell
                      component="th"
                      id={labelId}
                      scope="row"
                      padding="none"
                    >
                      {row.name}
                    </TableCell>
                    <TableCell align="left" sx={{ 
                      maxWidth: 200,         
                      whiteSpace: 'nowrap',   
                      overflow: 'hidden',     
                      textOverflow: 'ellipsis'                     
                      }}>
                      {row.email}
                    </TableCell>
                    <TableCell align={'justify'} onClick={(e) => {
                      e.stopPropagation()
                    }}>
                      <div className="flex flex-row items-center gap-2">
                        <Box  
                          sx={{
                          width: 24,
                          height: 24,
                          bgcolor: institution.color || '#ccc',
                          border: '1px solid #ddd',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'transform 0.2s, box-shadow 0.2s',
                          '&:hover': {
                              transform: 'scale(1.05)',
                              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                          },
                          }}
                        />
                        {institution.name}
                      </div>
                    </TableCell>
                    <TableCell align={'center'}>{row.role}</TableCell>
                    <TableCell align={("center")}>{row.phone}</TableCell>
                    <TableCell align={("center")}>{row.isActive ? 'Activo' : 'Pendiente'}</TableCell>
                    {isAdmin && (
                      <TableCell align="center" onClick={(e) => { e.stopPropagation(); }}>
                        {selected.length === 0 ? (
                          <>
                            {row.isActive ? (
                              <Tooltip title="Editar">
                                <IconButton
                                  size="small"
                                  onClick={() => { handleEditClick(row); }}
                                  color="primary"
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            ) : (
                              <Tooltip title="Aprobar">
                                <IconButton
                                  size="small"
                                  onClick={() => { handleApproveClick(row); }}
                                  color="success"
                                >
                                  <CheckCircleIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip title="Eliminar">
                              <IconButton
                                size="small"
                                onClick={() => { handleDeleteClick(row); }}
                                color="error"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        ) : null}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      {confirmAction && (
        <ConfirmDialog
          open={Boolean(confirmAction)}
          title={confirmAction.title}
          message={confirmAction.message}
          confirmText={confirmAction.confirmText}
          cancelText={confirmAction.cancelText}
          confirmColor={confirmAction.confirmColor}
          severity={confirmAction.severity}
          onConfirm={confirmAction.onConfirm}
          onCancel={() => { setConfirmAction(null) }}
        />
      )}

    </Box>
  );
}

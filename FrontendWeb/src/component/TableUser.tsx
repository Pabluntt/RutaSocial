import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Divider, Checkbox, alpha, Box, IconButton, TableSortLabel, Toolbar, Tooltip, Typography, useMediaQuery, useTheme, CircularProgress } from "@mui/material";
import { visuallyHidden } from '@mui/utils';
import DeleteIcon from '@mui/icons-material/Delete';
import React, { useEffect } from "react";
import { Order, getComparator } from "../utils/utilsSort";
import { IUser } from "../api/models/User";
import { useInstitution } from "../api/hooks/InstitutionHooks";
import { Institution } from "../api/models/Institution";

type SortableUserKeys = keyof Omit<IUser, 'listRoutes' | 'dateRegister' | 'completedRoutes'>;

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
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const theme = useTheme();
  const computerDevice = useMediaQuery(theme.breakpoints.up('sm'));
  const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } =
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
      </TableRow>
    </TableHead>
  );
}
interface EnhancedTableToolbarProps {
  numSelected: number
  onDeleteUsers : () => void
}
function EnhancedTableToolbar(props: EnhancedTableToolbarProps) {
  const { numSelected, onDeleteUsers } = props;

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
      {numSelected > 0 ? (
        <>
        {/*
          <Tooltip title="Delete">
            <IconButton onClick={onDeleteUsers}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        */}
        </>
      ) : (
        <>
        </>
      )}
    </Toolbar>
  );
}

export default function TableUser({ users, setUsers, prefixSearch, institutions, setInstitutions } : { users : IUser[], setUsers : (newUsers : IUser[]) => void, prefixSearch : string, institutions : Institution[], setInstitutions : (instutions : Institution[]) => void }) {
  
  const [order, setOrder] = React.useState<Order>('asc');
  const [orderBy, setOrderBy] = React.useState<SortableUserKeys>('email');
  const [selected, setSelected] = React.useState<readonly string[]>([]);
  const theme = useTheme();
  const computerDevice = useMediaQuery(theme.breakpoints.up('sm'));
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
      const newSelected = users.map((n) => (n.email));
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event: React.MouseEvent<unknown>, email: string) => {
    const selectedIndex = selected.indexOf(email);
    let newSelected: readonly string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, email);
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

  const onDeleteUsers = () => {
    setUsers(users.filter((user, _) => (!selected.includes(user.email))))
    setSelected([])
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <EnhancedTableToolbar numSelected={selected.length} onDeleteUsers={onDeleteUsers}/>
        <TableContainer>
          <Table
            sx={{ minWidth: 600, tableLayout: 'fixed' }}
            aria-labelledby="tableTitle"
            size={'medium'}
            stickyHeader
          >
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={users.length}
            />
            <TableBody>
              {visibleRows.map((row, index) => {
                const isItemSelected = selected.includes(row.email);
                const labelId = `enhanced-table-checkbox-${index}`;
                const institution = institutions.find(v => v.id === row.institutionID) ??   { name : 'Institución eliminada', color: '#000000'}
            
                return (
                  <TableRow
                    hover
                    onClick={(event) => handleClick(event, row.email)}
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
                    
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}

import {
  GridAlignment,
  GridColDef,
  GridColumnHeaderParams,
  GridRenderCellParams,
  GridRowsProp,
} from '@mui/x-data-grid';
import Typography from '@mui/material/Typography';
import SendIcon from '@mui/icons-material/Send';
import {StatusChip} from 'components/StatusChip';
import {theme} from 'theme';
import IconButton from '@mui/material/IconButton';
import React from 'react';

const defaultProps = {
  editable: false,
  renderHeader: (params: GridColumnHeaderParams) => (
    <Typography variant="tableHeaderText" color="textSecondary">
      {params.colDef.headerName}
    </Typography>
  ),
  renderCell: (params: GridRenderCellParams<any, any, any>) => (
    <Typography variant="body2" mx="0.5em">
      {params.value}
    </Typography>
  ),
};
const defaultAlignment: {
  flex: number;
  headerAlign: GridAlignment;
  align: GridAlignment;
} = {
  flex: 1,
  headerAlign: 'center',
  align: 'center',
};

export const columns: GridColDef[] = [
  {
    field: 'name',
    headerName: 'Name',
    type: 'string',
    flex: 2,
    headerAlign: 'left',
    ...defaultProps,
  },
  {
    field: 'number',
    headerName: 'NUMBER',
    type: 'string',
    ...defaultAlignment,
    ...defaultProps,
  },
  {
    field: 'address',
    headerName: 'ADDRESS',
    type: 'number',
    flex: 3,
    headerAlign: 'left',
    align: 'left',
    ...defaultProps,
  },
  {
    field: 'units',
    headerName: 'NO. OF UNITS',
    type: 'number',
    ...defaultAlignment,
    ...defaultProps,
  },
  {
    field: 'phone',
    headerName: 'PHONE',
    type: 'string',
    flex: 1,
    headerAlign: 'left',
    align: 'left',
    ...defaultProps,
  },
  {
    field: 'access',
    headerName: 'DASHBOARD ACCESS',
    type: 'string',
    ...defaultAlignment,
    ...defaultProps,
    flex: 2,

    renderCell: (params) => (
      <StatusChip
        color="success"
        label={params.value}
        bgColor={theme.palette.success.main}
      />
    ),
  },
  {
    field: 'email',
    headerName: 'ACTIONS',
    editable: false,
    sortable: false,
    disableColumnMenu: true,
    disableExport: true,
    ...defaultAlignment,

    renderHeader: (params) => (
      <Typography variant="tableHeaderText">
        {params.colDef.headerName}
      </Typography>
    ),
    renderCell: (params) => (
      <IconButton
        component="a"
        onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
          e.stopPropagation();
          window.open(`mailto:${params.value}`, '_blank');
        }}>
        <SendIcon sx={{color: '#2196F3'}} />
      </IconButton>
    ),
  },
];

export const makeRows = (customers: any): GridRowsProp =>
  customers
    ? customers.map((item: any, index: number) => ({
        id: index,
        name: item.name,
        number: 234,
        address: item.address.fullName,
        units: item.units,
        phone: item.contact.phone,
        access: 'Invite',
        navigateTo: `details/${item.id}`,
        email: item.contact.email,
      }))
    : console.error('No Data');

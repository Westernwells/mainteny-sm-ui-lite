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
import IconButton from '@mui/material/IconButton';
import React from 'react';
import {convertToText} from 'utils/utils';

const defaultProps = {
  editable: false,
  renderHeader: (params: GridColumnHeaderParams) => (
    <Typography variant="subtitle2" color="textSecondary">
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
    cellClassName: 'truncateText',
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
    cellClassName: 'truncateText',
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
    cellClassName: 'nowrap',
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
      <StatusChip color="success" label={convertToText(params.value)} />
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
      <Typography variant="subtitle2" color="textSecondary">
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
        <SendIcon sx={{color: 'info.main'}} />
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
        navigateTo: `details/${item.id}?tab=0`,
        email: item.contact.email,
      }))
    : console.error('No Data');

import React from 'react';
import {GridColDef, GridRowsProp} from '@mui/x-data-grid';
import SendIcon from '@mui/icons-material/Send';
import {getColumnProps} from 'components/DataGridLayout';
import IconButton from '@mui/material/IconButton';

export const columns: GridColDef[] = [
  getColumnProps({
    field: 'number',
    headerName: 'number',
    align: 'center',
    flex: 0,
  }),
  getColumnProps({
    field: 'name',
    headerName: 'name',
    cellClassName: 'truncateText',
    flex: 1.5,
  }),
  getColumnProps({
    field: 'address',
    headerName: 'address',
    cellClassName: 'truncateText',
    flex: 1.5,
  }),
  getColumnProps({field: 'phone', headerName: 'phone', flex: 0.75}),
  getColumnProps({
    field: 'units',
    headerName: 'no. of units',
    align: 'right',
  }),
  getColumnProps({
    field: 'actions',
    headerName: 'actions',
    renderCell: (params) => (
      <IconButton
        component="a"
        onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
          e.stopPropagation();
          window.open(`mailto:${params.value}`, '_blank');
        }}>
        <SendIcon sx={{color: 'action.active'}} fontSize="small" />
      </IconButton>
    ),
    align: 'center',
    flex: 0,
  }),
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
        navigationData: {path: 'details?tab=0', id: item.id},
        actions: item.contact.email,
      }))
    : console.error('No Data');

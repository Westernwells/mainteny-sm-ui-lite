import {GridColDef, GridRowModel} from '@mui/x-data-grid';
import {getColumnProps} from 'components/DataGridLayout';
import {PropertyOwnerView} from 'models/propertyManager';
import {getDateObject} from 'utils/datetime';
import {Typography} from '@mui/material';
import {FormatDate} from 'models/misc';
import {Actions} from './Actions';

export const columns: GridColDef[] = [
  getColumnProps({
    field: 'number',
    headerName: 'number',
    align: 'center',
    flex: 0.75,
    renderCell: (params) => (
      <Typography
        sx={{
          fontSize: '0.875rem',
          overflowWrap: 'anywhere',
          whiteSpace: 'pre-wrap',
        }}>
        {params.value}
      </Typography>
    ),
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
  getColumnProps({
    field: 'phone',
    headerName: 'phone',
    flex: 0.75,
    align: 'center',
  }),
  getColumnProps({
    field: 'units',
    headerName: 'no. of units',
    align: 'center',
    flex: 0.5,
  }),
  getColumnProps({
    field: 'createdAt',
    headerName: 'CUSTOMER SINCE',
    align: 'center',
  }),
  getColumnProps({
    field: 'actions',
    headerName: 'actions',
    renderCell: (params) => (
      <Actions
        propertyOwnerId={params.value.propertyOwnerId}
        toEmail={params.value.toEmail}
      />
    ),
    align: 'center',
    flex: 0,
  }),
];

export const makeRows = (
  customers: PropertyOwnerView[],
  formatDate: FormatDate = () => '',
): GridRowModel<{[key: string]: any}[]> =>
  customers.map((item, index: number) => ({
    id: index,
    name: item.name,
    number: item.externalId,
    address: item.postalAddress?.fullName,
    units: item.unitNumber,
    phone: item.contact.phone === '+' ? '-' : item.contact.phone,
    access: 'Invite',
    navigateTo: `details/${item.id}?tab=0`,
    actions: {
      toEmail: item.contact.email,
      propertyOwnerId: item.id,
    },
    createdAt: formatDate(
      getDateObject(item.additionalInfo.registrationDate),
    ) as string,
  }));

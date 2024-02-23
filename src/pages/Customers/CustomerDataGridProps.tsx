import {GridColDef, GridRowModel} from '@mui/x-data-grid';
import {getColumnProps} from 'components/DataGridLayout';
import {
  PropertyOwnerOrderField,
  PropertyOwnerView,
} from 'models/propertyManager';
import {getDateObject} from 'utils/datetime';
import {Typography} from '@mui/material';
import {FormatDate} from 'models/misc';
import {Actions} from './Actions';

export const columns: GridColDef[] = [
  getColumnProps({
    field: PropertyOwnerOrderField.EXTERNAL_ID,
    sortable: true,
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
    field: PropertyOwnerOrderField.NAME,
    headerName: 'name',
    cellClassName: 'truncateText',
    flex: 1.5,
    sortable: true,
  }),
  getColumnProps({
    field: PropertyOwnerOrderField.BILLING_ADDRESS,
    sortable: true,
    headerName: 'address',
    cellClassName: 'truncateText',
    flex: 1.5,
  }),
  getColumnProps({
    field: PropertyOwnerOrderField.PHONE,
    sortable: true,
    headerName: 'phone',
    flex: 0.75,
    align: 'center',
  }),
  getColumnProps({
    field: PropertyOwnerOrderField.NUMBER_OF_ELEVATOR,
    sortable: true,
    headerName: 'no. of units',
    align: 'center',
    flex: 0.5,
  }),
  getColumnProps({
    field: PropertyOwnerOrderField.CREATED_TIME,
    sortable: true,
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
    [PropertyOwnerOrderField.NAME]: item.name,
    [PropertyOwnerOrderField.EXTERNAL_ID]: item.externalId,
    [PropertyOwnerOrderField.BILLING_ADDRESS]: item.billingAddress?.fullName,
    [PropertyOwnerOrderField.NUMBER_OF_ELEVATOR]: item.unitNumber,
    [PropertyOwnerOrderField.PHONE]:
      item.contact.phone === '+' ? '-' : item.contact.phone,
    access: 'Invite',
    navigateTo: `details/${item.id}?tab=0`,
    actions: {
      toEmail: item.contact.email,
      propertyOwnerId: item.id,
    },
    [PropertyOwnerOrderField.CREATED_TIME]: formatDate(
      getDateObject(item.additionalInfo.registrationDate),
    ) as string,
  }));

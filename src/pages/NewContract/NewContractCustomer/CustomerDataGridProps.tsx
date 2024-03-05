import {
  GridColDef,
  GridColumnHeaderParams,
  GridRenderCellParams,
  GridRowModel,
} from '@mui/x-data-grid';
import {getColumnProps} from 'components/DataGridLayout';
import {PropertyOwnerView} from 'models/propertyManager';
import {getDateObject} from 'utils/datetime';
import {Box, Typography} from '@mui/material';
import {FormatDate} from 'models/misc';
import {FormRadio} from 'components/form/FormRadio';
import {useTranslation} from 'react-i18next';

export const columns = (activeId: string): GridColDef[] => [
  {
    field: 'number',
    headerName: 'NUMBER',
    type: 'string',
    headerAlign: 'left',
    align: 'left',
    flex: 1,
    renderHeader: (params: GridColumnHeaderParams) => {
      const {t} = useTranslation();
      return (
        <Typography variant="subtitle2" color="textSecondary">
          {typeof params.colDef.headerName === 'string' &&
            t(params.colDef.headerName)}
        </Typography>
      );
    },
    renderCell: (params: GridRenderCellParams<any, PropertyOwnerView, any>) => (
      <Box sx={{display: 'flex'}}>
        <FormRadio
          value={params.row.id}
          checked={params.row.id === activeId}
          label={
            <Typography
              variant="body2"
              component="span"
              sx={{display: 'flex', alignItems: 'center'}}>
              {params.value || '-'}
            </Typography>
          }
        />
      </Box>
    ),
  },
  getColumnProps({
    field: 'name',
    headerName: 'customer',
    cellClassName: 'truncateText',
    flex: 1.5,
  }),
  getColumnProps({
    field: 'address',
    headerName: 'address',
    cellClassName: 'truncateText',
    flex: 2,
  }),
  getColumnProps({
    field: 'phone',
    headerName: 'phone',
    flex: 0.75,
    align: 'left',
    headerAlign: 'left',
  }),
  getColumnProps({
    field: 'units',
    headerName: 'no. of units',
    align: 'center',
    flex: 0.5,
  }),
  getColumnProps({
    field: 'createdAt',
    headerName: 'joined date',
    align: 'right',
    headerAlign: 'right',
  }),
];

export const makeRows = (
  customers: PropertyOwnerView[],
  formatDate: FormatDate = () => '',
): GridRowModel<{[key: string]: any}[]> =>
  customers.map((item) => ({
    id: item.id,
    name: item.name,
    number: item.externalId,
    address: item.billingAddress?.fullName,
    units: item.unitNumber,
    phone: item.contact.phone === '+' ? '-' : item.contact.phone,
    createdAt: formatDate(
      getDateObject(item.additionalInfo.registrationDate),
    ) as string,
    customer: item,
  }));

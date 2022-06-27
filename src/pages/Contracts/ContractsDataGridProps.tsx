import IconButton from '@mui/material/IconButton';
import {GridColDef} from '@mui/x-data-grid';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import {getColumnProps} from 'components/DataGridLayout';
import {formatCurrency} from 'utils/currency';
import {formatDate} from 'utils/datetime';
import {ContractView} from 'models/contract';

export const columns: GridColDef[] = [
  getColumnProps({
    field: 'number',
    headerName: 'number',
    align: 'center',
    flex: 0,
  }),
  getColumnProps({
    field: 'customer',
    headerName: 'customer',
    cellClassName: 'truncateText',
    flex: 1.5,
  }),
  getColumnProps({
    field: 'units',
    headerName: 'no. of units',
    align: 'right',
  }),
  getColumnProps({
    field: 'start',
    headerName: 'start date',
    align: 'center',
    flex: 0.75,
  }),
  getColumnProps({
    field: 'end',
    headerName: 'expiry date',
    align: 'center',
    flex: 0.75,
  }),
  getColumnProps({
    field: 'type',
    headerName: 'contact type',
    align: 'center',
  }),
  getColumnProps({
    field: 'cost',
    headerName: 'cost/year',
    align: 'right',
    flex: 0,
  }),
  getColumnProps({
    field: 'actions',
    headerName: 'actions',
    align: 'center',
    renderCell: () => (
      <IconButton onClick={() => console.log('ACTION: Download')}>
        <FileDownloadOutlinedIcon
          fontSize="small"
          sx={{color: 'action.active'}}
        />
      </IconButton>
    ),
    flex: 0,
  }),
];

export const makeRows = (contracts: ContractView[]) =>
  contracts
    ? contracts.map((item, index) => ({
        id: index,
        number: item.number,
        customer: item.propertyOwner.name,
        units: item.units,
        start: formatDate(item.startTime),
        end: formatDate(item.endTime),
        type: item.type,
        cost: `${formatCurrency(
          item.additionalInfo?.price?.netAmount
            ? item.additionalInfo.price.netAmount
            : 0,
          {
            currency: item.currency,
          },
        )}`,
        navigateTo: `details/${item.id}`,
      }))
    : [];

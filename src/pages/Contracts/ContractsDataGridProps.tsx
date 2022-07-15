import {GridColDef} from '@mui/x-data-grid';
import {getColumnProps} from 'components/DataGridLayout';
import {formatNetAmount} from 'utils/currency';
import {formatDate} from 'utils/datetime';
import {ContractView} from 'models/contract';
import {Actions} from './Actions';

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
    flex: 0.5,
  }),
  getColumnProps({
    field: 'actions',
    headerName: 'actions',
    align: 'center',
    renderCell: (params) => (
      <Actions url={params.value.url} fileName={params.value.fileName} />
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
        units: item.elevators.length,
        start: formatDate(item.startTime),
        end: formatDate(item.endTime),
        type: item.type,
        cost: formatNetAmount(item.additionalInfo?.price) || '-',
        actions: {
          url:
            item?.additionalInfo?.documents &&
            item?.additionalInfo?.documents.length > 0
              ? item?.additionalInfo?.documents[0].uri
              : '',
          fileName:
            item?.additionalInfo?.documents &&
            item?.additionalInfo?.documents?.length > 0
              ? item?.additionalInfo?.documents[0]?.description
              : 'contract',
        },
        navigateTo: `details/${item.id}`,
      }))
    : [];

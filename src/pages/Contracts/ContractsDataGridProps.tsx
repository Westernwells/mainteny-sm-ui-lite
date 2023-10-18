import {GridColDef, GridRenderCellParams} from '@mui/x-data-grid';
import {getColumnProps} from 'components/DataGridLayout';
import {formatNetAmount} from 'utils/currency';
import {FormatDate} from 'models/misc';
import {ContractStatus, ContractView} from 'models/contract';
import {StatusChip} from 'components/StatusChip';
import {Actions} from './Actions';

export const getContractStatusStyles = (
  status: string,
): {
  label: string;
  color: 'success' | 'warning' | 'error' | 'info' | 'default' | 'primary';
} => {
  switch (status) {
    case ContractStatus.VALID:
      return {label: 'Active', color: 'success'};
    case ContractStatus.EXPIRED:
      return {label: 'Inactive', color: 'error'};
    case ContractStatus.EXPIRING:
      return {label: 'Expiring', color: 'warning'};
    case ContractStatus.PENDING:
      return {label: 'Inactive', color: 'error'};
    default:
      return {label: '-', color: 'default'};
  }
};

export const columns: GridColDef[] = [
  getColumnProps({
    field: 'number',
    headerName: 'number',
    align: 'center',
    flex: 1.25,
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
    align: 'center',
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
    headerName: 'contract type',
    align: 'center',
  }),
  getColumnProps({
    field: 'status',
    headerName: 'contract status',
    align: 'left',
    headerAlign: 'left',
    renderCell: (params: GridRenderCellParams<any, any, any>) => (
      <StatusChip
        label={getContractStatusStyles(params.value).label}
        color={getContractStatusStyles(params.value).color}
        variant="filled"
        size="small"
        maxChars={9}
      />
    ),
    flex: 1,
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
      <Actions
        url={params.value.url}
        fileName={params.value.fileName}
        contractId={params.value.contractId}
      />
    ),
    flex: 0,
  }),
];

export const makeRows = (
  contracts: ContractView[],
  formatDate: FormatDate = () => '',
) =>
  contracts
    ? contracts.map((item, index) => ({
        id: index,
        number: item.externalId || '-',
        customer: item.propertyOwner.name,
        units: item.elevators.length,
        start: formatDate(item.startTime),
        end: formatDate(item.endTime),
        type: item.type,
        cost: formatNetAmount(item.additionalInfo?.price) || '-',
        status: item.status,
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
          contractId: item.id,
        },
        navigateTo: `details/${item.id}`,
      }))
    : [];

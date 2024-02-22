import {GridColDef, GridRenderCellParams} from '@mui/x-data-grid';
import {getColumnProps} from 'components/DataGridLayout';
import {formatCurrency} from 'utils/currency';
import {FormatDate} from 'models/misc';
import {ContractOrderField, ContractView} from 'models/contract';
import {StatusChip} from 'components/StatusChip';
import {getContractStatusStyles} from 'utils/contract-utils';
import {toDate} from 'utils/datetime';
import {Actions} from './Actions';

export const columns: GridColDef[] = [
  getColumnProps({
    field: 'number',
    headerName: 'number',
    align: 'left',
    headerAlign: 'left',
    flex: 1.25,
  }),
  getColumnProps({
    field: 'customer',
    headerName: 'customer',
    cellClassName: 'truncateText',
    align: 'left',
    headerAlign: 'left',
    flex: 1.5,
  }),
  getColumnProps({
    field: 'name',
    headerName: 'contract name',
    align: 'left',
    headerAlign: 'left',
  }),
  getColumnProps({
    field: 'units',
    headerName: 'no. of units',
    align: 'center',
    headerAlign: 'center',
  }),
  getColumnProps({
    field: ContractOrderField.START_TIME,
    headerName: 'start',
    align: 'left',
    headerAlign: 'left',
    flex: 0.5,
    sortable: true,
  }),
  getColumnProps({
    field: ContractOrderField.EXPIRY_TIME,
    headerName: 'expiry',
    align: 'left',
    headerAlign: 'left',
    flex: 0.5,
    sortable: true,
  }),
  getColumnProps({
    field: 'type',
    headerName: 'type',
    align: 'left',
    headerAlign: 'left',
  }),
  getColumnProps({
    field: 'status',
    headerName: 'status',
    align: 'center',
    headerAlign: 'center',
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
    headerName: 'Price (excl. VAT)',
    align: 'right',
    headerAlign: 'right',
    flex: 1,
  }),
  getColumnProps({
    field: 'actions',
    headerName: 'actions',
    align: 'center',
    headerAlign: 'center',
    renderCell: (params) => (
      <Actions
        url={params.value.url}
        fileName={params.value.fileName}
        contractId={params.value.contractId}
      />
    ),
    flex: 1,
  }),
];

export const makeRows = (
  contracts: ContractView[],
  currencyCode: string,
  formatDate: FormatDate = () => '',
) =>
  contracts
    ? contracts.map((item, index) => ({
        id: index,
        number: item.externalId || '-',
        customer: item.propertyOwner.name,
        units: item.elevators.length,
        [ContractOrderField.START_TIME]: item.start
          ? formatDate(toDate(item.start))
          : '-',
        [ContractOrderField.EXPIRY_TIME]: item.end
          ? formatDate(toDate(item.end))
          : '-',
        type: item.type,
        name: item.name,
        cost:
          `${formatCurrency(
            (item.additionalInfo?.price?.netAmount ?? 0) /
              10 ** (item.additionalInfo?.price?.fractionDigits ?? 0),
            {currency: item.additionalInfo.price?.currency || currencyCode},
          )}` || '-',
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

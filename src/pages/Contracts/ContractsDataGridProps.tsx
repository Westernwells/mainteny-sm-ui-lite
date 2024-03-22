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
    field: ContractOrderField.EXTERNAL_ID,
    sortable: true,
    headerName: 'number',
    align: 'left',
    headerAlign: 'left',
    flex: 1.25,
  }),
  getColumnProps({
    field: ContractOrderField.PROPERTY_OWNER_NAME,
    sortable: true,
    headerName: 'customer',
    cellClassName: 'truncateText',
    align: 'left',
    headerAlign: 'left',
    flex: 1.5,
  }),
  getColumnProps({
    field: ContractOrderField.NAME,
    sortable: true,
    headerName: 'contract name',
    align: 'left',
    headerAlign: 'left',
  }),
  getColumnProps({
    field: ContractOrderField.NUMBER_OF_ELEVATOR,
    sortable: true,
    headerName: 'no. of units',
    align: 'center',
    headerAlign: 'center',
  }),
  getColumnProps({
    field: ContractOrderField.START_TIME,
    headerName: 'START',
    align: 'left',
    headerAlign: 'left',
    flex: 0.5,
    sortable: true,
  }),
  getColumnProps({
    field: ContractOrderField.EXPIRY_TIME,
    headerName: 'EXPIRY',
    align: 'left',
    headerAlign: 'left',
    flex: 0.5,
    sortable: true,
  }),
  getColumnProps({
    field: ContractOrderField.STATUS,
    sortable: true,
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
    field: ContractOrderField.NET_PRICE,
    sortable: true,
    headerName: 'PRICE (EXCL. VAT)',
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
  fractionDigits: number,
  formatDate: FormatDate = () => '',
) =>
  contracts
    ? contracts.map((item, index) => ({
        id: index,
        [ContractOrderField.EXTERNAL_ID]: item.externalId || '-',
        [ContractOrderField.PROPERTY_OWNER_NAME]: item.propertyOwner.name,
        [ContractOrderField.NUMBER_OF_ELEVATOR]: item.elevators.length,
        [ContractOrderField.START_TIME]: item.start
          ? formatDate(toDate(item.start))
          : '-',
        [ContractOrderField.EXPIRY_TIME]: item.end
          ? formatDate(toDate(item.end))
          : '-',
        [ContractOrderField.NAME]: item.name,
        [ContractOrderField.NET_PRICE]:
          `${formatCurrency(
            (item.additionalInfo?.price?.netAmount ??
              item.additionalInfo?.totalYearlyPrice ??
              0) /
              10 ** fractionDigits,
            {currency: item.additionalInfo.price?.currency || currencyCode},
          )}` || '-',
        [ContractOrderField.STATUS]: item.status,
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

import {GridColDef, GridRenderCellParams, GridRowsProp} from '@mui/x-data-grid';
import {StatusChip} from 'components/StatusChip';
import {getColumnProps} from 'components/DataGridLayout';
import {formatDate} from 'utils/datetime';
import {formatCurrency} from 'utils/currency';
import {QuotationStatus, QuotationView} from 'models/quotation';
import {Resource} from 'models/misc';
import {Actions} from './Actions';

export const getQuotationStatusStyles = (
  status: string,
): {
  label: string;
  color: 'success' | 'warning' | 'error' | 'info' | 'default' | 'primary';
} => {
  switch (status) {
    case QuotationStatus.ACCEPTED:
      return {label: 'Accepted', color: 'primary'};
    case QuotationStatus.DRAFT:
      return {label: 'Draft', color: 'default'};
    case QuotationStatus.REJECTED:
      return {label: 'Denied', color: 'error'};
    case QuotationStatus.SENT_TO_CLIENT:
      return {label: 'Sent', color: 'success'};
    default:
      return {label: '-', color: 'default'};
  }
};

export const columns: GridColDef[] = [
  getColumnProps({
    field: 'number',
    headerName: 'number',
    align: 'left',
    flex: 0.75,
  }),
  getColumnProps({
    field: 'subject',
    headerName: 'subject',
    cellClassName: 'truncateText',
    flex: 1.5,
  }),
  getColumnProps({
    field: 'customer',
    headerName: 'customer',
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
    field: 'created',
    headerName: 'created date',
    align: 'center',
    flex: 0.75,
  }),
  getColumnProps({
    field: 'amount',
    headerName: 'total amount',
    align: 'right',
  }),
  getColumnProps({
    field: 'status',
    headerName: 'status',
    align: 'center',
    renderCell: (params: GridRenderCellParams<any, any, any>) => (
      <StatusChip
        label={getQuotationStatusStyles(params.value).label}
        color={getQuotationStatusStyles(params.value).color}
        variant="filled"
        size="small"
        maxChars={9}
      />
    ),
    flex: 0.75,
  }),
  getColumnProps({
    field: 'actions',
    headerName: 'actions',
    align: 'center',
    renderCell: (params) => <Actions quotation={params.row.quotation} />,
    flex: 0,
  }),
];

export const makeRows = (quotations: Resource<QuotationView>): GridRowsProp =>
  quotations &&
  quotations.data.map((item: QuotationView, index: number) => ({
    id: index,
    subject: item.subject,
    quotationId: item.id,
    number: item.number,
    customer: item.elevator.propertyOwner.name,
    address: item.elevator.propertyOwner.postalAddress.fullName,
    created: formatDate(item.meta.createdAt),
    amount: `${formatCurrency(
      item
        ? item.totalAmount.netAmount / 10 ** item.totalAmount.fractionDigits!
        : 0,
      {
        currency: item.totalAmount.currency,
      },
    )}`,
    status: item.status,
    quotation: item,
    navigateTo: `details/${item.id}`,
  }));

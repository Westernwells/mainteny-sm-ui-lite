import {GridColDef, GridRenderCellParams, GridRowsProp} from '@mui/x-data-grid';
import {StatusChip} from 'components/StatusChip';
import {getColumnProps} from 'components/DataGridLayout';
import {formatDate} from 'utils/datetime';
import {formatCurrency} from 'utils/currency';
import {QuotationStatus, QuotationView} from 'models/quotation';

export const getQuotationStatusStyles = (
  status: string,
): {
  label: string;
  color: 'success' | 'warning' | 'error' | 'info' | 'default';
} => {
  switch (status) {
    case QuotationStatus.ACCEPTED:
      return {label: 'Accepted', color: 'warning'};
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
    field: 'quotationDate',
    headerName: 'QUOTATION DATE',
    variant: 'titleCase',
  }),
  getColumnProps({
    field: 'number',
    headerName: 'NUMBER',
    variant: 'titleCase',
  }),
  getColumnProps({
    field: 'totalAmount',
    headerName: 'TOTAL AMOUNT',
    variant: 'titleCase',
  }),
  getColumnProps({
    field: 'status',
    headerName: 'STATUS',
    align: 'center',
    variant: 'titleCase',
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
];

export const makeRows = (quotations: QuotationView[]): GridRowsProp =>
  quotations &&
  quotations.map((item: QuotationView) => ({
    id: item.id,
    number: item.number,
    quotationDate: formatDate(item.meta.createdAt),
    totalAmount: `${formatCurrency(
      item
        ? item.totalAmount.netAmount / 10 ** item.totalAmount.fractionDigits!
        : 0,
      {
        currency: item.totalAmount.currency,
      },
    )}`,
    status: item.status,
    navigateTo: `/quotations/details/${item.id}`,
  }));

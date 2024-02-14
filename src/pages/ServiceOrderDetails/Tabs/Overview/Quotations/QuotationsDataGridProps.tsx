import {GridColDef, GridRenderCellParams, GridRowsProp} from '@mui/x-data-grid';
import {StatusChip} from 'components/StatusChip';
import {getColumnProps} from 'components/DataGridLayout';
import {formatCurrency} from 'utils/currency';
import {QuotationStatus, QuotationView} from 'models/quotation';
import {FormatDate} from 'models/misc';
import {Actions} from 'pages/Quotations/Actions';

export const getQuotationStatusStyles = (
  status: string,
): {
  label: string;
  color:
    | 'success'
    | 'warning'
    | 'error'
    | 'info'
    | 'default'
    | 'primary'
    | 'eden.light'
    | 'action.active';
} => {
  switch (status) {
    case QuotationStatus.ACCEPTED:
      return {label: 'Accepted', color: 'success'};
    case QuotationStatus.DRAFT:
      return {label: 'Draft', color: 'eden.light'};
    case QuotationStatus.REJECTED:
      return {label: 'Rejected', color: 'error'};
    case QuotationStatus.SENT_TO_CLIENT:
      return {label: 'Sent', color: 'primary'};
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
    headerName: 'QUOTATION NUMBER',
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
        variant="outlined"
        size="small"
        maxChars={9}
      />
    ),
    flex: 0.75,
  }),
  getColumnProps({
    field: 'totalAmount',
    headerName: 'TOTAL AMOUNT',
    variant: 'titleCase',
    align: 'right',
    headerAlign: 'right',
  }),
  getColumnProps({
    field: 'actions',
    headerName: 'actions',
    align: 'right',
    headerAlign: 'right',
    variant: 'titleCase',
    renderCell: (params) => <Actions quotation={params.row.quotation} />,
    flex: 0.5,
  }),
];

export const makeRows = (
  quotations: QuotationView[],
  formatDate: FormatDate = () => '',
): GridRowsProp =>
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
    quotation: item,
    navigateTo: `/quotations/details/${item.id}`,
  }));

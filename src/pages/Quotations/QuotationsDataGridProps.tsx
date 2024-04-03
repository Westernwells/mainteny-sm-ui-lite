import {
  GridColDef,
  GridColumnHeaderParams,
  GridRenderCellParams,
  GridRowsProp,
} from '@mui/x-data-grid';
import {StatusChip} from 'components/StatusChip';
import {formatCurrency} from 'utils/currency';
import {
  QuotationOrderField,
  QuotationStatus,
  QuotationView,
} from 'models/quotation';
import {FormatDate, Resource} from 'models/misc';
import {Typography} from '@mui/material';
import CustomTableHeader from 'components/CustomTableHeader';
import {NotesIndicator} from './NotesIndicator';
import {Actions} from './Actions';
import {T} from 'utils/i18n-utils';

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
    | 'primary.main'
    | 'primary.mainLight'
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
      return {label: 'Sent', color: 'primary.mainLight'};
    default:
      return {label: '-', color: 'default'};
  }
};

export const columns: GridColDef[] = [
  {
    field: QuotationOrderField.EXTERNAL_ID,
    sortable: true,
    align: 'left',
    flex: 0.5,
    renderHeader: () => (
      <Typography variant="subtitle2" color="textSecondary">
        {T('NUMBER')}
      </Typography>
    ),
  },
  {
    field: QuotationOrderField.CUSTOMER_NAME,
    cellClassName: 'truncateText',
    flex: 1.5,
    sortable: true,
    renderHeader: () => (
      <Typography variant="subtitle2" color="textSecondary">
        {T('CUSTOMER')}
      </Typography>
    ),
  },
  {
    field: QuotationOrderField.ELEVATOR_ADDRESS,
    sortable: true,
    headerName: 'address',
    cellClassName: 'truncateText',
    flex: 1.5,
    renderHeader: () => (
      <Typography variant="subtitle2" color="textSecondary">
        {T('ADDRESS')}
      </Typography>
    ),
  },
  {
    field: QuotationOrderField.CREATED_DATE,
    align: 'right',
    headerAlign: 'right',
    flex: 0.75,
    renderHeader: () => (
      <Typography variant="subtitle2" color="textSecondary">
        {T('CREATED DATE')}
      </Typography>
    ),
  },
  {
    field: QuotationOrderField.TOTAL_NET_AMOUNT,
    flex: 1,
    align: 'right',
    headerAlign: 'right',
    renderHeader: () => (
      <Typography variant="subtitle2" color="textSecondary">
        {T('TOTAL AMOUNT (EXCL. VAT)')}
      </Typography>
    ),
  },
  {
    field: QuotationOrderField.COMMENT_COUNT,
    sortable: true,
    headerName: 'notes',
    align: 'center',
    renderCell: (params: GridRenderCellParams<any, any, any>) => (
      <NotesIndicator quotation={params.row.quotation} />
    ),
    flex: 0.5,
    headerAlign: 'center',
    renderHeader: () => (
      <Typography variant="subtitle2" color="textSecondary">
        {T('NOTES')}
      </Typography>
    ),
  },
  {
    field: QuotationOrderField.STATUS,
    sortable: true,
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
    flex: 0.5,
    headerAlign: 'center',
    renderHeader: () => (
      <Typography variant="subtitle2" color="textSecondary">
        {T('STATUS')}
      </Typography>
    ),
  },
  {
    field: 'actions',
    align: 'right',
    renderCell: (params: GridRenderCellParams<any, any, any>) => (
      <Actions quotation={params.row.quotation} />
    ),
    flex: 0.5,
    sortable: false,
    headerAlign: 'right',
    renderHeader: () => (
      <Typography variant="subtitle2" color="textSecondary">
        {T('ACTIONS')}
      </Typography>
    ),
  },
];

export const makeRows = (
  quotations: Resource<QuotationView>,
  formatDate: FormatDate = () => '',
): GridRowsProp =>
  quotations &&
  quotations.data.map((item: QuotationView, index: number) => ({
    id: index,
    quotationId: item.id,
    [QuotationOrderField.EXTERNAL_ID]: item.number,
    [QuotationOrderField.CUSTOMER_NAME]: item?.propertyOwner?.name ?? '-',
    [QuotationOrderField.ELEVATOR_ADDRESS]:
      item?.additionalInfo?.billingAddress?.fullName ?? '-',
    [QuotationOrderField.CREATED_DATE]: formatDate(item.meta.createdAt),
    [QuotationOrderField.TOTAL_NET_AMOUNT]: `${formatCurrency(
      item
        ? item.totalAmount.netAmount / 10 ** item.totalAmount.fractionDigits!
        : 0,
      {
        currency: item.totalAmount.currency,
      },
    )}`,
    [QuotationOrderField.STATUS]: item.status,
    quotation: item,
    navigateTo: `details/${item.id}`,
  }));

// @ts-nocheck
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
import {t} from 'i18next';
import CustomTableHeader from 'components/CustomTableHeader';
import {NotesIndicator} from './NotesIndicator';
import {Actions} from './Actions';

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

export const columns = (handleSortModelChange: any): GridColDef[] => [
  {
    field: 'number',
    align: 'left',
    flex: 0.5,
    sortable: false,
    renderHeader: () => (
      <Typography variant="subtitle2" color="textSecondary">
        {t('NUMBER')}
      </Typography>
    ),
  },
  {
    field: QuotationOrderField.CUSTOMER_NAME,
    headerName: 'CUSTOMER',
    cellClassName: 'truncateText',
    flex: 1.5,
    sortable: false,
    renderHeader: (params: GridColumnHeaderParams) => (
      <CustomTableHeader
        onSortChange={handleSortModelChange}
        column={params.colDef}
      />
    ),
  },
  {
    field: 'address',
    headerName: 'address',
    cellClassName: 'truncateText',
    flex: 1.5,
    sortable: false,
    renderHeader: () => (
      <Typography variant="subtitle2" color="textSecondary">
        {t('ADDRESS')}
      </Typography>
    ),
  },
  {
    field: QuotationOrderField.CREATED_DATE,
    headerName: 'CREATED DATE',
    align: 'right',
    headerAlign: 'right',
    flex: 0.75,
    sortable: false,
    renderHeader: (params: GridColumnHeaderParams) => (
      <CustomTableHeader
        onSortChange={handleSortModelChange}
        column={params.colDef}
      />
    ),
  },
  {
    field: QuotationOrderField.SALES_PRICE,
    headerName: 'Total amount (excl. VAT)',
    flex: 1,
    sortable: false,
    align: 'right',
    headerAlign: 'right',
    renderHeader: (params: GridColumnHeaderParams) => (
      <CustomTableHeader
        onSortChange={handleSortModelChange}
        column={params.colDef}
      />
    ),
  },
  {
    field: 'notes',
    headerName: 'notes',
    align: 'center',
    renderCell: (params: GridRenderCellParams<any, any, any>) => (
      <NotesIndicator quotation={params.row.quotation} />
    ),
    flex: 0.5,
    sortable: false,
    headerAlign: 'center',
    renderHeader: () => (
      <Typography variant="subtitle2" color="textSecondary">
        {t('NOTES')}
      </Typography>
    ),
  },
  {
    field: 'status',
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
    sortable: false,
    headerAlign: 'center',
    renderHeader: () => (
      <Typography variant="subtitle2" color="textSecondary">
        {t('STATUS')}
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
        {t('ACTIONS')}
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
    number: item.number,
    [QuotationOrderField.CUSTOMER_NAME]: item.elevator.propertyOwner.name,
    address: item.elevator.propertyOwner.billingAddress?.fullName ?? '-',
    [QuotationOrderField.CREATED_DATE]: formatDate(item.meta.createdAt),
    [QuotationOrderField.SALES_PRICE]: `${formatCurrency(
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

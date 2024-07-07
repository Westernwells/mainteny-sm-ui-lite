import {GridColDef, GridRenderCellParams, GridRowsProp} from '@mui/x-data-grid';

import {StatusChip} from 'components/StatusChip';
import {getColumnProps} from 'components/DataGridLayout';
import {InvoiceStatus, InvoiceView} from 'models/invoice';
import {formatCurrency} from 'utils/currency';
import {toDate} from 'utils/datetime';
import {
  FormatDate,
  HeaderFooterInfoData,
  StringValueResponse,
} from 'models/misc';
import {Actions} from 'pages/Invoices/Actions';
import i18next from 'i18next';

export const getInvoiceStatusStyles = (
  status: string,
): {
  label: string;
  color:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'action.active'
    | 'warning'
    | 'warning.dark'
    | 'primary.light';
} => {
  switch (status) {
    case InvoiceStatus.PAID:
      return {label: 'Paid', color: 'success'};
    case InvoiceStatus.DRAFT:
      return {label: 'Draft', color: 'action.active'};
    case InvoiceStatus.EXPIRED:
      return {label: 'Overdue', color: 'error'};
    case InvoiceStatus.NOT_PAID:
      return {label: 'Unpaid', color: 'warning'};
    case InvoiceStatus.CANCELLED:
      return {label: 'Cancelled', color: 'warning.dark'};
    case InvoiceStatus.PARTIALLY_PAID:
      return {label: 'Partially Paid', color: 'warning'};
    case InvoiceStatus.CREDITED:
      return {label: 'Credited', color: 'primary.light'};
    default:
      return {label: '-', color: 'default'};
  }
};

export const columns = (
  headerInfo: HeaderFooterInfoData,
  footerInfo: HeaderFooterInfoData,
  headerUrl: {
    [key: string]: string;
  },
  footerUrl: {
    [key: string]: string;
  },
  companyNextNumber: StringValueResponse | undefined,
): GridColDef[] => [
  getColumnProps({
    field: 'date',
    headerName: 'date',
    align: 'left',
    headerAlign: 'left',
    flex: 1,
    variant: 'titleCase',
  }),
  getColumnProps({
    field: 'number',
    headerName: 'invoice number',
    align: 'center',
    flex: 1,
    variant: 'titleCase',
  }),
  getColumnProps({
    field: 'order',
    headerName: 'job number',
    align: 'center',
    flex: 1,
    variant: 'titleCase',
  }),
  getColumnProps({
    field: 'invoiceType',
    headerName: 'type',
    align: 'center',
    flex: 1,
    variant: 'titleCase',
  }),
  getColumnProps({
    field: 'status',
    headerName: 'invoice status',
    align: 'center',
    variant: 'titleCase',
    renderCell: (params: GridRenderCellParams<any, any, any>) => (
      <StatusChip
        label={getInvoiceStatusStyles(params.value).label}
        color={getInvoiceStatusStyles(params.value).color}
        maxChars={8}
        variant="outlined"
      />
    ),
    flex: 1,
  }),
  getColumnProps({
    field: 'amount',
    headerName: 'total amount',
    align: 'right',
    flex: 1,
    headerAlign: 'right',
    variant: 'titleCase',
  }),
  getColumnProps({
    field: 'actions',
    headerName: 'actions',
    align: 'right',
    headerAlign: 'right',
    variant: 'titleCase',
    renderCell: (params) => (
      <Actions
        invoice={params.row.invoice}
        headerInfo={headerInfo}
        footerInfo={footerInfo}
        headerUrl={headerUrl}
        footerUrl={footerUrl}
        companyNextNumber={companyNextNumber}
        isInvoiceList={false}
      />
    ),
    flex: 1,
  }),
];

export const makeRows = (
  invoices: InvoiceView[],
  serviceCompanyId?: string,
  formatDate: FormatDate = () => '',
): GridRowsProp =>
  invoices.length
    ? invoices.map((item, index: number) => ({
        id: index,
        date: item.sentDate ? formatDate(toDate(item.sentDate)) : '-',
        number: item.externalId ?? '-',
        order: item.serviceOrder?.externalId ?? '-',
        customer: item.propertyOwner.name,
        type: i18next.t(item.serviceOrder?.type!),
        amount: `${formatCurrency(
          item
            ? item.totalAmount.grossAmount! /
                10 ** item.totalAmount.fractionDigits!
            : 0,
          {
            currency: item.totalAmount.currency,
          },
        )}`,
        invoiceType: item.type ?? '-',
        status: item.status,
        actions: {
          pdfPath: item.additionalInfo.pdfPath,
          serviceCompanyId,
        },
        invoice: item,
        navigateTo: `/invoices/details/${item.id}`,
      }))
    : [];

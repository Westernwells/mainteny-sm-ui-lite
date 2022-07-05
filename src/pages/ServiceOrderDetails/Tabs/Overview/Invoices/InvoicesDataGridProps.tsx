import {GridColDef, GridRenderCellParams, GridRowsProp} from '@mui/x-data-grid';

import {StatusChip} from 'components/StatusChip';
import {getColumnProps} from 'components/DataGridLayout';
// import {fetchDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {InvoiceStatus, InvoiceView} from 'models/invoice';
import {formatCurrency} from 'utils/currency';
import {formatDate, toDate} from 'utils/datetime';

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
    | 'warning';
} => {
  switch (status) {
    case InvoiceStatus.PAID:
      return {label: 'Paid', color: 'success'};
    case InvoiceStatus.DRAFT:
      return {label: 'Draft', color: 'default'};
    case InvoiceStatus.EXPIRED:
      return {label: 'Expired', color: 'error'};
    case InvoiceStatus.NOT_PAID:
      return {label: 'Unpaid', color: 'primary'};
    default:
      return {label: '-', color: 'default'};
  }
};

export const columns: GridColDef[] = [
  getColumnProps({
    field: 'date',
    headerName: 'invoice date',
    align: 'center',
    flex: 0.75,
  }),
  getColumnProps({
    field: 'number',
    headerName: 'quotation number',
    align: 'center',
    flex: 0,
  }),
  getColumnProps({
    field: 'amount',
    headerName: 'total amount',
    align: 'right',
    flex: 0.75,
  }),
  getColumnProps({
    field: 'status',
    headerName: 'status',
    align: 'center',
    renderCell: (params: GridRenderCellParams<any, any, any>) => (
      <StatusChip
        label={getInvoiceStatusStyles(params.value).label}
        color={getInvoiceStatusStyles(params.value).color}
        maxChars={8}
      />
    ),
    flex: 0.75,
  }),
];

export const makeRows = (invoices: InvoiceView[]): GridRowsProp =>
  invoices.length
    ? invoices.map((item, index: number) => ({
        id: index,
        date: formatDate(toDate(item.issuedDate)),
        number: item.number,
        order: item.serviceOrder.number,
        customer: item.propertyOwner.name,
        type: item.serviceOrder.type,
        amount: `${formatCurrency(
          item
            ? item.totalAmount.netAmount /
                10 ** item.totalAmount.fractionDigits!
            : 0,
          {
            currency: item.totalAmount.currency,
          },
        )}`,
        status: item.status,
        actions: {
          pdfPath: item.additionalInfo.pdfPath,
          serviceCompanyId: item.serviceCompany.id,
        },
        invoice: item,
        navigateTo: `details/${item.id}`,
      }))
    : [];

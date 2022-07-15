import {GridColDef, GridRenderCellParams, GridRowsProp} from '@mui/x-data-grid';

import {StatusChip} from 'components/StatusChip';
import {ServiceOrderIcons} from 'components/ServiceOrderIcons';
import {ServiceOrderTypeText} from 'components/ServiceOrderTypeText';
import {getColumnProps} from 'components/DataGridLayout';
// import {fetchDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {InvoiceStatus, InvoiceStatusView, InvoiceView} from 'models/invoice';
import {formatCurrency} from 'utils/currency';
import {convertToText} from 'utils/utils';
import {FormatDate} from 'models/misc';
import {toDate} from '../../utils/datetime';
import {Actions} from './Actions';

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
    | 'warning'
    | 'action.active';
} => {
  switch (status) {
    case InvoiceStatus.PAID:
      return {label: InvoiceStatusView.PAID, color: 'success'};
    case InvoiceStatus.DRAFT:
      return {label: InvoiceStatusView.DRAFT, color: 'action.active'};
    case InvoiceStatus.EXPIRED:
      return {label: InvoiceStatusView.EXPIRED, color: 'error'};
    case InvoiceStatus.NOT_PAID:
      return {label: InvoiceStatusView.NOT_PAID, color: 'warning'};
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
    field: 'date',
    headerName: 'invoice date',
    align: 'center',
    flex: 0.75,
  }),
  getColumnProps({
    field: 'order',
    headerName: 'order number',
    align: 'center',
    flex: 0.75,
  }),
  getColumnProps({
    field: 'type',
    headerName: 'service type',
    renderCell: (params: GridRenderCellParams<any, any, any>) => (
      <>
        <ServiceOrderIcons serviceOrderType={params.row.type} size="small" />
        <ServiceOrderTypeText
          serviceOrderType={params.row.type}
          capitalizeText
          variant="body2"
        />
      </>
    ),
  }),
  getColumnProps({
    field: 'invoiceType',
    headerName: 'invoice type',
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
  getColumnProps({
    field: 'actions',
    headerName: 'actions',
    align: 'center',
    renderCell: (params) => <Actions invoice={params.row.invoice} />,
    flex: 0,
  }),
];

export const makeRows = (
  invoices: InvoiceView[],
  formatDate: FormatDate = () => '',
): GridRowsProp =>
  invoices.length
    ? invoices.map((item, index: number) => ({
        id: index,
        subject: item.subject,
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
        invoiceType: convertToText(item.type),
        invoice: item,
        navigateTo: `details/${item.id}`,
      }))
    : [];

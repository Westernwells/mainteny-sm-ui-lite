import {useTranslation} from 'react-i18next';
import {
  GridColDef,
  GridColumnHeaderParams,
  GridRenderCellParams,
  GridRowsProp,
} from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {StatusChip} from 'components/StatusChip';
import {ServiceOrderIcons} from 'components/ServiceOrderIcons';
import {ServiceOrderTypeText} from 'components/ServiceOrderTypeText';
import {getColumnProps} from 'components/DataGridLayout';
import {
  InvoiceOrderField,
  InvoiceStatus,
  InvoiceStatusView,
  InvoiceTypeMap,
  InvoiceView,
} from 'models/invoice';
import {formatCurrency} from 'utils/currency';
import {FormatDate} from 'models/misc';
import {toDate} from '../../utils/datetime';
import {Actions} from './Actions';
import {NotesIndicator} from './NotesIndicator';

export const getInvoiceStatusStyles = (
  status: string,
): {
  label: string;
  color:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'error.light'
    | 'info'
    | 'success'
    | 'warning'
    | 'warning.light'
    | 'action.active'
    | 'primary.mainLight'
    | 'warning.dark';
} => {
  switch (status) {
    case InvoiceStatus.PAID:
      return {label: InvoiceStatusView.PAID, color: 'success'};
    case InvoiceStatus.DRAFT:
      return {label: InvoiceStatusView.DRAFT, color: 'action.active'};
    case InvoiceStatus.EXPIRED:
      return {label: InvoiceStatusView.EXPIRED, color: 'error.light'};
    case InvoiceStatus.NOT_PAID:
      return {label: InvoiceStatusView.NOT_PAID, color: 'primary.mainLight'};
    case InvoiceStatus.PARTIALLY_PAID:
      return {label: InvoiceStatusView.PARTIALLY_PAID, color: 'warning.light'};
    case InvoiceStatus.CANCELLED:
      return {label: InvoiceStatusView.CANCELLED, color: 'warning.dark'};
    default:
      return {label: '-', color: 'default'};
  }
};

export const columns: GridColDef[] = [
  getColumnProps({
    field: InvoiceOrderField.EXTERNAL_ID,
    headerName: 'number',
    align: 'left',
    flex: 0.5,
    sortable: true,
  }),
  getColumnProps({
    field: InvoiceOrderField.CUSTOMER_NAME,
    headerName: 'customer',
    cellClassName: 'truncateText',
    flex: 1.5,
    sortable: true,
  }),
  getColumnProps({
    field: InvoiceOrderField.CREATED_DATE,
    headerName: 'invoice date',
    align: 'left',
    flex: 0.75,
    sortable: true,
  }),
  getColumnProps({
    field: InvoiceOrderField.DUE_DATE,
    headerName: 'due date',
    align: 'left',
    flex: 0.75,
    sortable: true,
  }),
  getColumnProps({
    // TODO: Add proper sorting for job number after backend implementation
    field: 'jobNumber',
    headerName: 'job number',
    align: 'left',
    flex: 0.75,
  }),
  getColumnProps({
    field: InvoiceOrderField.TYPE,
    sortable: true,
    headerName: 'invoice type',
  }),
  getColumnProps({
    field: InvoiceOrderField.SERVICE_ORDER_TYPE,
    sortable: true,
    headerName: 'service type',
    renderCell: (params: GridRenderCellParams<any, any, any>) => (
      <Box display="flex" alignItems="flex-end" gap="0.5rem">
        <ServiceOrderIcons
          serviceOrderType={params.row[InvoiceOrderField.SERVICE_ORDER_TYPE]}
          size="small"
        />
        <ServiceOrderTypeText
          serviceOrderType={params.row[InvoiceOrderField.SERVICE_ORDER_TYPE]}
          capitalizeText
          variant="body2"
        />
      </Box>
    ),
  }),
  getColumnProps({
    field: InvoiceOrderField.TOTAL_NET_AMOUNT,
    sortable: true,
    headerName: 'total amount',
    renderHeader: (params: GridColumnHeaderParams) => {
      const {t} = useTranslation();
      return (
        <Typography variant="subtitle2" color="textSecondary" textAlign="right">
          {t(params?.colDef?.headerName?.toUpperCase?.() ?? '')}
        </Typography>
      );
    },
    align: 'right',
    flex: 0.75,
  }),
  getColumnProps({
    field: InvoiceOrderField.COMMENT_COUNT,
    sortable: true,
    headerName: 'notes',
    align: 'center',
    renderCell: (params) => <NotesIndicator invoice={params.row.invoice} />,
    flex: 0.5,
  }),
  getColumnProps({
    // TODO: Add sorting for status after backend implementation
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
    flex: 0.5,
  }),
  getColumnProps({
    field: 'actions',
    headerName: 'actions',
    align: 'center',
    renderCell: (params) => (
      <Actions
        invoice={params.row.invoice}
        downloadUrl={params.row.downloadUrl}
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
        [InvoiceOrderField.CREATED_DATE]: item.sentDate
          ? formatDate(toDate(item.sentDate))
          : '-',
        [InvoiceOrderField.DUE_DATE]: item.dueDate
          ? formatDate(toDate(item.dueDate))
          : '-',
        [InvoiceOrderField.EXTERNAL_ID]:
          item.externalId !== '' ? item.externalId : 'Unassigned',
        jobNumber: item.serviceOrder?.number,
        [InvoiceOrderField.CUSTOMER_NAME]: item.propertyOwner.name,
        [InvoiceOrderField.TYPE]: InvoiceTypeMap[item.type],
        [InvoiceOrderField.SERVICE_ORDER_TYPE]: item.serviceOrder?.type,
        [InvoiceOrderField.TOTAL_NET_AMOUNT]: `${formatCurrency(
          item
            ? (item.totalAmount?.grossAmount ?? 0) /
                10 ** item.totalAmount.fractionDigits!
            : 0,
          {
            currency: item.totalAmount.currency,
          },
        )}`,
        status: item.status,
        actions: {
          pdfPath: item.additionalInfo.pdfPath,
          serviceCompanyId,
        },
        invoice: item,
        navigateTo: `/invoices/details/${item.id}`,
      }))
    : [];

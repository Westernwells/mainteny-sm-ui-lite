import {
  GridAlignment,
  GridCellClassNamePropType,
  GridColDef,
  GridColumnHeaderParams,
  GridRenderCellParams,
  GridRowsProp,
} from '@mui/x-data-grid';
import Typography from '@mui/material/Typography';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import {StatusChip} from 'components/StatusChip';
import {ServiceOrderIcons} from 'components/ServiceOrderIcons';
import {ServiceOrderTypeText} from 'components/ServiceOrderTypeText';
// import {fetchDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {InvoiceStatus} from 'models/invoice';
import {formatCurrency} from 'utils/currency';
import {formatDate, toDate} from '../../utils/datetime';

const defaultProps = {
  editable: false,
  renderHeader: (params: GridColumnHeaderParams) => (
    <Typography variant="subtitle2" color="textSecondary">
      {params.colDef.headerName}
    </Typography>
  ),
  renderCell: (params: GridRenderCellParams<any, any, any>) => (
    <Typography variant="body2" mx="0.5em">
      {params.value}
    </Typography>
  ),
};
const defaultAlignment: {
  flex: number;
  headerAlign: GridAlignment;
  align: GridAlignment;
  cellClassName: GridCellClassNamePropType;
} = {
  flex: 1,
  headerAlign: 'center',
  align: 'center',
  cellClassName: 'nowrap',
};

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
  {
    field: 'invoiceNumber',
    headerName: 'INVOICE NUMBER',
    type: 'string',
    ...defaultAlignment,
    ...defaultProps,
  },
  {
    field: 'propertyOwner',
    headerName: 'CUSTOMER',
    type: 'string',
    flex: 1.5,
    headerAlign: 'left',
    cellClassName: 'truncateText',
    ...defaultProps,
  },
  {
    field: 'invoiceDate',
    headerName: 'INVOICE DATE',
    type: 'string',
    flex: 1,
    headerAlign: 'left',
    ...defaultProps,
  },

  {
    field: 'orderNumber',
    headerName: 'ORDER NUMBER',
    type: 'string',
    ...defaultAlignment,
    ...defaultProps,
  },

  {
    field: 'serviceType',
    headerName: 'SERVICE TYPE',
    type: 'string',
    flex: 1.5,
    editable: false,
    headerAlign: 'left',
    renderHeader: (params: GridColumnHeaderParams) => (
      <Typography variant="subtitle2" color="textSecondary">
        {params.colDef.headerName}
      </Typography>
    ),
    renderCell: (params: GridRenderCellParams<any, any, any>) => (
      <>
        <ServiceOrderIcons
          serviceOrderType={params.row.serviceType}
          size="small"
        />
        <ServiceOrderTypeText
          serviceOrderType={params.row.serviceType}
          capitalizeText
          variant="body2"
        />
      </>
    ),
  },
  {
    field: 'amount',
    headerName: 'TOTAL AMOUNT',
    type: 'string',
    ...defaultAlignment,
    ...defaultProps,
  },
  {
    field: 'status',
    headerName: 'STATUS',
    type: 'string',
    ...defaultAlignment,
    editable: false,
    renderHeader: (params: GridColumnHeaderParams) => (
      <Typography variant="subtitle2" color="textSecondary">
        {params.colDef.headerName}
      </Typography>
    ),
    renderCell: (params: GridRenderCellParams<any, any, any>) => (
      <StatusChip
        label={getInvoiceStatusStyles(params.value).label}
        color={getInvoiceStatusStyles(params.value).color}
        maxChars={8}
      />
    ),
  },
  {
    field: 'actions',
    headerName: 'ACTIONS',
    editable: false,
    sortable: false,
    disableColumnMenu: true,
    disableExport: true,
    ...defaultAlignment,

    renderHeader: (params) => (
      <Typography variant="subtitle2" color="textSecondary">
        {params.colDef.headerName}
      </Typography>
    ),
    renderCell: () => (
      <FileDownloadOutlinedIcon
        sx={{color: 'action.active'}}
        onClick={() =>
          window.open(
            `${process.env.REACT_APP_BASE_URL}/INV000128.pdf`,
            '_blank',
          )
        }
      />
    ),
  },
];

export const makeRows = (invoices: any): GridRowsProp =>
  invoices.data
    ? invoices.data.map((item: any, index: number) => ({
        id: index,
        invoiceDate: formatDate(toDate(item.issuedDate)),
        invoiceNumber: item.number,
        orderNumber: item.serviceOrder.number,
        propertyOwner: item.propertyOwner.name,
        serviceType: item.serviceOrder.type,
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
        navigateTo: `details/${item.id}`,
      }))
    : console.error('No Data');

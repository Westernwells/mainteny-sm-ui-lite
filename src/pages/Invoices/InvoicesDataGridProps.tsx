import {
  GridAlignment,
  GridColDef,
  GridColumnHeaderParams,
  GridRenderCellParams,
  GridRowsProp,
} from '@mui/x-data-grid';
import useTheme from '@mui/material/styles/useTheme';
import Typography from '@mui/material/Typography';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import {StatusChip} from 'components/StatusChip';
// import {fetchDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {InvoiceStatus, InvoiceStatusView} from 'models/invoice';
import {formatDate, toDate} from '../../utils/datetime';

const defaultProps = {
  editable: false,
  renderHeader: (params: GridColumnHeaderParams) => (
    <Typography variant="subtitle2">{params.colDef.headerName}</Typography>
  ),
  renderCell: (params: GridRenderCellParams<any, any, any>) => (
    <Typography variant="subtitle2">{params.value}</Typography>
  ),
};
const defaultAlignment: {
  flex: number;
  headerAlign: GridAlignment;
  align: GridAlignment;
} = {
  flex: 1,
  headerAlign: 'center',
  align: 'center',
};

export const columns: GridColDef[] = [
  {
    field: 'invoiceDate',
    headerName: 'INVOICE DATE',
    type: 'string',
    flex: 2,
    headerAlign: 'left',
    ...defaultProps,
  },
  {
    field: 'invoiceNumber',
    headerName: 'INVOICE NUMBER',
    type: 'string',
    ...defaultAlignment,
    ...defaultProps,
  },
  {
    field: 'serviceCompany',
    headerName: 'SERVICE COMPANY',
    type: 'string',
    flex: 1.5,
    ...defaultProps,
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
      <Typography variant="subtitle2">{params.colDef.headerName}</Typography>
    ),
    renderCell: (params: GridRenderCellParams<any, any, any>) => {
      const theme = useTheme();
      return (
        <StatusChip
          label={
            params.value === InvoiceStatus.PAID
              ? InvoiceStatusView.PAID
              : InvoiceStatusView.NOT_PAID
          }
          bgColor={
            params.value === InvoiceStatus.PAID
              ? theme.palette.success.main
              : theme.state?.ratingActive
          }
        />
      );
    },
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
      <Typography variant="subtitle2">{params.colDef.headerName}</Typography>
    ),
    renderCell: () => (
      <FileDownloadOutlinedIcon
        sx={{color: '#2196F3'}}
        // onClick={async () => {
        //   const downloadUrls = await fetchDownloadUrl(
        //     params.value.pdfPath,
        //     params.value.serviceCompanyId,
        //   );
        //   const downloadUrlPaths = downloadUrls[params.value.pdfPath];
        //   if (downloadUrlPaths) {
        //     window.open(downloadUrlPaths, '_self');
        //   }
        // }}
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
        invoiceDate: formatDate(toDate(item.issuedDate), 'dd MMM YYY'),
        invoiceNumber: item.number,
        serviceCompany: item.serviceCompany.name,
        amount: `${item.totalAmount.amount} ${item.totalAmount.currency}`,
        status: item.status,
        actions: {
          pdfPath: item.additionalInfo.pdfPath,
          serviceCompanyId: item.serviceCompany.id,
        },
        navigateTo: `/invoices/${item.id}`,
      }))
    : console.error('No Data');

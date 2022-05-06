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
import {convertToText} from 'utils/utils';
// import {fetchDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {InvoiceStatus, InvoiceStatusView} from 'models/invoice';
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
    flex: 1,
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
  // {
  //   field: 'orderNumber',
  //   headerName: 'ORDER NUMBER',
  //   type: 'string',// TODO: Add this when api gets updated
  //   ...defaultAlignment,
  //   ...defaultProps,
  // },
  {
    field: 'propertyOwner',
    headerName: 'CUSTOMER',
    type: 'string',
    flex: 1.5,
    headerAlign: 'left',
    ...defaultProps,
  },
  // {    // TODO: Add this when api gets updated
  //   field: 'serviceType',
  //   headerName: 'SERVICE TYPE',
  //   type: 'string',
  //   flex: 1,
  //   editable: false,
  //   renderHeader: (params: GridColumnHeaderParams) => (
  //     <Typography variant="subtitle2" color="textSecondary">
  //       {params.colDef.headerName}
  //     </Typography>
  //   ),
  //   renderCell: (params: GridRenderCellParams<any, any, any>) => {
  //     switch (params.value) {
  //       case 'REGULAR':
  //         return (
  //           <Typography
  //             variant="body2"
  //             mx="0.5em"
  //             display="flex"
  //             alignItems="center"
  //             gap=".5em">
  //             <RegularIcon /> Maintenance
  //           </Typography>
  //         );
  //       case 'REPAIR':
  //         return (
  //           <Typography
  //             variant="body2"
  //             mx="0.5em"
  //             display="flex"
  //             alignItems="center">
  //             <SettingsOutlinedIcon sx={{color: '#ED6C02'}} /> Repair
  //           </Typography>
  //         );
  //       case 'EMERGENCY':
  //         return (
  //           <Typography variant="body2" mx="0.5em">
  //             <EmergencyIcon /> Emergency
  //           </Typography>
  //         );
  //       case 'CALLOUT':
  //         return (
  //           <Typography variant="body2" mx="0.5em">
  //             <CalloutIcon /> Callout
  //           </Typography>
  //         );
  //       default:
  //         return (
  //           <Typography variant="body2" mx="0.5em">
  //             {' '}
  //             -{' '}
  //           </Typography>
  //         );
  //     }
  //   },
  // },
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
    renderCell: (params: GridRenderCellParams<any, any, any>) => {
      const theme = useTheme();
      return (
        <StatusChip
          label={
            params.value === InvoiceStatus.PAID
              ? convertToText(InvoiceStatusView.PAID)
              : convertToText(InvoiceStatusView.NOT_PAID)
          }
          style={{
            color:
              params.value === InvoiceStatus.PAID
                ? theme.palette.success.main
                : (theme.state.ratingActive),
          }}
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
      <Typography variant="subtitle2" color="textSecondary">
        {params.colDef.headerName}
      </Typography>
    ),
    renderCell: () => (
      <FileDownloadOutlinedIcon
        sx={{color: '#2196F3'}}
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
        // orderNumber: item.serviceOrder.number,
        propertyOwner: item.propertyOwner.name,
        // serviceType: item.serviceOrder.type,
        amount: `${formatCurrency(
          item
            ? item.totalAmount.amount / 10 ** item.totalAmount.fractionDigits!
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

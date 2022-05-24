import {
  GridAlignment,
  GridColDef,
  GridColumnHeaderParams,
  GridRenderCellParams,
  GridRowsProp,
} from '@mui/x-data-grid';
import Typography from '@mui/material/Typography';
import {StatusChip} from 'components/StatusChip';
import {formatDate} from 'utils/datetime';
import {formatCurrency} from 'utils/currency';
import {QuotationStatus, QuotationView} from 'models/quotation';
import {Resource} from 'models/misc';
import {Actions} from './Actions';

const defaultProps = {
  editable: false,
  renderHeader: (params: GridColumnHeaderParams) => (
    <Typography variant="tableHeaderText" color="textSecondary">
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

const getQuotationStatusStyles = (
  status: string,
): {
  label: string;
  color: 'success' | 'warning' | 'error' | 'info' | 'default';
} => {
  switch (status) {
    case QuotationStatus.ACCEPTED:
      return {label: 'Accepted', color: 'warning'};
    case QuotationStatus.DRAFT:
      return {label: 'Draft', color: 'default'};
    case QuotationStatus.REJECTED:
      return {label: 'Denied', color: 'error'};
    case QuotationStatus.SENT_TO_CLIENT:
      return {label: 'Sent', color: 'success'};
    default:
      return {label: '-', color: 'default'};
  }
};

export const columns: GridColDef[] = [
  {
    field: 'number',
    headerName: 'QUOTATION NO',
    type: 'string',
    ...defaultAlignment,
    ...defaultProps,
  },
  {
    field: 'customer',
    headerName: 'CUSTOMER NAME',
    type: 'string',
    sortable: false,
    flex: 2,
    headerAlign: 'left',
    ...defaultProps,
  },
  {
    field: 'address',
    headerName: 'ADDRESS',
    type: 'string',
    sortable: false,
    flex: 3,
    headerAlign: 'left',
    ...defaultProps,
  },
  {
    field: 'createdDate',
    headerName: 'CREATED DATE',
    type: 'string',
    ...defaultAlignment,
    ...defaultProps,
  },
  {
    field: 'amount',
    headerName: 'TOTAL PRICE',
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
    sortable: false,
    renderHeader: (params: GridColumnHeaderParams) => (
      <Typography variant="tableHeaderText" color="textSecondary">
        {params.colDef.headerName}
      </Typography>
    ),
    renderCell: (params: GridRenderCellParams<any, any, any>) => (
      <StatusChip
        label={getQuotationStatusStyles(params.value).label}
        color={getQuotationStatusStyles(params.value).color}
        variant="filled"
        maxChars={9}
      />
    ),
  },
  {
    field: 'actions',
    headerName: 'ACTIONS',
    // TODO: Actions not working as expected
    // type: 'actions',
    // getActions: (params: GridRowParams) => [
    //   <GridActionsCellItem
    //     icon={<FileDownloadOutlinedIcon sx={{color: '#2196F3'}} />}
    //     onClick={() => console.log('ACTION: Click', params.id)}
    //     label="Download"
    //   />,
    // ],
    editable: false,
    sortable: false,
    disableColumnMenu: true,
    disableExport: true,
    ...defaultAlignment,

    renderHeader: (params) => (
      <Typography variant="tableHeaderText" color="textSecondary">
        {params.colDef.headerName}
      </Typography>
    ),
    renderCell: (params) => <Actions status={params.row.status} />,
  },
];

export const makeRows = (quotations: Resource<QuotationView>): GridRowsProp =>
  quotations &&
  quotations.data.map((item: QuotationView, index: number) => ({
    id: index,
    number: item.number,
    customer: item.elevator.propertyOwner.name,
    address: item.elevator.propertyOwner.address.fullName,
    createdDate: formatDate(item.meta.createdAt),
    amount: `${formatCurrency(
      item
        ? item.totalAmount.netAmount / 10 ** item.totalAmount.fractionDigits!
        : 0,
      {
        currency: item.totalAmount.currency,
      },
    )}`,
    status: item.status,
    navigateTo: `details/${item.id}`,
  }));

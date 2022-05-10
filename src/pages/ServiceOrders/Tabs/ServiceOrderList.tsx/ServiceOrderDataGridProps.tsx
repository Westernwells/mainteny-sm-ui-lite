import {
  GridAlignment,
  GridColDef,
  GridColumnHeaderParams,
  GridRenderCellParams,
  GridRowsProp,
} from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {ServiceOrderView} from 'models/service-order';
import {convertToText} from 'utils/utils';
import {
  getServiceOrderStatusColor,
  serviceOrderStatusToString,
} from 'utils/service-order-utils';
import {ServiceOrderIcons} from 'components/ServiceOrderIcons';
import {StatusChip} from 'components/StatusChip';
import {olStyles as sx} from './styles';

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
  headerAlign: 'left',
  align: 'left',
};

export const columns: GridColDef[] = [
  {
    field: 'orderType',
    headerName: 'ORDER TYPE',
    type: 'string',
    ...defaultAlignment,
    ...defaultProps,
    renderCell: (params: GridRenderCellParams<any, any, any>) => (
      <Box sx={{display: 'flex'}}>
        <ServiceOrderIcons
          serviceOrderType={params.value}
          size="small"
          // style={{mt: '0.05em', height: '1.145rem', width: '0.989rem'}}
        />
        <Typography variant="body2" mx="0.5em">
          {convertToText(params.value)}
        </Typography>
      </Box>
    ),
  },
  {
    field: 'customer',
    headerName: 'CUSTOMER',
    type: 'string',
    ...defaultAlignment,
    ...defaultProps,
    flex: 2,
  },
  {
    field: 'address',
    headerName: 'ADDRESS',
    type: 'string',
    ...defaultAlignment,
    ...defaultProps,
    flex: 2,
  },
  {
    field: 'unitId',
    headerName: 'UNIT ID',
    type: 'number',
    ...defaultAlignment,
    ...defaultProps,
    headerAlign: 'center',
    align: 'center',
  },

  {
    field: 'dueDate',
    headerName: 'DUE DATE',
    type: 'number',
    ...defaultAlignment,
    ...defaultProps,
  },

  {
    field: 'technician',
    headerName: 'TECHNICIAN',
    type: 'number',
    ...defaultAlignment,
    ...defaultProps,
    flex: 2,
    headerAlign: 'center',
    align: 'center',
  },
  {
    field: 'status',
    headerName: 'STATUS',
    type: 'number',
    ...defaultAlignment,
    ...defaultProps,
    editable: false,
    sortable: false,
    disableColumnMenu: true,
    renderCell: (params: GridRenderCellParams<any, any, any>) => (
      <StatusChip
        color={getServiceOrderStatusColor(params.value)}
        style={sx.orderStatus}
        label={serviceOrderStatusToString(params.value)}
      />
    ),
  },
];

export const makeRows = (serviceOrders: ServiceOrderView[]): GridRowsProp =>
  serviceOrders.map((item: ServiceOrderView, index: number) => ({
    id: index,
    orderType: item.type,
    customer: item.elevator.propertyOwner.name,
    address: item.elevator.address.fullName || '-',
    unitId: item.elevator.number,
    dueDate: item.dueDate,
    technician: item.schedules.length
      ? item.schedules
          .map(
            (x) =>
              `${x.technician.userAccount.firstName} ${x.technician.userAccount.lastName}`,
          )
          .join(',')
      : '-',
    status: item.status,
    navigateTo: `details/${item.id}`,
  }));

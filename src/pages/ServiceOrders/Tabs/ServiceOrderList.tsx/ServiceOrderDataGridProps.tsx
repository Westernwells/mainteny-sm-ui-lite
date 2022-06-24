import {GridColDef, GridRenderCellParams, GridRowsProp} from '@mui/x-data-grid';
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
import {getColumnProps} from 'components/DataGridLayout';
import {olStyles} from 'styles';

export const columns: GridColDef[] = [
  getColumnProps({
    field: 'number',
    headerName: 'number',
    align: 'center',
    flex: 0,
  }),
  getColumnProps({
    field: 'customer',
    headerName: 'customer',
    cellClassName: 'truncateText',
    flex: 1.5,
  }),
  getColumnProps({
    field: 'address',
    headerName: 'address',
    cellClassName: 'truncateText',
    flex: 1.5,
  }),
  getColumnProps({
    field: 'unit',
    headerName: 'unit number',
    align: 'center',
    flex: 0.75,
  }),
  getColumnProps({
    field: 'date',
    headerName: 'due date',
    align: 'center',
    flex: 0.75,
  }),
  getColumnProps({
    field: 'technician',
    headerName: 'technician',
  }),
  getColumnProps({
    field: 'type',
    headerName: 'order type',
    renderCell: (params: GridRenderCellParams<any, any, any>) => (
      <Box sx={{display: 'flex'}}>
        <ServiceOrderIcons serviceOrderType={params.value} size="small" />
        <Typography variant="body2" mx="0.5em">
          {convertToText(params.value)}
        </Typography>
      </Box>
    ),
  }),
  getColumnProps({
    field: 'status',
    headerName: 'status',
    align: 'center',
    renderCell: (params: GridRenderCellParams<any, any, any>) => (
      <StatusChip
        color={getServiceOrderStatusColor(params.value)}
        style={olStyles.orderStatus}
        label={serviceOrderStatusToString(params.value)}
        variant="filled"
      />
    ),
    flex: 0.75,
  }),
];

export const makeRows = (serviceOrders: ServiceOrderView[]): GridRowsProp =>
  serviceOrders.map((item: ServiceOrderView, index: number) => ({
    id: index,
    number: item.number,
    type: item.type,
    customer: item.elevator.propertyOwner.name,
    address: item.elevator.address.fullName || '-',
    unit: item.elevator.number,
    date: item.dueDate,
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

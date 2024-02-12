import {GridColDef, GridRenderCellParams, GridRowsProp} from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import {
  ServiceOrderOrderField,
  ServiceOrderPaymentStatus,
  ServiceOrderView,
} from 'models/service-order';
import {
  getServiceOrderStatusColor,
  serviceOrderPaymentStatusToString,
  serviceOrderStatusToString,
  serviceOrderTypeToString,
} from 'utils/service-order-utils';
import {useTranslation} from 'react-i18next';
import {ServiceOrderIcons} from 'components/ServiceOrderIcons';
import {StatusChip} from 'components/StatusChip';
import {getColumnProps} from 'components/DataGridLayout';
import {olStyles} from 'styles';
import {Typography} from '@mui/material';
import {FormatDate} from 'models/misc';
import {toDate} from 'utils/datetime';

export const getServiceOrderPaymentStatusStyles = (
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
    | 'primary.mainLight'
    | 'action.active'
    | 'warning'
    | 'warning.dark'
    | 'warning.light'
    | 'info.light';
} => {
  switch (status) {
    case ServiceOrderPaymentStatus.PAID:
      return {label: 'Paid', color: 'success'};
    case ServiceOrderPaymentStatus.NOT_PAID:
      return {label: 'Not Paid', color: 'warning'};
    case ServiceOrderPaymentStatus.PARTIALLY_PAID:
      return {label: 'Partially Paid', color: 'warning.light'};
    case ServiceOrderPaymentStatus.AUTO_GENERATED:
      return {label: 'Auto Generated', color: 'primary.mainLight'};
    case ServiceOrderPaymentStatus.NOT_SENT:
      return {label: 'Not Sent', color: 'info'};
    case ServiceOrderPaymentStatus.NONE:
      return {label: 'No Invoice', color: 'info.light'};
    default:
      return {label: '-', color: 'info.light'};
  }
};

export const columns: GridColDef[] = [
  getColumnProps({
    field: 'number',
    headerName: 'number',
    flex: 0.5,
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
    align: 'right',
    headerAlign: 'right',
    flex: 1,
  }),
  getColumnProps({
    field: ServiceOrderOrderField.DUE_DATE,
    headerName: 'due date',
    align: 'center',
    flex: 0.75,
    sortable: true,
  }),
  getColumnProps({
    field: 'technician',
    headerName: 'technician',
  }),
  getColumnProps({
    field: 'type',
    headerName: 'job type',
    renderCell: (params: GridRenderCellParams<any, any, any>) => {
      const {t} = useTranslation();
      return (
        <Box sx={{display: 'flex'}}>
          <ServiceOrderIcons serviceOrderType={params.value} size="small" />
          <Typography variant="body2" sx={{paddingLeft: '0.4em'}}>
            {t(serviceOrderTypeToString(params.value))}
          </Typography>
        </Box>
      );
    },
  }),
  getColumnProps({
    field: 'paymentStatus',
    headerName: 'payment status',
    align: 'center',
    renderCell: (params: GridRenderCellParams<any, any, any>) => {
      const {t} = useTranslation();
      return (
        <Box sx={{display: 'flex'}}>
          <Typography variant="body2">
            {t(serviceOrderPaymentStatusToString(params.value))}
          </Typography>
        </Box>
      );
    },
  }),
  getColumnProps({
    field: 'status',
    headerName: 'job status',
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

export const makeRows = (
  serviceOrders: ServiceOrderView[],
  formatDate: FormatDate = () => '',
): GridRowsProp =>
  serviceOrders.map((item: ServiceOrderView, index: number) => ({
    id: index,
    [ServiceOrderOrderField.DUE_DATE]: item.dueDate
      ? formatDate(toDate(item.dueDate))
      : '-',
    number: item.number,
    type: item.type,
    customer: item.elevator.propertyOwner.name,
    address: item.elevator.address.fullName || '-',
    unit: item.elevator.externalId || '-',
    date: formatDate(item.dueDate),
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
    paymentStatus: item.additionalInfo.paymentStatus,
  }));

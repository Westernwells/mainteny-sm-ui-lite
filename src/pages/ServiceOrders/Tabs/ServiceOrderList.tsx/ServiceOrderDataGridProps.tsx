import {GridColDef, GridRenderCellParams, GridRowsProp} from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import {
  ServiceOrderOrderField,
  ServiceOrderPaymentStatus,
  ServiceOrderPaymentWithIndicationStatus,
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
import {theme} from 'theme';
import {StatusColor} from '../../../../models/status';

export const getServiceOrderPaymentStatusStyles = (
  status: string,
): {
  label: string;
  color: StatusColor;
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
    field: ServiceOrderOrderField.EXTERNAL_ID,
    sortable: true,
    headerName: 'number',
    flex: 0.5,
  }),
  getColumnProps({
    field: ServiceOrderOrderField.PROPERTY_OWNER_NAME,
    headerName: 'customer',
    cellClassName: 'truncateText',
    flex: 1.5,
    sortable: true,
  }),
  getColumnProps({
    field: ServiceOrderOrderField.ELEVATOR_ADDRESS,
    sortable: true,
    headerName: 'address',
    cellClassName: 'truncateText',
    flex: 1.5,
  }),
  getColumnProps({
    field: ServiceOrderOrderField.ELEVATOR_EXTERNAL_ID,
    sortable: true,
    headerName: 'unit number',
    align: 'center',
    headerAlign: 'center',
    flex: 1,
  }),
  getColumnProps({
    field: ServiceOrderOrderField.DUE_DATE,
    headerName: 'due date',
    align: 'center',
    sortable: true,
  }),
  getColumnProps({
    field: ServiceOrderOrderField.TECHNICIAN_NAME,
    headerName: 'technician',
    sortable: true,
  }),
  getColumnProps({
    field: ServiceOrderOrderField.JOB_TYPE,
    sortable: true,
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
    field: ServiceOrderOrderField.PAYMENT_STATUS,
    sortable: true,
    headerName: 'payment status',
    align: 'center',
    renderCell: (
      params: GridRenderCellParams<
        ServiceOrderPaymentStatus | ServiceOrderPaymentWithIndicationStatus
      >,
    ) => {
      const {t} = useTranslation();
      const {value} = params;
      const showIndicator =
        value ===
        ServiceOrderPaymentWithIndicationStatus.AUTO_GENERATED_ADDITIONAL_INVOICE_NOT_SEND;

      return (
        <Box sx={{display: 'flex', alignItems: 'center'}}>
          {showIndicator ? (
            <Tooltip
              title={t(
                `This job contains articles that haven’t been invoiced yet. Check the job details for more information.`,
              )}
              placement="top"
              arrow>
              <WarningAmberIcon
                sx={{mr: '0.2em', color: theme.palette.text.secondary}}
              />
            </Tooltip>
          ) : null}
          <Typography variant="body2">
            {t(serviceOrderPaymentStatusToString(value))}
          </Typography>
        </Box>
      );
    },
  }),
  getColumnProps({
    field: ServiceOrderOrderField.JOB_STATUS,
    sortable: true,
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

const getTechnicianFullName = (item: ServiceOrderView) => {
  if (item.schedules.length) {
    return item.schedules
      .map(
        (x) =>
          `${x.technician.userAccount.firstName} ${x.technician.userAccount.lastName}`,
      )
      .join(',');
  }
  if (item?.additionalInfo?.candidateTechnician) {
    return `${item?.additionalInfo?.candidateTechnician?.userAccount.firstName} ${item?.additionalInfo?.candidateTechnician?.userAccount.lastName}`;
  }
  return '-';
};

export const makeRows = (
  serviceOrders: ServiceOrderView[],
  formatDate: FormatDate = () => '',
): GridRowsProp =>
  serviceOrders.map((item: ServiceOrderView, index: number) => ({
    id: index,
    [ServiceOrderOrderField.DUE_DATE]: item.dueDate
      ? formatDate(toDate(item.dueDate))
      : '-',
    [ServiceOrderOrderField.PROPERTY_OWNER_NAME]:
      item.elevator.propertyOwner.name,
    [ServiceOrderOrderField.EXTERNAL_ID]: item.number,
    [ServiceOrderOrderField.JOB_TYPE]: item.type,
    customer: item.elevator.propertyOwner.name,
    [ServiceOrderOrderField.ELEVATOR_ADDRESS]:
      item.elevator.address.fullName || '-',
    [ServiceOrderOrderField.ELEVATOR_EXTERNAL_ID]:
      item.elevator.externalId || '-',
    date: formatDate(item.dueDate),
    [ServiceOrderOrderField.TECHNICIAN_NAME]: getTechnicianFullName(item),
    [ServiceOrderOrderField.JOB_STATUS]: item.status,
    navigateTo: `details/${item.id}`,
    [ServiceOrderOrderField.PAYMENT_STATUS]: item.additionalInfo.paymentStatus,
  }));

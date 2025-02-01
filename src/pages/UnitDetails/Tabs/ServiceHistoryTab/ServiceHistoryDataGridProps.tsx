import {GridColDef, GridRenderCellParams, GridRowsProp} from '@mui/x-data-grid';
import {StatusChip} from 'components/StatusChip';
import {ServiceOrderIcons} from 'components/ServiceOrderIcons';
import {ServiceOrderTypeText} from 'components/ServiceOrderTypeText';
import {getColumnProps} from 'components/DataGridLayout';
import {ServiceOrderView} from 'models/service-order';
import {
  getServiceOrderStatusColor,
  serviceOrderStatusToString,
} from 'utils/service-order-utils';
import {FormatDate} from 'models/misc';
import {convertMinsToHM, toDate} from 'utils/datetime';
import {getUserFullName} from 'utils/utils';

export const columns: GridColDef[] = [
  getColumnProps({
    field: 'number',
    headerName: 'number',
    align: 'center',
    flex: 0,
  }),
  getColumnProps({
    field: 'date',
    headerName: 'creation date',
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
    field: 'engineer',
    headerName: 'engineer',
    cellClassName: 'truncateText',
    flex: 1.5,
  }),
  getColumnProps({
    field: 'duration',
    headerName: 'duration',
    flex: 0.75,
  }),
  getColumnProps({
    field: 'status',
    headerName: 'status',
    align: 'center',
    renderCell: (params: GridRenderCellParams<any, any, any>) => (
      <StatusChip
        color={getServiceOrderStatusColor(params.value)}
        label={serviceOrderStatusToString(params.value)}
      />
    ),
    flex: 0.75,
  }),
];

export const makeRows = (
  serviceOrders: ServiceOrderView[],
  formatDate: FormatDate = () => '',
): GridRowsProp =>
  serviceOrders.length
    ? serviceOrders.map((item, index: number) => {
        const schedules =
          item.schedules.filter((scheduleItem) => !!scheduleItem.technician) ??
          [];

        return {
          id: index,
          number: item.number,
          date: formatDate(toDate(item.meta.createdAt)),
          type: item.type,
          engineer: schedules.length
            ? schedules
                .filter((scheduleItem) => !!scheduleItem.technician)
                .map((i) => getUserFullName(i.technician!.userAccount))
                .join(', ')
            : '-',
          duration: item.serviceTime && convertMinsToHM(item.serviceTime),
          status: item.status,
          navigateTo: `/orders/details/${item.id}`,
        };
      })
    : [];

import {differenceInMinutes} from 'date-fns';
import {ServiceOrderStatus, ServiceOrderView} from 'models/service-order';
import {toDate} from './datetime';

export const getServiceOrderStatusColor = (status: ServiceOrderStatus) => {
  switch (status) {
    case ServiceOrderStatus.SCHEDULED:
      return 'primary';
    case ServiceOrderStatus.IN_PROGRESS:
      return 'warning';
    case ServiceOrderStatus.CANCELLED:
      return 'error';
    case ServiceOrderStatus.EXPIRED:
      return 'error';
    case ServiceOrderStatus.COMPLETED:
      return 'success';
    default:
      return 'default';
  }
};

export const serviceOrderStatusToString = (status: ServiceOrderStatus) => {
  switch (status) {
    case ServiceOrderStatus.SCHEDULED:
      return 'Pending';
    case ServiceOrderStatus.IN_PROGRESS:
      return 'Ongoing';
    case ServiceOrderStatus.CANCELLED:
      return 'Cancelled';
    case ServiceOrderStatus.EXPIRED:
      return 'Expired';
    case ServiceOrderStatus.COMPLETED:
      return 'Completed';
    default:
      return 'Unscheduled';
  }
};

export const serviceOrderStatusToEnum = (status: string) => {
  switch (status) {
    case 'Pending':
      return ServiceOrderStatus.SCHEDULED;
    case 'Ongoing':
      return ServiceOrderStatus.IN_PROGRESS;
    case 'Cancelled':
      return ServiceOrderStatus.CANCELLED;
    case 'Expired':
      return ServiceOrderStatus.EXPIRED;
    case 'Completed':
      return ServiceOrderStatus.COMPLETED;
    default:
      return 'Unscheduled';
  }
};

export const sortOrderByTime = (serviceOrder: ServiceOrderView[]) => {
  const res = serviceOrder.sort((a, b) =>
    differenceInMinutes(
      toDate(a.schedules[0].startTime),
      toDate(b.schedules[0].startTime),
    ),
  );
  return res;
};

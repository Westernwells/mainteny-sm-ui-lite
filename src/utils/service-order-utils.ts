import {ServiceOrderStatus} from 'models/service-order';

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

export const getServiceOrderStatusText = (status: ServiceOrderStatus) => {
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

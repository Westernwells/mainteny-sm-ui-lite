import useTheme from '@mui/material/styles/useTheme';
import {ActivityMessageType} from 'models/service-company';

export const getFieldActivityTitle = (type: ActivityMessageType): string => {
  switch (type) {
    case ActivityMessageType.SERVICE_ORDER_COMPLETED:
      return 'Completed';
    case ActivityMessageType.SERVICE_ORDER_SCHEDULED:
      return 'Rescheduled';
    case ActivityMessageType.SERVICE_ORDER_CANCELLED:
      return 'Cancelled';
    case ActivityMessageType.SERVICE_ORDER_STARTED:
      return 'Started';
    case ActivityMessageType.SERVICE_ORDER_NO_ASSIGNMENT:
      return 'No Assignment';
    case ActivityMessageType.SERVICE_ORDER_UNSCHEDULED:
    case ActivityMessageType.SERVICE_ORDER_UPDATED:
    case ActivityMessageType.SERVICE_ORDER_EXPIRED:
    case ActivityMessageType.SERVICE_ORDER_TIME_EDITED:
      return 'Edited';
    default:
      return '';
  }
};

export const getFieldActivityColor = (type: ActivityMessageType): string => {
  const theme = useTheme();
  switch (type) {
    case ActivityMessageType.SERVICE_ORDER_COMPLETED:
      return theme.palette.success.main;
    case ActivityMessageType.SERVICE_ORDER_SCHEDULED:
      return theme.palette.warning.main;
    case ActivityMessageType.SERVICE_ORDER_CANCELLED:
      return theme.palette.error.main;
    case ActivityMessageType.SERVICE_ORDER_STARTED:
      return theme.palette.secondary.main;
    case ActivityMessageType.SERVICE_ORDER_NO_ASSIGNMENT:
      return theme.palette.primary.light;
    case ActivityMessageType.SERVICE_ORDER_UNSCHEDULED:
    case ActivityMessageType.SERVICE_ORDER_UPDATED:
    case ActivityMessageType.SERVICE_ORDER_EXPIRED:
    case ActivityMessageType.SERVICE_ORDER_TIME_EDITED:
      return theme.palette.warning.light;
    default:
      return '';
  }
};

import {addMinutes, differenceInMinutes} from 'date-fns';
import _ from 'lodash';
import {amber, grey} from '@mui/material/colors';
import {
  ServiceOrderArticleView,
  ServiceOrderPaymentStatus,
  ServiceOrderReportTimeRecord,
  ServiceOrderStatus,
  ServiceOrderType,
  ServiceOrderView,
} from '../models/service-order';
import {toDate, toRestDateTime} from './datetime';
import {theme} from '../theme';

export const getServiceOrderStatusColor = (status: ServiceOrderStatus) => {
  switch (status) {
    case ServiceOrderStatus.SCHEDULING:
      return 'secondary';
    case ServiceOrderStatus.SCHEDULED:
      return 'primary.mainLight';
    case ServiceOrderStatus.IN_PROGRESS:
      return 'warning.light';
    case ServiceOrderStatus.CANCELLED:
      return 'action.active';
    case ServiceOrderStatus.OVERDUE:
      return 'error';
    case ServiceOrderStatus.COMPLETED:
      return 'success';
    default:
      return 'default';
  }
};

export const serviceOrderStatusToString = (status: ServiceOrderStatus) => {
  switch (status) {
    case ServiceOrderStatus.READY_TO_SCHEDULE:
      return 'Unscheduled';
    case ServiceOrderStatus.SCHEDULING:
      return 'Scheduling';
    case ServiceOrderStatus.SCHEDULED:
      return 'Pending';
    case ServiceOrderStatus.IN_PROGRESS:
      return 'Ongoing';
    case ServiceOrderStatus.CANCELLED:
      return 'Cancelled';
    case ServiceOrderStatus.OVERDUE:
      return 'Overdue';
    case ServiceOrderStatus.COMPLETED:
      return 'Completed';
    default:
      return 'Unscheduled';
  }
};

export const serviceOrderStatusToEnum = (status: string) => {
  switch (status) {
    case 'Unscheduled':
      return ServiceOrderStatus.READY_TO_SCHEDULE;
    case 'Scheduling':
      return ServiceOrderStatus.SCHEDULING;
    case 'Pending':
      return ServiceOrderStatus.SCHEDULED;
    case 'Ongoing':
      return ServiceOrderStatus.IN_PROGRESS;
    case 'Cancelled':
      return ServiceOrderStatus.CANCELLED;
    case 'Overdue':
      return ServiceOrderStatus.OVERDUE;
    case 'Completed':
      return ServiceOrderStatus.COMPLETED;
    default:
      return ServiceOrderStatus.INIT;
  }
};

export enum ServiceOrderPaymentStatusView {
  PAID = 'Paid',
  NOT_PAID = 'Not Paid',
  AUTO_GENERATED = 'Auto Generated',
  PARTIALLY_PAID = 'Partially Paid',
  NONE = 'None',
}

export const getServiceOrderStatusList = () => {
  let mappedOptions: string[] = [];
  Object.values(ServiceOrderStatus).forEach((option) => {
    const val = serviceOrderStatusToString(option);
    if (!mappedOptions.includes(val)) {
      mappedOptions = [...mappedOptions, val];
    }
  });
  return mappedOptions;
};

export const getSelectedOrderStatuses = (
  items: string[],
  includeScheduling: Boolean = true,
) => {
  let selectedOrderStatuses: ServiceOrderStatus[] = [];
  items.forEach((val) => {
    if (val === 'Unscheduled') {
      selectedOrderStatuses = [
        ...selectedOrderStatuses,
        ServiceOrderStatus.INIT,
        ServiceOrderStatus.READY_TO_SCHEDULE,
        ...(includeScheduling ? [ServiceOrderStatus.SCHEDULING] : []),
      ];
    } else {
      selectedOrderStatuses = [
        ...selectedOrderStatuses,
        serviceOrderStatusToEnum(val) as ServiceOrderStatus,
      ];
    }
  });
  if (selectedOrderStatuses.includes(ServiceOrderStatus.ALL)) {
    selectedOrderStatuses = [];
  }
  return selectedOrderStatuses;
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

export const serviceOrderTypeToString = (type: ServiceOrderType | string) => {
  switch (type) {
    case ServiceOrderType.REGULAR:
      return 'Maintenance';
    case ServiceOrderType.EMERGENCY:
      return 'Emergency';
    case ServiceOrderType.CALLOUT:
      return 'Callout';
    case ServiceOrderType.REPAIR:
      return 'Repair';
    case ServiceOrderType.INSPECTION:
      return 'Inspection';
    case ServiceOrderType.NEW_INSTALLATION:
      return 'Installation';
    case ServiceOrderType.MODERNIZATION:
      return 'Modernization';
    case ServiceOrderType.GENERAL:
      return 'General';
    default:
      return '-';
  }
};

export const serviceOrderTypeToEnum = (type: string) => {
  switch (type) {
    case 'Maintenance':
      return ServiceOrderType.REGULAR;
    case 'Emergency':
      return ServiceOrderType.EMERGENCY;
    case 'Callout':
      return ServiceOrderType.CALLOUT;
    case 'Repair':
      return ServiceOrderType.REPAIR;
    case 'Inspection':
      return ServiceOrderType.INSPECTION;
    case 'Installation':
      return ServiceOrderType.NEW_INSTALLATION;
    case 'Modernization':
      return ServiceOrderType.MODERNIZATION;
    case 'General':
      return ServiceOrderType.GENERAL;
    default:
      return ServiceOrderType.REPAIR;
  }
};

export const serviceOrderPaymentStatusToString = (
  type: ServiceOrderPaymentStatus | string,
) => {
  switch (type) {
    case ServiceOrderPaymentStatus.NOT_PAID:
      return 'Not Paid';
    case ServiceOrderPaymentStatus.PAID:
      return 'Paid';
    case ServiceOrderPaymentStatus.PARTIALLY_PAID:
      return 'Partially Paid';
    case ServiceOrderPaymentStatus.AUTO_GENERATED:
      return 'Auto Generated';
    case ServiceOrderPaymentStatus.NOT_SENT:
      return 'Not Sent';
    case ServiceOrderPaymentStatus.NONE:
      return 'No Invoice';
    default:
      return '-';
  }
};

export const serviceOrderPaymentStatusToEnum = (type: string) => {
  switch (type) {
    case 'Paid':
      return ServiceOrderPaymentStatus.PAID;
    case 'Not Paid':
      return ServiceOrderPaymentStatus.NOT_PAID;
    case 'Auto Generated':
      return ServiceOrderPaymentStatus.AUTO_GENERATED;
    case 'Partially Paid':
      return ServiceOrderPaymentStatus.PARTIALLY_PAID;
    case 'Not Sent':
      return ServiceOrderPaymentStatus.NOT_SENT;
    case '-':
      return ServiceOrderPaymentStatus.NONE;
    default:
      return ServiceOrderPaymentStatus.NONE;
  }
};

export const articleViewToArticleRecord = (
  articles: ServiceOrderArticleView[],
) =>
  articles.map((i) => ({
    articleId: i.article.id,
    article: i.article,
    description: i.description,
    name: i.name,
    quantity: i.quantity,
    unitAmount: i.unitAmount,
  }));

export const calculateTotalBillableHours = (
  timeRecords: ServiceOrderReportTimeRecord[],
) =>
  timeRecords.reduce((totalBill, timeRecord) => {
    const recordTotal = timeRecord.timeSlots.reduce(
      (slotTotal, slot) => slotTotal + (slot.minutes ?? 0),
      0,
    );

    const surcharges = Math.floor(
      (recordTotal * (timeRecord.percentageSurcharge ?? 0)) / 100,
    );

    return totalBill + surcharges + recordTotal;
  }, 0);

export const calculateSlotTotalWithoutSurcharge = (
  data?: ServiceOrderReportTimeRecord,
) => {
  if (!data?.timeSlots?.length) {
    return 0;
  }

  const totalMinutesWithoutSurcharge = data.timeSlots.reduce(
    (acc, item) => acc + (item.minutes ?? 0),
    0,
  );

  return totalMinutesWithoutSurcharge;
};

export const convertTimeSlotDatesToRestDateTime = (
  timeRecord?: ServiceOrderReportTimeRecord,
): ServiceOrderReportTimeRecord => {
  if (!timeRecord) {
    return {
      percentageSurcharge: 0,
      timeSlots: [],
    };
  }

  return {
    ...timeRecord,
    timeSlots: timeRecord?.timeSlots?.map((slot) => ({
      ...slot,
      startTime: toRestDateTime(new Date(slot.startTime)),
    })),
  };
};

export const calculateStartAndEndFromTimeRecord = (
  timeRecord?: ServiceOrderReportTimeRecord,
): {startTime?: string; endTime?: string} => {
  if (!timeRecord || !timeRecord.timeSlots.length) {
    return {startTime: undefined, endTime: undefined};
  }

  const sortedTimeRecords = _.sortBy(timeRecord.timeSlots, (obj) =>
    new Date(obj.startTime).getTime(),
  );
  const firstRecord = sortedTimeRecords[0];
  const lastRecord = sortedTimeRecords[sortedTimeRecords.length - 1];

  return {
    startTime: firstRecord.startTime,
    endTime: addMinutes(
      new Date(lastRecord.startTime!),
      lastRecord.minutes ?? 0,
    ).toISOString(),
  };
};

export const serviceOrderTypeColor = (type?: ServiceOrderType) => {
  switch (type) {
    case ServiceOrderType.REPAIR:
      return amber[800];
    case ServiceOrderType.REGULAR:
      return theme.palette.secondary.main;
    case ServiceOrderType.EMERGENCY:
      return theme.palette.error.main;
    case ServiceOrderType.CALLOUT:
      return grey[800];
    case ServiceOrderType.NEW_INSTALLATION:
      return theme.palette.secondary.dark;
    default:
      return theme.palette.primary.main;
  }
};

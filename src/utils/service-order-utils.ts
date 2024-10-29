import {addMinutes, differenceInMinutes} from 'date-fns';
import _ from 'lodash';
import {amber, grey} from '@mui/material/colors';
import {EmployeesSimpleView} from 'models/employee';
import {StatusColor} from 'models/status';
import {Address} from 'models/misc';
import {
  AUTO_GENERATED_TO_PAYMENT_STATUS,
  SearchParameters,
  SERVICE_ORDER_PAYMENT_STATUS_VIEW,
  ServiceOrderArticleView,
  ServiceOrderPaymentStatus,
  ServiceOrderPaymentWithIndicationStatus,
  ServiceOrderReportTimeRecord,
  ServiceOrderReportView,
  ServiceOrderStatus,
  ServiceOrderTableRow,
  ServiceOrderType,
  ServiceOrderView,
} from '../models/service-order';
import {theme} from '../theme';
import {toDate, toRestDateTime} from './datetime';

export const getServiceOrderStatusColor = (status: ServiceOrderStatus) => {
  switch (status) {
    case ServiceOrderStatus.SCHEDULING:
      return 'primary.dark';
    case ServiceOrderStatus.SCHEDULED:
      return 'primary.dark';
    case ServiceOrderStatus.IN_PROGRESS:
      return 'warning.light';
    case ServiceOrderStatus.CANCELLED:
      return 'action.active';
    case ServiceOrderStatus.OVERDUE:
      return 'error';
    case ServiceOrderStatus.COMPLETED:
      return 'darkSuccess';
    case ServiceOrderStatus.PAUSED:
      return 'warning';
    case ServiceOrderStatus.TECHNICIAN_ASSIGNED:
      return 'primary.dark';
    case ServiceOrderStatus.TRAVEL:
      return 'warning';
    case ServiceOrderStatus.ARTICLES_ORDERED:
      return 'primary.dark';
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
      return 'Scheduled';
    case ServiceOrderStatus.IN_PROGRESS:
      return 'Ongoing';
    case ServiceOrderStatus.CANCELLED:
      return 'Cancelled';
    case ServiceOrderStatus.OVERDUE:
      return 'Overdue';
    case ServiceOrderStatus.COMPLETED:
      return 'Completed';
    case ServiceOrderStatus.TECHNICIAN_ASSIGNED:
      return 'Assigned';
    case ServiceOrderStatus.TRAVEL:
      return 'Travel';
    case ServiceOrderStatus.PAUSED:
      return 'Paused';
    case ServiceOrderStatus.ARTICLES_ORDERED:
      return 'Articles Ordered';
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
    case 'Scheduled':
      return ServiceOrderStatus.SCHEDULED;
    case 'Ongoing':
      return ServiceOrderStatus.IN_PROGRESS;
    case 'Cancelled':
      return ServiceOrderStatus.CANCELLED;
    case 'Overdue':
      return ServiceOrderStatus.OVERDUE;
    case 'Completed':
      return ServiceOrderStatus.COMPLETED;
    case 'Assigned':
      return ServiceOrderStatus.TECHNICIAN_ASSIGNED;
    case 'Travel':
      return ServiceOrderStatus.TRAVEL;
    case 'Paused':
      return ServiceOrderStatus.PAUSED;
    case 'Articles Ordered':
      return ServiceOrderStatus.ARTICLES_ORDERED;
    default:
      return ServiceOrderStatus.INIT;
  }
};

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
    case ServiceOrderType.OPERATION:
      return 'Elevator Operation';
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
    case 'Operation':
      return ServiceOrderType.OPERATION;
    case 'Elevator Operation':
      return ServiceOrderType.OPERATION;
    default:
      return ServiceOrderType.REPAIR;
  }
};

export const serviceOrderPaymentStatusToString = (
  type:
    | ServiceOrderPaymentStatus
    | ServiceOrderPaymentWithIndicationStatus
    | string,
) => {
  const value =
    AUTO_GENERATED_TO_PAYMENT_STATUS.get(
      type as ServiceOrderPaymentWithIndicationStatus,
    ) ?? type;

  switch (value) {
    case ServiceOrderPaymentStatus.NO_INVOICE:
      return SERVICE_ORDER_PAYMENT_STATUS_VIEW.NO_INVOICE;
    case ServiceOrderPaymentStatus.NOT_PAID:
      return SERVICE_ORDER_PAYMENT_STATUS_VIEW.NOT_PAID;
    case ServiceOrderPaymentStatus.PARTIALLY_PAID:
      return SERVICE_ORDER_PAYMENT_STATUS_VIEW.PARTIALLY_PAID;
    case ServiceOrderPaymentStatus.OVERDUE:
      return SERVICE_ORDER_PAYMENT_STATUS_VIEW.OVERDUE;
    case ServiceOrderPaymentStatus.DONE:
      return SERVICE_ORDER_PAYMENT_STATUS_VIEW.DONE;
    default:
      return '-';
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

export const getSignatureKeys = (
  serviceOrder?: ServiceOrderView,
  report?: ServiceOrderReportView,
  serviceCompanyId?: string,
) => {
  let signatureKeys = {CUSTOMER: '', TECHNICIAN: ''};

  if (!serviceOrder) {
    return signatureKeys;
  }

  report?.signatures?.forEach((item) => {
    const url = item.fileResource.uri;
    if (item.fileResource.uri) {
      const regex = /\/report\/(?!CUSTOMER\.png|TECHNICIAN\.png)([^/]+)/;
      const match = url.match(regex);
      if (match?.[1]) {
        signatureKeys = {
          CUSTOMER: `${serviceCompanyId}/serviceOrders/${serviceOrder.id}/report/${report?.technicianId}/CUSTOMER.png`,
          TECHNICIAN: `${serviceCompanyId}/serviceOrders/${serviceOrder.id}/report/${report?.technicianId}/TECHNICIAN.png`,
        };
      } else {
        signatureKeys = {
          CUSTOMER: `${serviceCompanyId}/serviceOrders/${serviceOrder.id}/report/CUSTOMER.png`,
          TECHNICIAN: `${serviceCompanyId}/serviceOrders/${serviceOrder.id}/report/TECHNICIAN.png`,
        };
      }
    }
  });
  return signatureKeys;
};

export const getAddressString = (address?: Address) => {
  if (!address) return '-';

  if (
    !address.component?.postalCode ||
    !address.component?.street ||
    !address.component?.city
  )
    return address.fullName ?? '-';
  return [
    address.component?.street,
    address.component?.postalCode,
    address.component?.city,
  ]
    .filter((value) => !!value)
    .join(', ');
};

const getTechniciansFromServiceOrder = (
  item: ServiceOrderView,
): EmployeesSimpleView[] => {
  if (item.schedules.length) {
    return item.schedules.map((x) => x.technician);
  }
  if (item?.additionalInfo?.candidateTechnician) {
    return [item?.additionalInfo?.candidateTechnician];
  }
  return [];
};

export const aggregateServiceOrderRow = (
  orders: ServiceOrderView[],
): ServiceOrderTableRow[] =>
  orders.map((order) => ({
    serviceOrderData: order,
    id: order.id,
    elevatorExternalId: order.elevator.externalId,
    number: order.number,
    type: order.type,
    address: getAddressString(order.elevator.address),
    fullAddress: order.elevator.address.fullName ?? '-',
    dueDate: order.dueDate,
    technicians: getTechniciansFromServiceOrder(order),
    propertyOwner: order.elevator.propertyOwner,
    jobStatus: order.status,
    paymentStatus:
      order.additionalInfo.paymentStatus ??
      ServiceOrderPaymentStatus.NO_INVOICE,
    hasNotes: Boolean(order.additionalInfo.commentCount),
  }));

export const createSearchQuery = ({search, orderNumber}: SearchParameters) => {
  const elements = [
    search && search,
    orderNumber && `[externalid:*${orderNumber}*]`,
  ];
  return elements.length ? elements.join(' ') : '';
};

export const getServiceOrderPaymentStatusStyles = (
  status: ServiceOrderPaymentStatus | ServiceOrderPaymentWithIndicationStatus,
): {
  label: string;
  color: StatusColor;
} => {
  const value =
    AUTO_GENERATED_TO_PAYMENT_STATUS.get(
      status as ServiceOrderPaymentWithIndicationStatus,
    ) ?? status;

  const label = serviceOrderPaymentStatusToString(value);

  switch (value) {
    case ServiceOrderPaymentStatus.DONE:
      return {label, color: 'success'};

    case ServiceOrderPaymentStatus.OVERDUE:
      return {
        label,
        color: 'warning',
      };

    case ServiceOrderPaymentStatus.PARTIALLY_PAID:
      return {
        label,
        color: 'warning.light',
      };

    case ServiceOrderPaymentStatus.NOT_PAID:
      return {label, color: 'info'};

    case ServiceOrderPaymentStatus.NO_INVOICE:
      return {
        label,
        color: 'info.light',
      };

    default:
      return {label: '-', color: 'info.light'};
  }
};

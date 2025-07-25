import {addMinutes, differenceInMinutes} from 'date-fns';
import _ from 'lodash';
import {
  EmployeesSimpleView,
  EmployeesView,
  ServiceOrderEmployeeView,
} from 'models/employee';
import {StatusColor} from 'models/status';
import {getAddressString} from 'utils/address';
import {ArticleType} from 'models/article';
import {Discount, DiscountType} from 'models/invoice';
import {AmountRecord, Currency} from 'models/misc';
import {t} from 'i18next';
import {VatView} from 'models/vat';
import {
  AUTO_GENERATED_TO_PAYMENT_STATUS,
  DateCellParts,
  EditableServiceOrderItem,
  GetServiceTypeProps,
  NewServiceOrderItemRecord,
  SearchParameters,
  SERVICE_ORDER_PAYMENT_STATUS_VIEW,
  ServiceOrderArticleRecord,
  ServiceOrderArticleView,
  ServiceOrderPaymentStatus,
  ServiceOrderPaymentWithIndicationStatus,
  ServiceOrderReportTimeRecord,
  ServiceOrderReportView,
  ServiceOrderStatus,
  ServiceOrderSubArticleRecord,
  ServiceOrderTableRow,
  ServiceOrderType,
  ServiceOrderTypeRecord,
  ServiceOrderView,
  statusLabelMap,
} from '../models/service-order';
import {formatDate, toDate, toRestDateTime} from './datetime';
import {moneyToCents} from './currency';
import {convertUserAccountsToSimpleView} from './user';
import {resolveVatFromBackend} from './utils';

export const getServiceOrderStatusColor = (status: ServiceOrderStatus) => {
  switch (status) {
    case ServiceOrderStatus.SCHEDULING:
      return 'primary.dark';
    case ServiceOrderStatus.SCHEDULED:
      return 'primary.dark';
    case ServiceOrderStatus.PLANNED:
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
    case ServiceOrderStatus.ARCHIVED:
      return 'action.active';
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
    case ServiceOrderStatus.ARCHIVED:
      return 'Archived';
    case ServiceOrderStatus.ARTICLES_ORDERED:
      return 'Articles Ordered';
    case ServiceOrderStatus.PLANNED:
      return 'Planned';
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
    case 'Planned':
      return ServiceOrderStatus.PLANNED;
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
    articleId: i.article?.id,
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

const getTechniciansFromServiceOrder = (
  item: ServiceOrderView,
): EmployeesSimpleView[] => {
  if (item.schedules.length) {
    return item.schedules
      .filter((scheduleItem) => !!scheduleItem.technician)
      .map((x) => x.technician!);
  }

  return [];
};

export const aggregateServiceOrderRow = (
  orders: ServiceOrderView[],
): ServiceOrderTableRow[] =>
  orders.map((order) => ({
    serviceOrderData: order,
    id: order.id,
    elevatorExternalId: order.elevator.externalId || '',
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
    lastActivityAt: order.additionalInfo.lastActivityAt ?? '',
    hasSchedule: order.schedules.length > 0,
    scheduleDate:
      order.schedules.length > 0 ? order.schedules[0]?.startTime : '',
    tags: order.additionalInfo.tags ?? [],
  }));

export const createSearchQuery = ({search, orderNumber}: SearchParameters) => {
  const elements = [];
  const [firstSearch, ...tags] = (search || '').split('#');

  if (firstSearch) elements.push(firstSearch);
  if (tags.length > 0) tags.forEach((tag) => elements.push(`[tag:*${tag}*]`));
  if (orderNumber) elements.push(`[externalid:*${orderNumber}*]`);
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

export const canMarkCompleted = (
  status: ServiceOrderStatus,
  schedulesCount: number,
): boolean =>
  (status === ServiceOrderStatus.OVERDUE ||
    status === ServiceOrderStatus.SCHEDULED ||
    status === ServiceOrderStatus.TRAVEL ||
    status === ServiceOrderStatus.PAUSED ||
    status === ServiceOrderStatus.IN_PROGRESS) &&
  schedulesCount > 0;

export const getIsNotPendingStatus = (status: ServiceOrderStatus) =>
  [
    ServiceOrderStatus.INIT,
    ServiceOrderStatus.READY_TO_SCHEDULE,
    ServiceOrderStatus.SCHEDULING,
    ServiceOrderStatus.OVERDUE,
    ServiceOrderStatus.IN_PROGRESS,
    ServiceOrderStatus.PLANNED,
  ].includes(status);

// scheduled => perfill technicians from schedules and time
export const getDefaultTechnician = (serviceOrder: ServiceOrderView) =>
  serviceOrder.schedules
    ?.filter((item) => !!item.technician)
    .map((item) => item.technician!) ?? null;

export const getDialogTitle = (serviceOrder: ServiceOrderView) =>
  serviceOrder.status === ServiceOrderStatus.SCHEDULED ||
  serviceOrder.status === ServiceOrderStatus.IN_PROGRESS
    ? 'Reschedule Job'
    : 'Schedule Job';

export const getJobTypeGivenName = (
  orderType: string | undefined,
  jobTypes?: ServiceOrderTypeRecord[],
): string => {
  if (!orderType || !jobTypes || !jobTypes.length) return '-';

  const orderTypeString = serviceOrderTypeToString(orderType);

  if (orderTypeString !== '-') {
    return orderTypeString;
  }

  const matchingJobType = jobTypes.find(
    (jobType) => jobType.name === orderType,
  );
  return matchingJobType?.givenName || '-';
};

export const isCustomJobType = (jobType: string) => {
  const orderTypeString = serviceOrderTypeToString(jobType);
  return orderTypeString === '-';
};

type FilterServiceOrderTypeProps = {
  statistic?: Record<string, number>;
  allServiceOrderTypes: ServiceOrderTypeRecord[];
};

export const filterServiceOrderTypes = ({
  statistic,
  allServiceOrderTypes,
}: FilterServiceOrderTypeProps) => {
  const jobTypesInStatistics = statistic
    ? Object.keys(statistic).filter((jobType) => statistic[jobType] > 0)
    : [];

  return allServiceOrderTypes?.filter((job) =>
    jobTypesInStatistics.includes(job.name),
  );
};

export const roundTimeWithSurcharge = (
  timeRecord: ServiceOrderReportTimeRecord | undefined,
  roundingStep: number,
): number => {
  const minutes = calculateSlotTotalWithoutSurcharge(timeRecord);

  // Round the base minutes according to company settings
  const roundedMinutes = Math.ceil(minutes / roundingStep) * roundingStep;

  // Calculate surcharge on rounded minutes
  const surchargeMinutes = Math.floor(
    (roundedMinutes * (timeRecord?.percentageSurcharge ?? 0)) / 100,
  );

  return roundedMinutes + surchargeMinutes;
};

export function getServiceOrderDateParts(
  row: ServiceOrderTableRow,
): DateCellParts {
  const {jobStatus, hasSchedule, scheduleDate, lastActivityAt} = row;

  let label = statusLabelMap[jobStatus] ?? '-';

  if (jobStatus === ServiceOrderStatus.OVERDUE && hasSchedule) {
    label = statusLabelMap[ServiceOrderStatus.SCHEDULED];
  }

  const isScheduled =
    jobStatus === ServiceOrderStatus.PLANNED ||
    jobStatus === ServiceOrderStatus.SCHEDULED ||
    (jobStatus === ServiceOrderStatus.OVERDUE && hasSchedule);

  const date = isScheduled
    ? scheduleDate
      ? formatDate(scheduleDate)
      : null
    : lastActivityAt
    ? formatDate(lastActivityAt)
    : null;

  return {label, date};
}

export const serviceOrderItemToServiceOrderItemRecord = (
  serviceOrderItem: ServiceOrderArticleView,
  subItemsMap: Record<string, ServiceOrderSubArticleRecord[]> = {},
): NewServiceOrderItemRecord => {
  const record: EditableServiceOrderItem = {
    id: serviceOrderItem.id,
    article: {...serviceOrderItem.article, id: serviceOrderItem.article?.id!},
    name: serviceOrderItem.name,
    description: serviceOrderItem.description,
    quantity: serviceOrderItem.quantity,
    unitAmount: {
      ...serviceOrderItem.unitAmount,
      netAmount: serviceOrderItem.unitAmount?.netAmount ?? 0,
      percentageVat: serviceOrderItem.unitAmount?.percentageVat ?? 0,
      currency: serviceOrderItem.unitAmount?.currency,
      vatId: serviceOrderItem.unitAmount?.vatId ?? '',
      vatName: serviceOrderItem.unitAmount?.vatName ?? '',
    },
    unitPurchaseAmount: {
      ...serviceOrderItem.unitPurchaseAmount,
      netAmount: serviceOrderItem.unitPurchaseAmount?.netAmount ?? 0,
      percentageVat: serviceOrderItem.unitPurchaseAmount?.percentageVat ?? 0,
      currency: serviceOrderItem.unitPurchaseAmount?.currency!,
      vatId: serviceOrderItem.unitPurchaseAmount?.vatId ?? '',
      vatName: serviceOrderItem.unitPurchaseAmount?.vatName ?? '',
    },
    discount: serviceOrderItem?.additionalInfo?.discount
      ? {
          ...serviceOrderItem.additionalInfo.discount,
          type:
            serviceOrderItem.additionalInfo?.discount?.type ||
            DiscountType.NONE,
          amount:
            serviceOrderItem.additionalInfo?.discount?.amount &&
            serviceOrderItem.additionalInfo?.discount?.type ===
              DiscountType.AMOUNT
              ? {
                  ...serviceOrderItem.additionalInfo.discount.amount,
                  value:
                    (serviceOrderItem.additionalInfo.discount.amount.value ??
                      0) /
                    10 **
                      (serviceOrderItem.additionalInfo.discount.amount
                        .fractionDigits ?? 2),
                }
              : undefined,
        }
      : undefined,
    userSeqNumber: serviceOrderItem?.additionalInfo?.userSeqNumber || undefined,
    ownerName: serviceOrderItem.additionalInfo?.owner?.name || '',
    ownerType: serviceOrderItem.ownerType!,
  };

  // If the article's type is PACKAGE, add a default costPackage if it doesn't exist.
  if (serviceOrderItem.article?.type === ArticleType.PACKAGE) {
    if (!serviceOrderItem.article.costPackage) {
      record.article = {
        ...record.article,
        costPackage: {
          laborPercentage: 50,
          materialPercentage: 50,
        },
      };
    }
  }

  if (serviceOrderItem.article?.type === ArticleType.MIX) {
    const subItems = subItemsMap[serviceOrderItem.id] || [];

    return {
      ...record,
      subItems: subItems.map((subItem) => ({
        parentId: serviceOrderItem.id,
        id: subItem?.id || '',
        article: subItem.article,
        name: subItem.name,
        description: subItem.description,
        quantity: subItem.quantity,
        unitAmount: subItem.unitAmount,
        unitPurchaseAmount: subItem.unitPurchaseAmount,
        userSeqNumber: subItem.userSeqNumber || undefined,
        serviceOrderId: serviceOrderItem.id,
      })),
      subItemsConfig: {
        subItemsVisible:
          serviceOrderItem.additionalInfo?.subArticlesConfig?.subItemsVisible ||
          false,
        priceVisible:
          serviceOrderItem.additionalInfo?.subArticlesConfig?.priceVisible ||
          false,
      },
    };
  }

  return record;
};

export const buildServiceOrderPayload = (
  items: NewServiceOrderItemRecord[],
  currentCurrency: Currency,
  discount?: Discount,
  taxRates?: VatView[],
) => ({
  articles: items.map((item) => {
    // resolve VAT on the line‑item amount
    const {percentageVat, vatName} = resolveVatFromBackend(
      item.unitAmount?.vatId,
      item.unitAmount?.percentageVat,
      item.unitAmount?.vatName,
      taxRates,
    );

    const {percentageVat: purchaseVat, vatName: purchaseVatName} =
      resolveVatFromBackend(
        item.article?.unitPurchaseAmount?.vatId,
        item.article?.unitPurchaseAmount?.percentageVat,
        item.article?.unitPurchaseAmount?.vatName,
        taxRates,
      );

    const {percentageVat: sellingVat, vatName: sellingVatName} =
      resolveVatFromBackend(
        item.article?.unitSellingAmount?.vatId,
        item.article?.unitSellingAmount?.percentageVat,
        item.article?.unitSellingAmount?.vatName,
        taxRates,
      );

    return {
      id: undefined,
      article: {
        id: undefined,
        name: item.article?.name,
        externalId: item.article?.externalId,
        type: item.article?.type,
        unit: item.article?.unit,
        unitSellingAmount: {
          ...item.article?.unitSellingAmount,
          currency:
            item.article?.unitSellingAmount?.currency || currentCurrency.code,
          percentageVat: sellingVat,
          vatName: sellingVatName,
        },
        unitPurchaseAmount: {
          ...item.article?.unitPurchaseAmount,
          currency:
            item.article?.unitPurchaseAmount?.currency || currentCurrency.code,
          percentageVat: purchaseVat,
          vatName: purchaseVatName,
        },
        costPackage: item.article?.costPackage,
      },
      name: item.name,
      description: item.description,
      unitAmount: {
        currency: item.unitAmount?.currency || currentCurrency.code,
        netAmount:
          item.unitAmount?.netAmount !== undefined
            ? Number(item.unitAmount.netAmount)
            : 0,
        percentageVat,
        vatId: item.unitAmount?.vatId || '',
        vatName,
      },
      quantity: Number.isNaN(Number(item.quantity)) ? 0 : Number(item.quantity),
      discount:
        item.discount?.type === DiscountType.AMOUNT
          ? {
              type: DiscountType.AMOUNT,
              amount: {
                ...item.discount.amount!,
                value: (item.discount.amount?.value ?? 0) * 100,
                currency:
                  item.discount.amount?.currency || currentCurrency.code,
              },
            }
          : {
              type: DiscountType.PERCENTAGE,
              percentage: item.discount?.percentage || 0,
            },
      subItemsConfig: item.subItemsConfig,
      subArticles: item.subItems?.map((sub) => {
        const {percentageVat: subPercentageVat, vatName: subVatName} =
          resolveVatFromBackend(
            sub.unitAmount?.vatId,
            sub.unitAmount?.percentageVat,
            sub.unitAmount?.vatName,
            taxRates,
          );
        const {percentageVat: subPurchaseVat, vatName: subPurchaseVatName} =
          resolveVatFromBackend(
            sub.article?.unitPurchaseAmount?.vatId,
            sub.article?.unitPurchaseAmount?.percentageVat,
            sub.article?.unitPurchaseAmount?.vatName,
            taxRates,
          );
        const {percentageVat: subSellingVat, vatName: subSellingVatName} =
          resolveVatFromBackend(
            sub.article?.unitSellingAmount?.vatId,
            sub.article?.unitSellingAmount?.percentageVat,
            sub.article?.unitSellingAmount?.vatName,
            taxRates,
          );

        return {
          article: {
            id: undefined,
            name: sub.article?.name,
            externalId: sub.article?.externalId,
            type: sub.article?.type,
            unit: sub.article?.unit,
            unitSellingAmount: {
              ...sub.article?.unitSellingAmount,
              currency:
                sub.article?.unitSellingAmount?.currency ||
                currentCurrency.code,
              percentageVat: subSellingVat,
              vatName: subSellingVatName,
            },
            unitPurchaseAmount: {
              ...sub.article?.unitPurchaseAmount,
              currency:
                sub.article?.unitPurchaseAmount?.currency ||
                currentCurrency.code,
              percentageVat: subPurchaseVat,
              vatName: subPurchaseVatName,
            },
            costPackage: sub.article?.costPackage,
          },
          id: undefined,
          name: sub.name,
          unitPurchaseAmount: sub.unitPurchaseAmount,
          unitAmount: {
            ...sub.unitAmount,
            currency: sub.unitAmount?.currency || currentCurrency.code,
            percentageVat: subPercentageVat,
            vatName: subVatName,
          },
          quantity: Number.isNaN(Number(sub.quantity))
            ? 0
            : Number(sub.quantity),
          description: sub.description,
          userSeqNumber: sub.userSeqNumber,
        };
      }),
      userSeqNumber: item.userSeqNumber,
    };
  }),
  globalDiscount:
    discount?.type === DiscountType.AMOUNT
      ? {
          type: DiscountType.AMOUNT,
          amount: {
            value: moneyToCents(
              currentCurrency.code,
              discount.amount?.value ?? 0,
            ),
            currency: discount.amount?.currency || currentCurrency.code,
            fractionDigits:
              discount.amount?.fractionDigits || currentCurrency.fractionDigits,
          },
        }
      : {
          type: DiscountType.PERCENTAGE,
          percentage: discount?.percentage || 0,
        },
});

export function formatServiceOrderArticles(
  items: EditableServiceOrderItem[],
  currentCurrency: Currency,
): ServiceOrderArticleRecord[] {
  return items.map((item) => {
    const makeAmount = (amt?: AmountRecord) => ({
      netAmount: amt?.netAmount ?? 0,
      percentageVat: amt?.percentageVat ?? 0,
      currency: amt?.currency ?? currentCurrency.code,
      vatId: amt?.vatId || '',
      vatName: amt?.vatName || '',
    });

    // normalize any discount you might have
    const formattedDiscount: Discount | undefined = item.discount
      ? {
          ...item.discount,
          type:
            item.discount.type === DiscountType.NONE
              ? DiscountType.PERCENTAGE
              : item.discount.type,
          amount:
            item.discount.type === DiscountType.AMOUNT && item.discount.amount
              ? {
                  ...item.discount.amount,
                  // turn into cents
                  value:
                    (item.discount.amount.value ?? 0) *
                    10 ** (item.discount.amount.fractionDigits ?? 2),
                  currency: item.discount.amount.currency,
                }
              : undefined,
          percentage:
            item.discount.type === DiscountType.PERCENTAGE ||
            item.discount.type === DiscountType.NONE
              ? item.discount.percentage ?? 0
              : undefined,
        }
      : undefined;

    // build the core record
    const base: ServiceOrderArticleRecord = {
      article: item.article && {
        id:
          item.article.id && item.article.id.length > 8
            ? item.article.id
            : undefined,
        name: item.article.name,
        externalId: item.article.externalId,
        type: item.article.type,
        unit: item.article.unit,
        costPackage: item.article.costPackage,
        unitSellingAmount: makeAmount(item.article.unitSellingAmount),
        unitPurchaseAmount:
          item.article.unitPurchaseAmount &&
          makeAmount(item.article.unitPurchaseAmount),
      },
      name: item.name,
      description: item.description,
      quantity: item.quantity,
      unitPurchaseAmount:
        item.unitPurchaseAmount && makeAmount(item.unitPurchaseAmount),
      unitAmount: makeAmount(item.unitAmount),
      discount: formattedDiscount,
      subArticlesConfig: item.subItemsConfig,
      userSeqNumber: item.userSeqNumber ?? undefined,
    };

    // if there are sub‑items, format those too
    if (Array.isArray(item.subItems) && item.subItems.length) {
      base.subArticles = item?.subItems?.map(
        (sub) =>
          ({
            article: sub.article && {
              id:
                sub.article.id && sub.article.id.length > 8
                  ? sub.article.id
                  : undefined,
              name: sub.article.name,
              externalId: sub.article.externalId,
              type: sub.article.type,
              unit: sub.article.unit,
              costPackage: sub.article.costPackage,
              unitSellingAmount: makeAmount(sub.article.unitSellingAmount),
              unitPurchaseAmount: makeAmount(sub.article.unitPurchaseAmount),
            },
            name: sub.name,
            description: sub.description,
            quantity: Number.isNaN(Number(sub.quantity))
              ? 0
              : Number(sub.quantity),
            unitPurchaseAmount:
              sub.unitPurchaseAmount && makeAmount(sub.unitPurchaseAmount),
            unitAmount: makeAmount(sub.unitAmount),
            userSeqNumber: undefined,
          } as ServiceOrderSubArticleRecord),
      );
    }

    return base;
  });
}

export function convertEmployeesToServiceOrderEmployees(
  employees: EmployeesView[],
): ServiceOrderEmployeeView[] {
  return employees.map((employee) => ({
    id: employee.id,
    number: employee.number,
    externalId: employee.externalId,
    team: employee.team,
    address: employee.address,
    userAccount: convertUserAccountsToSimpleView(employee.userAccount),
    isOnline: employee.isOnline,
    additionalInfo: employee.additionalInfo,
    meta: employee.meta,
    online: employee.online,
  }));
}

export const getDisplayJobType = ({
  value,
  dynamicJobTypes = [],
  oldJobTypes = [],
}: GetServiceTypeProps) => {
  if (!value) return '-';

  // Filter out oldJobTypes that already exist in jobTypes based on the 'name' property
  const filteredOldJobTypes = oldJobTypes.filter(
    (oldJobType) =>
      !dynamicJobTypes?.some((jobType) => jobType.name === oldJobType.name),
  );

  // Combine jobTypes and the filtered oldJobTypes
  const allJobTypes = [...dynamicJobTypes, ...filteredOldJobTypes];

  const foundOldJob = getJobTypeGivenName(value, filteredOldJobTypes);

  if (foundOldJob !== '-') return t(foundOldJob);

  return getJobTypeGivenName(value, allJobTypes);
};

import {Client} from './client';
import {
  Address,
  Amount,
  AmountRecord,
  Meta,
  TimeWindowRecord,
  TimeWindowType,
} from './misc';
import {
  ElevatorAdditionalInfo,
  ElevatorAssignmentSimpleView,
  ElevatorCategory,
  ElevatorOrderField,
  ElevatorProperty,
  ElevatorSimpleView,
  ElevatorSortableFields,
  ElevatorStatus,
  ElevatorTimeRuleView,
  ElevatorView,
} from './elevator';
import {
  PropertyContactPersonSimpleView,
  PropertyOwnerSimpleView,
  PropertyOwnerView,
} from './propertyManager';
import {FileResource} from './media';
import {ArticleType, ArticleView, CostPackage} from './article';
import {toRestDate} from 'utils/datetime';
import {ServiceCompanySimpleView, ServiceCompanyType} from './service-company';
import {ServiceOrderType} from './service-order';
import {InvoiceGeneration} from './invoice';
import {Order} from './pagination';
import {FileWithPreview} from 'components/MyDropZone/MyDropzone';

export interface QueryContractCommentsParams {
  pageIndex: number;
  pageSize: number;
}

export interface CreateContractComment {
  content: string;
  subject: string;
}

export interface UpdateContractComment {
  content: string;
  subject: string;
}

export enum ContractStatus {
  PENDING = 'PENDING',
  VALID = 'VALID',
  EXPIRED = 'EXPIRED',
  EXPIRING = 'EXPIRING',
}

export enum TimeUnitYearView {
  ANNUALLY = 'Every year',
  BIENNIALLY = 'Every 2 year',
  TRIENNIALLY = 'Every 3 year',
  QUADRENNIALLY = 'Every 4 year',
  WEEKLY = 'Weekly',
  BIWEEKLY = 'Every 2 weeks',
  TRIWEEKLY = 'Every 3 weeks',
}

export enum ContractOrderField {
  EXPIRY_TIME = 'EXPIRY_TIME',
  CREATED_TIME = 'CREATED_TIME',
  START_TIME = 'START_TIME',
  EXTERNAL_ID = 'EXTERNAL_ID',
  PROPERTY_OWNER_NAME = 'PROPERTY_OWNER_NAME',
  NUMBER_OF_ELEVATOR = 'NUMBER_OF_ELEVATOR',
  START_DATE = 'START_DATE',
  END_DATE = 'END_DATE',
  STATUS = 'STATUS',
  NET_PRICE = 'NET_PRICE',
  NAME = 'NAME',
}

export enum ContractTypes {
  SERVICE = 'SERVICE',
  NON_SERVICE = 'NON_SERVICE',
}

export enum ContractTimeUnit {
  NONE = 'NONE',
  WEEKLY = 'WEEKLY',
  BIWEEKLY = 'BIWEEKLY',
  TRIWEEKLY = 'TRIWEEKLY',
  MONTHLY = 'MONTHLY',
  ANNUALLY = 'ANNUALLY',
  BIENNIALLY = 'BIENNIALLY',
  TRIENNIALLY = 'TRIENNIALLY',
  QUADRENNIALLY = 'QUADRENNIALLY',
}

export enum YearlyContractTimeUnit {
  ANNUALLY = 'ANNUALLY',
  BIENNIALLY = 'Every 2 years',
  TRIENNIALLY = 'Every 3 years',
  QUADRIENNIALLY = 'Every 4 years',
}

export interface ContractNameTypes {
  name: string;
  type: ContractTypes;
}

export interface QueryContractParams {
  order: Order;
  orderBy: ContractOrderField;
  pageIndex: number;
  pageSize: number;
  query: string;
  serviceCompanyId: string;
  status?: string[];
  priceStart?: number;
  priceEnd?: number;
  paymentTermId?: string;
  serviceOrderType?: string[];
}

export interface ContractDiscount {
  days?: number;
  discountPercentage?: number;
}

export interface FirstMaintenance {
  year?: number;
  month?: number;
}

export interface ContractPriceAdjustment {
  adjustmentClosed?: boolean | null;
  lastAdjustmentDate?: string | null;
}

export interface ContractAdditionalInfo {
  renewalTerms?: number;
  price?: Amount;
  annualPriceAdjustmentPercentage?: number;
  invoiceCycle?: number;
  documents?: FileResource[];
  scope?: string[];
  noticePeriodInMonth?: number;
  invoiceDueDays?: number;
  discounts?: ContractDiscount[];
  firstMaintenance?: FirstMaintenance;
  firstInvoiceDate?: string;
  autoRenewalCancelled?: boolean;
  renewalDate?: string;
  totalYearlyPrice?: number;
  discountPerInvoice?: number;
  invoiceGeneration?: InvoiceGeneration;
  priceAdjustment?: ContractPriceAdjustment;
  purchaseOrderNumber?: string;
}

export interface ContractElevatorAdditionalInfo {
  removalDate?: string | null;
}

export interface ContractElevatorSimpleView {
  id: string;
  contractId: string;
  elevator: ElevatorSimpleView;
  additionalInfo?: ContractElevatorAdditionalInfo;
}

export interface ContractArticleView {
  article: ArticleView;
  contractId: string;
  data: string;
  description: string;
  id: string;
  name: string;
  quantity: number;
  unitAmount: Amount;
}

export interface ContractView {
  components: ContractComponentView[];
  additionalInfo: ContractAdditionalInfo;
  id: string;
  propertyOwner: PropertyOwnerSimpleView;
  name: string;
  type: ContractTypes;
  visitsNumber: number;
  number: string;
  externalId: string;
  sla: number;
  spendingLimit: number;
  currency: string;
  elevators: ContractElevatorSimpleView[];
  description: string;
  status: ContractStatus;
  search: string;
  meta: Meta;
  paymentTerm?: ContractTermView;
  start: string;
  end: string;
  startTime?: string;
  endTime?: string;
  numberOfElevators?: number;
  contractArticles?: ContractArticleView[] | null;
  labels: string[];
  serviceCompany: ServiceCompanySimpleView;
}

export interface ContractSimpleView {
  id: string;
  type: ContractTypes;
  name: string;
  visitsNumber?: number;
  sla?: number;
  spendingLimit?: number;
  number: string; // this is not a number but a string representation of the contract number (ex: CTA000030)
  currency: string;
  start: string;
  end: string;
  search: string;
  status: ContractStatus;
  externalId: string;
  meta: Meta;
  additionalInfo: ContractAdditionalInfo;
  components?: ContractComponentView[] | null;
  endTime: string;
  startTime: string;
}

export interface ContractProps {
  components?: ContractComponentView[];
  id: string;
  removalDate?: string;
  additionalInfo: ContractAdditionalInfo;
  currency: string;
  end: string;
  externalId: string;
  meta: Meta;
  name: string;
  number: string;
  search: string;
  sla?: number;
  spendingLimit?: number;
  start: string;
  status: ContractStatus;
  type: ContractTypes;
  visitsNumber?: number;
}

export interface UpdateContractComponents {
  firstInvoiceDate?: Date | null;
  firstOrderDate?: Date | null;
  group: string;
  name: string;
  elevators: ContractComponentElevator[];
  costPackage?: CostPackage;
}

export interface ContractElevatorView {
  id: string;
  number?: string;
  model: string;
  type: string;
  externalId: string;
  capacity: string;
  category: ElevatorCategory;
  technicianNumber?: number;
  contracts: ContractProps[];
  address: Address;
  propertyOwner: PropertyOwnerView;
  properties: ElevatorProperty[];
  lastVisitDate?: string;
  nextVisitDate?: string;
  serialNumber: string;
  serviceTime?: number;
  status: ElevatorStatus;
  labels: string[];
  additionalInfo: ElevatorAdditionalInfo;
  assignments: ElevatorAssignmentSimpleView[];
  search: string;
  meta: Meta;
  timeRules: ElevatorTimeRuleView[];
  contactPerson?: PropertyContactPersonSimpleView;
  elevatorSortableFields?: ElevatorSortableFields;
}

export interface CreateContractRecord {
  propertyOwnerId: string;
  serviceCompanyId: string;
  type: ContractTypes;
  elevators: string[];
  visitsNumber: number;
  sla: number;
  spendingLimit: number;
  price: AmountRecord;
  currency: string;
  startDate: string;
  endDate: string;
}

export interface UpdateContractRecord {
  id: string;
  type: string;
  visitsNumber: number;
  sla: number;
  spendingLimit: number;
  price: number;
  currency: string;
  startDate: string;
  endDate: string;
}

export interface CustomerContractParams {
  order: Order;
  orderBy: ContractOrderField;
  pageIndex: number;
  pageSize: number;
  query: string;
  serviceCompanyId: string;
  status?: string[];
  priceStart?: number;
  priceEnd?: number;
}

export interface ElevatorContractParams {
  elevatorIds: string[];
  status: ContractStatus[];
}

export interface ContractPrice {
  currency?: string;
  netAmount?: number;
  percentageVat?: number;
}

export interface ContractRequestBody {
  id?: string;
  propertyOwnerId: string;
  serviceCompanyId: string;
  elevators: string[];
  name: string;
  currency?: string;
  endDate?: string;
  externalId?: string;
  price?: ContractPrice;
  sla?: number;
  spendingLimit?: number;
  startDate?: string;
  type?: string;
  visitsNumber?: number;
  invoiceDue?: string;
  renewalTerms: number;
  invoiceDueDays?: number;
  discounts?: ContractDiscount[];
  noticePeriodInMonth?: number;
  paymentTermId?: string;
  description?: string;
  purchaseOrderNumber?: string;
  annualPriceAdjustmentPercentage?: number;
  autoRenewalCancelled?: boolean;
  documents?: FileResource[] | FileWithPreview[];
  components: ContractComponentRecord[];
  renewalDate?: string;
  invoiceCycle?: number;
  firstMaintenance?: FirstMaintenance;
  firstInvoiceDate?: string;
}

export interface ContractBasicInfoFormModel {
  startDate: Date | null;
  endDate: Date | null;
  name: string;
  externalId: string;
  description: string;
  purchaseOrderNumber?: string;
}

export interface ContractCustomizeContractFormModel {
  renewalTerms: number;
  noticePeriodInMonth?: number;
  spendingLimit: number;
  annualPriceAdjustmentPercentage?: number;
  autoRenewalCancelled?: boolean;
}

export interface ContractUpdateRequest {
  name?: string;
  type?: ContractTypes;
  visitsNumber: number | string;
  sla?: number;
  spendingLimit: number | string;
  currency?: string;
  startDate: string;
  endDate: string;
  externalId?: string;
  price: number | string;
  renewalTerms: number | string;
  annualPriceAdjustmentPercentage?: number;
  invoiceCycle: number;
  documents?: FileResource[];
  scope?: string[];
  noticePeriodInMonth?: number;
  firstMaintenance?: FirstMaintenance;
  invoiceDueDays?: number;
  discounts?: number;
  firstInvoiceDate?: string;
  autoRenewalCancelled: boolean;
  description?: string;
  paymentTermId?: string;
  numberOfUnits?: number;
  purchaseOrderNumber?: string;
}

export enum PaymentTermArticleType {
  ALL = 'ALL',
  MATERIAL = 'MATERIAL',
  LABOR = 'LABOR',
}

export interface DiscountOption {
  discountDays?: number;
  discountPercent?: number;
  articleType: PaymentTermArticleType;
}

export interface PaymentTermData {
  dueDays?: number;
  discountOptions: DiscountOption[];
}

export interface ContractTermView {
  id: string;
  serviceCompanyId: string;
  type?: ServiceCompanyType;
  term: string;
  data?: PaymentTermData;
  additionalInfo: string;
  meta: Meta;
}

export interface NewContractPaymentTermBody {
  serviceCompanyId: string;
  term: string;
  type?: ServiceCompanyType;
}

export interface UpdateContractTermRecord {
  term: string;
  type: ServiceCompanyType;
}

export interface UpdateContractTermView {
  term: string;
  id: string;
}

export interface PaymentTermRecord {
  serviceCompanyId: string;
  term: string;
  paymentTermData: PaymentTermData;
}

export interface UpdateContractPaymentTermRecord {
  term: string;
  paymentTermData?: PaymentTermData;
}

export interface UpdateContractPaymentTermView {
  term: string;
  id: string;
  paymentTermData?: PaymentTermData;
}

export interface ContractElevatorQueryParams {
  lastVisitDateEnd: any;
  lastVisitDateStart: any;
  neLat?: number;
  neLng?: number;
  nextVisitDateEnd: any;
  nextVisitDateStart: any;
  order: Order;
  orderBy: ElevatorOrderField;
  pageIndex: number;
  pageSize: number;
  query: string;
  swLat?: number;
  swLng?: number;
  requireAppointment: boolean;
}

export interface ContractElevatorUpdate {
  removalDate: string | null;
}

export interface ContractServiceForm {
  id?: string;
  name: string;
  group?: string;
  firstInvoiceDate?: Date | null;
  firstOrderDate?: Date | null;
  costType: ArticleType;
  costPackage: CostPackage;
  elevators: ContractServiceFormElevator[];
  isAutomaticJobCycle?: boolean;
  yearlyPrice?: number;
  orderType?: ServiceOrderType;
}

export interface ContractServiceFormElevator {
  elevatorId: string;
  invoiceJob?: JobTimeUnit;
  orderGenerationJob?: JobTimeUnit;
  price: number;
  buildingLocation?: string;
  address?: string;
  externalId?: string;
  isChecked?: boolean;
  yearlyPrice?: number;
}

export interface ExtendedContractComponentRecord {
  groupNumber?: number;
  invoiceGroup?: number;
  isChecked?: boolean;
  id?: string;
  name: string;
  group: string;
  elevators: ContractComponentElevator[];
  firstInvoiceDate: Date | null;
  firstOrderDate: Date | null;
  costType: ArticleType;
  costPackage: CostPackage;
  isAutomaticJobCycle: boolean;
  orderType?: ServiceOrderType;
}

export interface ContractComponentRecord {
  id?: string;
  name: string;
  group: string;
  elevators: ContractComponentElevator[];
  firstInvoiceDate?: string;
  firstOrderDate?: string;
  costType: ArticleType;
  costPackage?: CostPackage;
  orderType?: string | null;
}

export interface ContractComponentView {
  id: string;
  name: string;
  group: string;
  additionalInfo: ContractComponentAdditionalInfo;
  isAutomaticJobCycle?: boolean;
}

export interface ContractComponentAdditionalInfo {
  costType: ArticleType;
  firstInvoiceDate?: Date | null;
  firstOrderDate?: Date | null;
  costPackage?: CostPackage;
  elevators: ContractComponentElevator[];
  orderType?: ServiceOrderType;
  yearlyPrice?: number;
}

export interface ContractServiceForm {
  id?: string;
  name: string;
  group?: string;
  firstInvoiceDate?: Date | null;
  firstOrderDate?: Date | null;
  costType: ArticleType;
  costPackage: CostPackage;
  elevators: ContractServiceFormElevator[];
  isAutomaticJobCycle?: boolean;
  isChecked?: boolean;
}

export interface ContractServiceFormElevator {
  elevatorId: string;
  invoiceJob?: JobTimeUnit;
  orderGenerationJob?: JobTimeUnit;
  price: number;
  buildingLocation?: string;
  address?: string;
  externalId?: string;
  isSelected?: boolean;
  isChecked?: boolean;
  yearlyPrice?: number;
}

export interface ContractComponentElevator {
  elevatorId: string;
  invoiceJob?: JobTimeUnit;
  orderGenerationJob?: JobTimeUnit;
  price: number;
  isChecked?: boolean; // on mutate
  isSelected?: boolean; // on create
}

export interface JobTimeUnit {
  timeUnit: ContractTimeUnit;
  timeNumbers: number[];
}

export const monthsAbbreviations = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export const convertExtendedRecordsToContractComponentRecords = (
  extendedContractRecords: ExtendedContractComponentRecord[],
): ContractComponentRecord[] => {
  return extendedContractRecords.map((extendedContractRecord) => {
    const {
      name,
      elevators,
      firstInvoiceDate,
      firstOrderDate,
      costType,
      costPackage,
      groupNumber,
      orderType,
    } = extendedContractRecord;

    const convertedElevators: ContractComponentElevator[] = elevators
      .filter((elevatorItem) => elevatorItem.isSelected)
      .map((elevator: ContractComponentElevator) => {
        const {elevatorId, invoiceJob, orderGenerationJob, price} = elevator;
        return {elevatorId, invoiceJob, orderGenerationJob, price};
      });

    const contractComponentRecord: ContractComponentRecord = {
      name,
      group: groupNumber !== null ? String(groupNumber) : '',
      elevators: convertedElevators,
      firstInvoiceDate: firstInvoiceDate ? toRestDate(firstInvoiceDate) : '',
      firstOrderDate: firstOrderDate ? toRestDate(firstOrderDate) : '',
      costType,
      costPackage,
      orderType,
    };

    return contractComponentRecord;
  });
};

export const getUniqueInvoiceJobTimeNumbers = (
  inputArray: ContractServiceFormElevator[] | ContractComponentElevator[],
) => {
  let uniqueTimeNumbers = new Set<number>();

  inputArray.forEach((item) => {
    item.invoiceJob?.timeNumbers?.forEach((number) => {
      uniqueTimeNumbers.add(number);
    });
  });

  const sortedNumbers = Array.from(uniqueTimeNumbers).sort((a, b) => a - b);

  return sortedNumbers;
};

export const getUniqueOrderGenerationTimeNumbers = (
  inputArray: ContractServiceFormElevator[] | ContractComponentElevator[],
) => {
  let uniqueTimeNumbers = new Set<number>();

  inputArray.forEach((item) => {
    item.orderGenerationJob?.timeNumbers?.forEach((number) => {
      uniqueTimeNumbers.add(number);
    });
  });

  const sortedNumbers = Array.from(uniqueTimeNumbers).sort((a, b) => a - b);

  return sortedNumbers;
};

const WEEKS_IN_A_YEAR = 52;

// If invoices are based on months
const monthlyBasedCalculations = (monthInNumbers?: number[]) => {
  if (!monthInNumbers) return 0;
  return monthInNumbers.length;
};

const TIME_UNIT_WEEK_TO_NUMBER = new Map<ContractTimeUnit, number>([
  [ContractTimeUnit.WEEKLY, 1],
  [ContractTimeUnit.BIWEEKLY, 2],
  [ContractTimeUnit.TRIWEEKLY, 3],
]);

const YEARLY_TIME_UNIT_TO_NUMBER = new Map<ContractTimeUnit, number>([
  [ContractTimeUnit.ANNUALLY, 1],
  [ContractTimeUnit.BIENNIALLY, 2],
  [ContractTimeUnit.TRIENNIALLY, 3],
  [ContractTimeUnit.QUADRENNIALLY, 4],
]);

const weeklyDivider = (
  weekOption:
    | ContractTimeUnit.WEEKLY
    | ContractTimeUnit.BIWEEKLY
    | ContractTimeUnit.TRIWEEKLY,
) => {
  const divider = TIME_UNIT_WEEK_TO_NUMBER.get(weekOption) ?? 1;
  return WEEKS_IN_A_YEAR / divider;
};

export const calculateContractInvoicePriceTotal = (
  array: ContractComponentElevator[],
) =>
  array.reduce((acc: number, item: ContractComponentElevator) => {
    let timeLength: number = 0;

    if (!item.invoiceJob && !item.orderGenerationJob) return 0;

    const invoiceTimeUnit = item.invoiceJob?.timeUnit;
    const orderTimeUnit = item.orderGenerationJob?.timeUnit;
    const contractTime =
      invoiceTimeUnit !== ContractTimeUnit.NONE
        ? invoiceTimeUnit
        : orderTimeUnit;

    // monthly based calculations
    if (contractTime === ContractTimeUnit.MONTHLY) {
      const invoiceMonths = item.invoiceJob?.timeNumbers;
      const jobMonths = item.orderGenerationJob?.timeNumbers;
      timeLength = monthlyBasedCalculations(
        invoiceMonths?.length ? invoiceMonths : jobMonths,
      );
    } else if (contractTime && TIME_UNIT_WEEK_TO_NUMBER.has(contractTime)) {
      // weekly based calculations
      timeLength = weeklyDivider(
        contractTime as
          | ContractTimeUnit.WEEKLY
          | ContractTimeUnit.BIWEEKLY
          | ContractTimeUnit.TRIWEEKLY,
      );
    } else if (
      contractTime &&
      YEARLY_TIME_UNIT_TO_NUMBER.has(contractTime) // yearly based calculations
    ) {
      const divider = YEARLY_TIME_UNIT_TO_NUMBER.get(
        contractTime as
          | ContractTimeUnit.ANNUALLY
          | ContractTimeUnit.BIENNIALLY
          | ContractTimeUnit.TRIENNIALLY
          | ContractTimeUnit.QUADRENNIALLY,
      );
      timeLength = 1 / (divider || 1);
    }
    return acc + (item?.price || 0) * timeLength;
  }, 0);

export const calculateContractInvoicePriceGrandTotal = (
  parentArray: ExtendedContractComponentRecord[],
): number => {
  let grandTotal: number = 0;

  parentArray.forEach((parentObject) => {
    if (parentObject.elevators && Array.isArray(parentObject.elevators)) {
      const elevatorsTotal = calculateContractInvoicePriceTotal(
        parentObject.elevators.filter((elevator) => elevator.isSelected),
      );
      grandTotal += elevatorsTotal;
    }
  });

  return grandTotal;
};

export const calculateContractInvoiceRowPrice = (
  elevatorRow: ContractServiceFormElevator,
) => {
  if (elevatorRow.invoiceJob && elevatorRow.invoiceJob.timeNumbers) {
    return elevatorRow.invoiceJob.timeNumbers?.length * elevatorRow.price;
  }
};

export const monthNames = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export enum ContractTimeUnitYearView {
  ANNUALLY = 'Every year',
  BIENNIALLY = 'Every 2 years',
  TRIENNIALLY = 'Every 3 years',
  QUADRENNIALLY = 'Every 4 years',
  WEEKLY = 'Weekly',
  BIWEEKLY = 'Every 2 weeks',
  NONE = 'After job',
}

export const getSingleItemViewFrequency = (
  elevator: ContractComponentElevator | ContractServiceFormElevator,
  key: 'orderGenerationJob' | 'invoiceJob',
): string => {
  const frequencySet = new Set<string>();
  const monthlyUnits = new Set<number>();

  const timeUnit = elevator[key] ? elevator[key]?.timeUnit : null;
  switch (timeUnit) {
    case ContractTimeUnit.MONTHLY:
      elevator[key]?.timeNumbers.forEach((month) => monthlyUnits.add(month));
      break;
    case ContractTimeUnit.WEEKLY:
    case ContractTimeUnit.BIWEEKLY:
    case ContractTimeUnit.ANNUALLY:
    case ContractTimeUnit.BIENNIALLY:
    case ContractTimeUnit.TRIENNIALLY:
    case ContractTimeUnit.QUADRENNIALLY:
      frequencySet.add(ContractTimeUnitYearView[timeUnit]);
      break;
    default:
      return '-';
  }

  Array.from(monthlyUnits)
    .sort((a, b) => a - b)
    .forEach((unit) => frequencySet.add(monthNames[unit - 1]));

  return frequencySet.size ? Array.from(frequencySet).join(', ') : '-';
};

export interface ContractPaymentTermView {
  id: string;
  serviceCompanyId: string;
  type?: ServiceCompanyType;
  term: string;
  data?: PaymentTermData;
  additionalInfo: string;
  meta: Meta;
}

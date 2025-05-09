import {ContractTypes, ContractNameTypes} from 'models/contract';
import {
  Address,
  AddressRecord,
  CompanyContact,
  DispatchStrategy,
  Language,
  Meta,
  PaymentInfo,
  Settings,
} from './misc';
import {ServiceOrderSummary, ServiceOrderType} from './service-order';
import {TechnicianEventView} from './technician';
import {ArticleView} from './article';
import {CompanyStatus} from './company';

export enum MinToStep {
  STEP_0 = 0,
  STEP_5 = 5,
  STEP_15 = 15,
  STEP_20 = 20,
  STEP_30 = 30,
  STEP_60 = 60,
}

export enum ServiceCompanyTimeUnit {
  DAILY = 'DAILY',
  QUARTERLY = 'QUARTERLY',
  WEEKLY = 'WEEKLY',
  YEARLY = 'YEARLY',
  MONTHLY = 'MONTHLY',
  FULLY = 'FULLY',
}

export enum ServiceCompanyNumberType {
  ARTICLE = 'ARTICLE',
  SERVICE_ORDER = 'SERVICE_ORDER',
  SERVICE_ORDER_REPORT = 'SERVICE_ORDER_REPORT',
  CONTRACT = 'CONTRACT',
  INVOICE = 'INVOICE',
  QUOTATION = 'QUOTATION',
  EMPLOYEE = 'EMPLOYEE',
  PROPERTY_OWNER = 'PROPERTY_OWNER',
  PROPERTY_CONTACT_PERSON = 'PROPERTY_CONTACT_PERSON',
  CHECK_LIST = 'CHECK_LIST',
  ELEVATOR = 'ELEVATOR',
  ARTICLE_ORDER = 'ARTICLE_ORDER',
  ARTICLE_SUPPLIER = 'ARTICLE_SUPPLIER',
}

export enum DataSyncType {
  ARTICLE = 'ARTICLE',
  SERVICE_ORDER = 'SERVICE_ORDER',
  SERVICE_ORDER_REPORT = 'SERVICE_ORDER_REPORT',
  CONTRACT = 'CONTRACT',
  INVOICE = 'INVOICE',
  QUOTATION = 'QUOTATION',
  EMPLOYEE = 'EMPLOYEE',
  PROPERTY_OWNER = 'PROPERTY_OWNER',
  PROPERTY_CONTACT_PERSON = 'PROPERTY_CONTACT_PERSON',
  CHECK_LIST = 'CHECK_LIST',
  ELEVATOR = 'ELEVATOR',
  ARTICLE_ORDER = 'ARTICLE_ORDER',
  ARTICLE_SUPPLIER = 'ARTICLE_SUPPLIER',
}

export enum ActivityMessageType {
  SERVICE_ORDER_COMPLETED = 'SERVICE_ORDER_COMPLETED',
  SERVICE_ORDER_STARTED = 'SERVICE_ORDER_STARTED',
  SERVICE_ORDER_SCHEDULED = 'SERVICE_ORDER_SCHEDULED',
  SERVICE_ORDER_EXPIRED = 'SERVICE_ORDER_EXPIRED',
  SERVICE_ORDER_UNSCHEDULED = 'SERVICE_ORDER_UNSCHEDULED',
  SERVICE_ORDER_NO_ASSIGNMENT = 'SERVICE_ORDER_NO_ASSIGNMENT',
  SERVICE_ORDER_CREATED = 'SERVICE_ORDER_CREATED',
  SERVICE_ORDER_CANCELLED = 'SERVICE_ORDER_CANCELLED',
  SERVICE_ORDER_UPDATED = 'SERVICE_ORDER_UPDATED',
  SERVICE_ORDER_TIME_EDITED = 'SERVICE_ORDER_TIME_EDITED',
}

export enum ServiceCompanyType {
  CONTRACT_NAME = 'CONTRACT_NAME',
  PROPERTY_OWNER_PAYMENT_TERM = 'PROPERTY_OWNER_PAYMENT_TERM',
}

export interface ServiceCompanyView {
  id: string;
  name: string;
  language: Language;
  contact: CompanyContact;
  meta: Meta;
  settings: Settings;
}

export interface ServiceCompany {
  id: string;
  name: string;
  contact: CompanyContact;
  billingAddress?: Address;
  postalAddress?: Address;
  businessAddress?: Address;
  statistics?: {
    numberOfUsers: number;
    numberOfMainUsers?: number;
    numberOfContractors?: number;
    lastActivity?: Date;
  };
  language: Language;
  meta: Meta;
  settings: Settings;
}

export interface ServiceCompanyActivity<T> {
  createdAt: string;
  data: T;
  description: string;
  id: string;
  requestId: string;
  serviceCompanyId: string;
  type: ActivityMessageType;
}

export interface ServiceCompanyActivityParams {
  serviceCompanyId: string;
  start: string;
  end: string;
  pageIndex: number;
  pageSize: number;
  query?: string;
  type?: ActivityMessageType[];
}

export interface ServiceCompanyTerms {
  serviceCompanyId: string;
  pageIndex: number;
  pageSize: number;
  query?: string;
  type?: ServiceCompanyType[];
}

export interface ContractSummary {
  numberOfValidContract?: number;
  numberOfExpiringContract?: number;
}

export interface ServiceCompanySummary {
  id: string;
  serviceCompanyId: string;
  serviceOrderSummary: ServiceOrderSummary;
  time: string;
  timeUnit: ServiceCompanyTimeUnit;
  elevatorSummary: {numberOfActiveContractElevator: number};
  contractSummary: ContractSummary;
}

export interface ServiceCompanySummaryParams {
  serviceCompanyId: string;
  date: string;
  timeUnit: ServiceCompanyTimeUnit;
}

export interface ServiceCompanySimpleView {
  id: string;
  name: string;
  meta: Meta;
}

export interface CreateServiceCompanyRecord {
  name: string;
  phone: string;
  email: string;
  url: string;
  language: Language;
  totalYearlyVacationDaysAllowed: number;
  dateFormat: String;
}

export interface UpdateServiceCompanyRecord {
  name: string;
  phone: string;
  email: string;
  url: string;
  language: Language;
  totalYearlyVacationDaysAllowed: number;
  dateFormat: String;
}

export interface ServiceCompanyTechEvent {
  eventViews: TechnicianEventView[];
  technicianId: string;
}

export interface ServiceCompanyItem extends ServiceCompany {
  billingAddress?: Address;
  search?: string;
}

export interface ServiceCompanyUpdateBody {
  name?: string;
  phone?: string;
  email?: string;
  url?: string;
  language?: string;
  totalYearlyVacationDaysAllowed?: number;
  dateFormat?: string;
  timeFormat?: string;
  businessAddress?: AddressRecord;
  postalAddress?: AddressRecord;
  billingAddress?: AddressRecord;
  paymentInfo?: PaymentInfo;
  paymentInfo2?: PaymentInfo;
  managingDirector?: string;
  owner?: string;
  arbitrationCourt?: string;
  tradeRegisterNumber?: string;
  vatId?: string;
  taxNumber?: string;
  percentageVat?: number;
  timezone?: string;
  currencies?: string[];
  whiteLabel?: {
    logoPath?: string;
  };
  contractTypes?: string[];
  contractNameTypes?: ContractNameTypes[];
  serviceOrderGenerationEnabled?: boolean;
  contractInvoiceGenerationEnabled?: boolean;
  invoiceQRCodeEnabled?: boolean;
  serviceOrderGenerationDaysInAdvance?: number;
  minToHourStep?: MinToStep | number;
  accountSystem?: AccountSystems;
  accountantNumber?: string;
  clientNumber?: string;
  fiscalYearStart?: string;
}

export interface SystemSettingsUpdateBody {
  nightlyShuffleEnabled?: boolean;
  companyDispatchStrategy?: DispatchStrategy | string;
}

export interface ServiceCompanyNextNumberParams {
  serviceCompanyId: string;
  type: ServiceCompanyNumberType;
}

export interface StringValueResponse {
  value: string;
}

export interface AutoNumberConfigRecord {
  type: ServiceCompanyNumberType;
  prefix?: string;
  numberOfDigits?: number;
  enabled?: boolean;
  startFrom?: number;
}

export interface AutoNumberConfig {
  configRecords: AutoNumberConfigRecord[];
}

export interface DataSyncStatusParams {
  serviceCompanyId?: string;
  type: DataSyncType;
}

export interface DataSyncStatus {
  lastSyncedTime: Date;
}

export interface XeroIntegration {
  enabled: boolean;
  clientId: string;
  secret: string;
  tenantId: string;
}

export enum TravelWorkCalculationType {
  FIXED_FEE = 'FIXED_FEE',
  HOURLY_RATE_WORK = 'HOURLY_RATE_WORK',
  HOURLY_RATE_TRAVEL = 'HOURLY_RATE_TRAVEL',
  HOURLY_RATE_WORK_TRAVEL = 'HOURLY_RATE_WORK_TRAVEL',
  FIXED_TRAVEL_FEE = 'FIXED_TRAVEL_FEE',
  FIXED_TRAVEL_TIME = 'FIXED_TRAVEL_TIME',
  FIXED_TRAVEL_DISTANCE = 'FIXED_TRAVEL_DISTANCE',
}

export const TravelWorkCalculationTypeLabels = {
  [TravelWorkCalculationType.FIXED_FEE]: 'Fixed Fee',
  [TravelWorkCalculationType.HOURLY_RATE_WORK]: 'Hourly rate (work)',
  [TravelWorkCalculationType.HOURLY_RATE_TRAVEL]: 'Hourly rate (travel)',
  [TravelWorkCalculationType.HOURLY_RATE_WORK_TRAVEL]:
    'Hourly rate (work & travel)',
  [TravelWorkCalculationType.FIXED_TRAVEL_FEE]: 'Fixed travel fee (unit)',
  [TravelWorkCalculationType.FIXED_TRAVEL_TIME]: 'Fixed travel time (unit)',
  [TravelWorkCalculationType.FIXED_TRAVEL_DISTANCE]:
    'Fixed travel distance (unit)',
};

export const travelWorkCalculationTypeOptions = Object.values(
  TravelWorkCalculationType,
).map((value) => ({
  label: TravelWorkCalculationTypeLabels[value],
  value,
}));

export interface TravelWorkView {
  id: string;
  serviceOrderType: string;
  calculationType: TravelWorkCalculationType;
  article: ArticleView;
}

export interface TravelWorkParams {
  serviceOrderType: string;
}

export interface CreateTravelWorkRecord {
  serviceCompanyId: string;
  propertyOwnerId?: string;
  serviceOrderType: string;
  calculationType: TravelWorkCalculationType;
  articleId: string;
  articleSellingPrice?: number;
}

export interface UpdateTravalWorkRecord {
  id: string;
  serviceOrderType: string;
  calculationType: TravelWorkCalculationType;
  articleId: string;
  articleSellingPrice?: number;
}

export interface TravelWorkFormValues {
  serviceOrderType: ServiceOrderType;
  calculationType: TravelWorkCalculationType;
  articleId: string;
  articleSellingPrice?: number;
}

export enum AccountSystems {
  Empty = 'Empty',
  KMU = 'KMU',
  'SKR 03' = 'SKR 03',
  'SKR 04' = 'SKR 04',
  'SKR 07' = 'SKR 07',
}

export interface ServiceCompanyItemNew {
  id: number;
  companyName: string;
  country: string;
  noOfUsers: number;
  noOfLicense: number;
  created: string;
  lastActive: string;
  status: string;
}

export interface ServiceCompanySystemSettings {
  nightlyShuffleEnabled: boolean;
  companyDispatchStrategy: string;
  serviceCompanyStatus: CompanyStatus;
  expiryDate: string;
  userLimits: {
    maxMainUserCount: number;
    maxContractorCount: number;
  };
}

export interface FetchElevatorDataSchemaParams {
  pageIndex: number;
  pageSize: number;
  query?: string;
}

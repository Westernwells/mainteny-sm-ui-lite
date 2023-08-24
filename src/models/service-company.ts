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
import {ServiceOrderSummary} from './service-order';
import {TechnicianEventView} from './technician';

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
  postalAddress?: Address;
  businessAddress?: Address;
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

export interface ServiceCompanySummary {
  id: string;
  serviceCompanyId: string;
  serviceOrderSummary: ServiceOrderSummary;
  time: string;
  timeUnit: ServiceCompanyTimeUnit;
  elevatorSummary: {numberOfActiveContractElevator: number};
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
  managingDirector?: string;
  arbitrationCourt?: string;
  tradeRegisterNumber?: string;
  vatId?: string;
  percentageVat?: number;
  timezone?: string;
  currencies?: string[];
  whiteLabel?: {
    logoPath?: string;
  };
  contractTypes?: string[];
  contractNameTypes?: ContractNameTypes[];
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

import {Address, CompanyContact, Language, Meta, Settings} from './misc';
import {ServiceOrderSummary} from './service-order';
import {TechnicianEventView} from './technician';

export enum ServiceCompanyTimeUnit {
  DAILY = 'DAILY',
  QUARTERLY = 'QUARTERLY',
  WEEKLY = 'WEEKLY',
  YEARLY = 'YEARLY',
  MONTHLY = 'MONTHLY',
}
export enum ActivityMessageType {
  SERVICE_ORDER_COMPLETED = 'SERVICE_ORDER_COMPLETED',
  SERVICE_ORDER_STARTED = 'SERVICE_ORDER_STARTED',
  SERVICE_ORDER_SCHEDULED = 'SERVICE_ORDER_SCHEDULED',
  SERVICE_ORDER_EXPIRED = 'SERVICE_ORDER_EXPIRED',
  SERVICE_ORDER_UNSCHEDULED = 'SERVICE_ORDER_UNSCHEDULED',
  SERVICE_ORDER_NO_ASSIGNMENT = 'SERVICE_ORDER_NO_ASSIGNMENT',
}

export interface ServiceCompanyView {
  id: string;
  name: string;
  language: Language;
  contact: CompanyContact;
  meta: Meta;
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

export interface ServiceCompanySummary {
  id: string;
  serviceCompanyId: string;
  serviceOrderSummary: ServiceOrderSummary;
  time: string;
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

import {Client} from './client';
import {ServiceCompany} from './service-company';
import {Amount, Meta, Order, TimeWindowRecord, TimeWindowType} from './misc';
import {Elevator, ElevatorSimpleView, ElevatorView} from './elevator';
import {PropertyOwnerSimpleView} from './propertyManager';
import {FileResource} from './media';

export enum ContractStatus {
  PENDING = 'PENDING',
  VALID = 'VALID',
  EXPIRED = 'EXPIRED',
}

export enum ContractOrderField {
  EXPIRY_TIME = 'EXPIRY_TIME',
  CREATED_TIME = 'CREATED_TIME',
}

export enum ContractTypes {
  SERVICE = 'SERVICE',
  NON_SERVICE = 'NON_SERVICE',
}

export interface ContractNameTypes {
  name: string;
  type: ContractTypes;
}

export interface ContractTimeWindow {
  id: string;
  contractId: string;
  fromTime: string;
  toTime: string;
  type: TimeWindowType;
}

export interface ContractElevator {
  id: string;
  contractId: string;
  elevator: Elevator;
}

export interface Contract {
  id: string;
  propertyOwner: Client;
  type: string;
  elevators: ContractElevator[];
  visitsNumber: number;
  sla: number;
  spendingLimit: number;
  price: number;
  currency: string;
  startTime: string;
  endTime: string;
  timePreference: ContractTimeWindow[];
  status: ContractStatus;
  meta: Meta;
}

export interface QueryContractParams {
  order: Order;
  orderBy: ContractOrderField;
  pageIndex: number;
  pageSize: number;
  query: string;
  serviceCompanyId: string;
  status?: string[];
  priceStart: number;
  priceEnd: number;
}

export enum InvoiceCyle {
  YEARLY = 'YEARLY',
  HALF_YEARLY = 'HALF_YEARLY',
  QUARTERLY = 'QUARTERLY',
  AFTER_EACH_VISIT = 'AFTER_EACH_VISIT',
}

export interface ContractDiscount {
  days: number;
  discountPercentage: number;
}
export interface FirstMaintenance {
  year: number;
  month: number;
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
  firstMaintenance: FirstMaintenance;
  firstInvoiceDate: string;
  paymentTerms?: string;
}

export interface ContractElevatorSimpleView {
  id: string;
  contractId: string;
  elevator: ElevatorSimpleView;
}

export interface ContractView {
  additionalInfo: ContractAdditionalInfo;
  id: string;
  propertyOwner: PropertyOwnerSimpleView;
  name: string;
  type: ContractTypes;
  visitsNumber: number;
  number: number;
  externalId: string;
  sla: number;
  spendingLimit: number;
  currency: string;
  startTime: string;
  endTime: string;
  elevators: ContractElevatorSimpleView[];
  timePreference: ContractTimeWindow[];
  description: string;
  status: ContractStatus;
  search: string;
  meta: Meta;
}
export interface ContractSimpleView {
  id: string;
  type: string;
  visitsNumber: number;
  sla: number;
  spendingLimit: number;
  price: number;
  number: number;
  currency: string;
  startTime: string;
  endTime: string;
  search: string;
  status: ContractStatus;
  meta: Meta;
}

export interface CreateContractRecord {
  propertyOwnerId: string;
  serviceCompanyId: string;
  type: string;
  elevators: string[];
  visitsNumber: number;
  sla: number;
  spendingLimit: number;
  price: number;
  currency: string;
  startDate: string;
  endDate: string;
  timePreference: TimeWindowRecord[];
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
  timePreference: TimeWindowRecord[];
}

export interface ContractRecord {
  contract: ContractView;
  elevators: ElevatorView[];
}

export interface ContractFilters {
  contractor?: string[];
  expiryDate?: string[];
  status?: string[];
}

export interface CustomerContractParams {
  order: Order;
  orderBy: ContractOrderField;
  pageIndex: number;
  pageSize: number;
  query: string;
  serviceCompanyId: string;
  status?: string[];
  priceStart: number;
  priceEnd: number;
}

export interface ElevatorContractParams {
  elevatorIds: string[];
  status: ContractStatus[];
}

export interface ContractTimeWindowRecord {
  fromTime: string;
  toTime: string;
  type: TimeWindowType;
}

export interface ContractPrice {
  currency?: string;
  netAmount?: number;
  percentageVat?: number;
}

export interface ContractRequestBody {
  currency?: string;
  endDate?: string;
  externalId?: string;
  price?: ContractPrice;
  sla?: number;
  spendingLimit?: number;
  startDate?: string;
  timePreference?: ContractTimeWindowRecord[];
  type?: string;
  visitsNumber?: number;
  invoiceDue?: string;
  renewalTerms: number;
  invoiceDueDays?: number;
  discounts?: ContractDiscount[];
  noticePeriodInMonth?: number;
  paymentTerms?: string;
}

export interface ContractBasicInfoFormModel {
  propertyOwnerId: string;
  startDate: Date | null;
  endDate: Date | null;
  name: string;
}

export interface ContractTermsFormModal {
  visitsNumber: number | string;
  invoiceCycle: string;
  netAmount: number | string;
  renewalTerms: number | string;
  spendingLimit: number | string;
  annualPriceAdjustmentPercentage: number | string;
  serviceLevelAgreement: number | string;
  firstMaintenance?: FirstMaintenance;
  firstInvoiceDate?: string;
  invoiceDueDays?: number;
  discounts?: ContractDiscount[];
  noticePeriodInMonth?: number;
  paymentTermId?: string;
}

export interface ContractUpdateRequest {
  type: ContractTypes;
  name: string;
  price: number | string;
  invoiceCycle: number;
  renewalTerms: number | string;
  visitsNumber: number | string;
  spendingLimit: number | string;
  invoiceDueDays?: number;
  annualPriceAdjustmentPercentage?: number;
  discounts?: number;
  noticePeriodInMonth?: number;
  firstMaintenance?: FirstMaintenance;
  firstInvoiceDate?: string;
  paymentTerms?: string;
  description?: string;
}

export interface ContractPaymentTermView {
  id: string;
  serviceCompanyId: string;
  term: string;
  additionalInfo: string;
  meta: Meta;
}

export interface NewContractPaymentTermBody {
  serviceCompanyId: string;
  term: string;
}

export interface UpdateContractPaymentTermRecord {
  term: string;
}

export interface UpdateContractPaymentTermView {
  term: string;
  id: string;
}

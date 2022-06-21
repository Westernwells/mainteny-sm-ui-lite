import {Client} from './client';
import {
  ServiceCompany,
  ServiceCompanySimpleView,
  ServiceCompanyView,
} from './service-company';
import {Meta, Order, OrderBy, TimeWindowRecord, TimeWindowType} from './misc';
import {Elevator, ElevatorStatus, ElevatorView} from './elevator';
import {PropertyOwnerSimpleView, PropertyOwnerView} from './propertyManager';

export enum ContractStatus {
  PENDING = 'PENDING',
  VALID = 'VALID',
  EXPIRED = 'EXPIRED',
}

export enum ContractType {
  BASIC = 'BASIC',
  MEDIUM = 'MEDIUM',
  PREMIUM = 'PREMIUM',
}

export enum ContractOrderField {
  EXPIRY_TIME = 'EXPIRY_TIME',
  CREATED_TIME = 'CREATED_TIME',
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
  serviceCompany: ServiceCompany;
  type: ContractType;
  elevators: ContractElevator[];
  visitsNumber: number;
  sla: number;
  spendingLimit: number;
  price: number;
  hourlyRate: number;
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
}

export interface ContractDocuments {
  createdAt: string;
  description: string;
  id: string;
  type: string;
  uri: string;
}

export interface ContractPrice {
  currency: string;
  grossAmount: number;
  netAmount: number;
  percentageVat: number;
  vat: number;
}

export interface ContractAdditionalInfo {
  annualPriceAdjustmentPercentage: number;
  documents: ContractDocuments[];
  invoiceDue: string;
  price: ContractPrice;
  renewalTerms: number;
  scope: string[];
}

export interface ContractView {
  additionalInfo: ContractAdditionalInfo;
  id: string;
  propertyOwner: PropertyOwnerSimpleView;
  serviceCompany: ServiceCompanySimpleView;
  type: ContractType;
  visitsNumber: number;
  number: number;

  sla: number;
  spendingLimit: number;
  price: number;

  hourlyRate: number;
  currency: string;
  startTime: string;
  endTime: string;
  units?: number;
  timePreference: ContractTimeWindow[];

  status: ContractStatus;
  search: string;
  meta: Meta;
}

export interface FormikContractView {
  type: string;
  visitsNumber: number;
  spendingLimit: number;
  price: number;
  renewalTerms: number;
  invoiceDue: string;
}

export interface ContractViewWithUnits {
  contractView: ContractView;
  units: number;
}

export interface ContractSimpleView {
  id: string;
  type: ContractType;
  visitsNumber: number;
  sla: number;
  spendingLimit: number;
  price: number;
  hourlyRate: number;
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
  type: ContractType;
  elevators: string[];
  visitsNumber: number;
  sla: number;
  spendingLimit: number;
  price: number;
  hourlyRate: number;
  currency: string;
  startDate: string;
  endDate: string;
  timePreference: TimeWindowRecord[];
}

export interface UpdateContractRecord {
  id: string;
  type: ContractType;
  visitsNumber: number;
  sla: number;
  spendingLimit: number;
  price: number;
  hourlyRate: number;
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
  price?: number[][];
  status?: string[];
}

export interface CustomerContractParams {
  order: Order;
  orderBy: ContractOrderField;
  pageIndex: number;
  pageSize: number;
  query: string;
  serviceCompanyId: string;
  status?: ContractStatus;
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

export interface ContractRequestBody {
  currency: string;
  endDate: string;
  externalId: string;
  hourlyRate: number;
  price: number;
  sla: number;
  spendingLimit: number;
  startDate: string;
  timePreference: ContractTimeWindowRecord[];
  type: string;
  visitsNumber: number;
}

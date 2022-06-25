import {Client} from './client';
import {
  ServiceCompany,
  ServiceCompanySimpleView,
  ServiceCompanyView,
} from './service-company';
import {
  Amount,
  Meta,
  Order,
  OrderBy,
  TimeWindowRecord,
  TimeWindowType,
} from './misc';
import {
  Elevator,
  ElevatorSimpleView,
  ElevatorStatus,
  ElevatorView,
} from './elevator';
import {PropertyOwnerSimpleView, PropertyOwnerView} from './propertyManager';
import {List} from '@mui/material';
import {FileResource} from './media';

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

export enum InvoiceDueType {
  YEARLY = 'YEARLY',
  HALF_YEARLY = 'HALF_YEARLY',
  QUARTERLY = 'QUARTERLY',
  AFTER_EACH_VISIT = 'AFTER_EACH_VISIT',
}

export interface ContractAdditionalInfo {
  renewalTerms?: number;
  price?: Amount;
  annualPriceAdjustmentPercentage?: number;
  invoiceDue?: InvoiceDueType;
  documents?: FileResource;
  scope?: string[];
}

export interface ContractElevatorSimpleView {
  id: string;
  contractId: string;
  elevator: ElevatorSimpleView;
}

export interface ContractView {
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
  elevators: ContractElevatorSimpleView[];
  timePreference: ContractTimeWindow[];
  status: ContractStatus;
  additionalInfo: ContractAdditionalInfo;
  search: string;
  meta: Meta;
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

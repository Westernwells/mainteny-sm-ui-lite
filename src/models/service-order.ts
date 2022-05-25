import {
  ServiceCompany,
  ServiceCompanySimpleView,
  ServiceCompanyView,
} from './service-company';
import {AttachmentResource, Elevator, ElevatorSimpleView} from './elevator';
import {Contract, ContractSimpleView} from './contract';
import {Fee, JobStatus, Meta, Order} from './misc';
import {Technician, TechnicianSimpleView} from './technician';
import {UserAccount, UserAccountSimpleView} from './user';

export enum ServiceOrderPriority {
  A = 'A',
  B = 'B',
  C = 'C',
  NONE = 'NONE',
}

export enum ServiceOrderStatus {
  ALL = 'ALL',
  INIT = 'INIT',
  READY_TO_SCHEDULE = 'READY_TO_SCHEDULE',
  SCHEDULING = 'SCHEDULING',
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export enum ServiceOrderType {
  REGULAR = 'REGULAR',
  EMERGENCY = 'EMERGENCY',
  REPAIR = 'REPAIR',
  CALLOUT = 'CALLOUT',
}

export enum ServiceOrderOrderField {
  CREATED_TIME = 'CREATED_TIME',
  DUE_DATE = 'DUE_DATE',
}

export const ServiceOrderTypeValue = {
  [ServiceOrderType.EMERGENCY]: 1,
  [ServiceOrderType.CALLOUT]: 2,
  [ServiceOrderType.REPAIR]: 3,
  [ServiceOrderType.REGULAR]: 4,
};

export enum DispatchPlanStatus {
  INIT = 'INIT',
  PLANNING = 'RUNNING',
  DONE = 'DONE',
  ERROR = 'ERROR',
}

export enum JobScheduleType {
  AUTO = 'AUTO',
  FIXED = 'FIXED',
}

export interface ServiceOrder {
  id: string;
  number: string;
  externalID: string;
  serviceCompany: ServiceCompany;
  elevator: Elevator;
  contract: Contract;
  description: string;
  type: ServiceOrderType;
  status: ServiceOrderStatus;
  lastVisitDate: string;
  possibleVisitDate: string;
  expectedVisitDate: string;
  dueDate: string;
  actualStartTime: number;
  actualEndTime: number;
  schedules: ServiceOrderSchedule[];
  search: string;
  meta: Meta;
  additionalInfo: ServiceOrderAdditionalInfo;
  serviceTime: number;
}

export interface ServiceOrderAdditionalInfo {
  appointmentConfirmed: boolean;
  appointmentNotificationDueDate?: string;
  appointmentNotificationRequired: boolean;
  appointmentNotificationSent: boolean;
  priority: ServiceOrderPriority;
}

export interface ServiceOrderView {
  id: string;
  number: string;
  externalID: string;
  serviceCompany: ServiceCompanySimpleView;
  elevator: ElevatorSimpleView;
  contract?: ContractSimpleView;
  description: string;
  type: ServiceOrderType;
  status: ServiceOrderStatus;
  lastVisitDate: string;
  expectedVisitDate: string;
  actualStartTime?: string;
  actualEndTime?: string;
  dueDate: string;
  serviceTime?: number;
  schedules: ServiceOrderScheduleSimpleView[];
  labels: string[];
  search: string;
  meta: Meta;
  additionalInfo: ServiceOrderAdditionalInfo;
}

export interface AppointmentRes {
  appointment: ServiceOrderView;
  tech: Technician;
}

export interface ServiceOrderActivity {
  id: string;
  actionTime: number;
  actionType: string;
  description: string;
  serviceOrderId: string;
  userAccount: UserAccount;
}

export interface DispatchPlanView {
  id: string;
  serviceCompany: ServiceCompanyView;
  planMonth: string;
  status: DispatchPlanStatus;
  notes: string;
  meta: Meta;
}

export interface TechnicianDispatchPlanSimpleView {
  id: string;
  technician: TechnicianSimpleView;
  description: string;
  startTime: string;
  endTime: string;
}

export interface TechnicianDispatchJobView {
  id: string;
  status: JobStatus;
  description: string;
  plan: TechnicianDispatchPlanSimpleView;
  meta: Meta;
}

export interface ServiceOrderSchedule {
  id: string;
  serviceOrderId: string;
  technician: Technician;
  startTime: string;
  endTime: string;
}

export interface ServiceOrderScheduleSimpleView {
  id: string;
  serviceOrderId: string;
  technician: TechnicianSimpleView;
  startTime: string;
  endTime: string;
  type: JobScheduleType;
  source: string;
  createdAt: string;
}

export interface UpdateServiceOrder {
  id: string;
  externalId: string;
  description: string;
  priority: ServiceOrderPriority;
}

export interface UpdateJobSchedule {
  startTime: string;
  endTime: string;
  technicianIds: string[];
  type: JobScheduleType;
}

export interface CompleteServiceOrder {
  attachments: string[];
  description: string;
  serviceTime: number;
}

export interface ServiceOrderSummary {
  avgCalloutServiceTime: number;
  avgEmergencyServiceTime: number;
  avgRepairServiceTime: number;
  numberOfCancelledOrders: number;
  numberOfCompletedOrders: number;
  numberOfOverDueOrders: number;
  numberOfScheduledOrders: number;
  numberOfUpcomingOrders: string;
  overDueOrderStartDate?: string;
  upcomingOrderEndDate?: string;
}

export interface ServiceOrderReport {
  id: string;
  elevator: ElevatorSimpleView;
  description: string;
  attachments: AttachmentResource[];
  technician: TechnicianSimpleView;
  createdAt: number;
  actualServiceTime: number;
  serviceOrderId: string;
  fee: Fee;
}

export interface ServiceOrderScheduleParams {
  elevatorIds?: string[];
  end: string;
  start: string;
  pageIndex: number;
  pageSize: number;
  query: string;
  status?: ServiceOrderStatus[];
  serviceCompanyId?: string;
  technicianIds?: string[];
}

export interface ServiceOrderQueryParams {
  elevatorIds?: string[];
  end: string;
  start: string;
  pageIndex: number;
  pageSize: number;
  query: string;
  status?: ServiceOrderStatus[];
  serviceCompanyId?: string;
  technicianIds?: string[];
  order?: Order;
  orderBy?: ServiceOrderOrderField;
  types?: ServiceOrderType[];
}

export interface ServiceOrderActivityView {
  actionTime: string;
  actionType: string;
  data: string;
  description: string;
  id: string;
  serviceOrderId: string;
  userAccount: UserAccountSimpleView;
}

export interface RedispatchParams {
  technicianId: string;
  serviceOrderId: string;
}

export interface UpdateServiceOrderBody {
  endTime: string;
  startTime: string;
  technicianIds: string[];
  type: JobScheduleType;
}

export interface AssignmentBasedOrderBody {
  description?: string;
  elevatorId: string;
  externalId: string;
  labels?: string[];
  moreInformation?: string;
  priority: ServiceOrderPriority;
  serviceCompanyId: string;
  technicianIds: string[];
  time: string;
  type: ServiceOrderType;
}

export interface CreateScheduledServiceOrderBody {
  description: string;
  elevatorId: string;
  endTime: string;
  externalId: string;
  labels?: string[];
  moreInformation?: string;
  priority: ServiceOrderPriority;
  requireReschedule: boolean;
  requireTechnicianNotification: boolean;
  serviceCompanyId: string;
  startTime: string;
  technicianIds: string[];
  type: ServiceOrderType;
}

export interface CreateNonScheduledServiceOrderBody {
  description: string;
  dueDate: string;
  elevatorId: string;
  externalId: string;
  labels?: string[];
  moreInformation?: string;
  priority: ServiceOrderPriority;
  serviceCompanyId: string;
  type: ServiceOrderType;
}

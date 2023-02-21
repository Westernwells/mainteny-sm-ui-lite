import {
  ServiceCompany,
  ServiceCompanySimpleView,
  ServiceCompanyView,
} from './service-company';
import {
  AttachmentResource,
  Elevator,
  ElevatorSimpleView,
  ElevatorView,
} from './elevator';
import {Contract, ContractSimpleView} from './contract';
import {Amount, Fee, JobStatus, Meta, Order, PdfGenerationStatus} from './misc';
import {Technician, TechnicianSimpleView} from './technician';
import {UserAccount, UserAccountSimpleView} from './user';
import {EmployeesSimpleView, EmployeesView} from './employee';
import {ArticleView} from './article';
import {FileResource} from './media';

export enum Priority {
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
  DONE = 'DONE',
}

export enum ServiceOrderType {
  REGULAR = 'REGULAR',
  EMERGENCY = 'EMERGENCY',
  REPAIR = 'REPAIR',
  CALLOUT = 'CALLOUT',
  INSPECTION = 'INSPECTION',
  NEW_INSTALLATION = 'NEW_INSTALLATION',
}

export enum ServiceOrderOrderField {
  CREATED_TIME = 'CREATED_TIME',
  LAST_VISIT_DATE = 'LAST_VISIT_DATE',
  NEXT_VISIT_DATE = 'NEXT_VISIT_DATE',
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

export interface ServiceOrderCheckListInfo {
  checkListId: string;
  technicianSignature: string;
  pdfPath: string;
  pdfGenerationStatus: PdfGenerationStatus;
}
export interface ServiceOrder {
  id: string;
  number: string;
  externalID: string;
  articles: ServiceOrderArticleView[];
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
  priority: Priority;
  checkListInfo?: ServiceOrderCheckListInfo;
  moreInformation: string;
  quotationId: string;
  workReportGenerated: boolean;
}

export interface ServiceOrderView {
  id: string;
  number: string;
  externalId: string;
  articles: ServiceOrderArticleView[];
  serviceCompany: ServiceCompanySimpleView;
  elevator: ElevatorView;
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

export interface ServiceOrderSimpleView {
  actualStartTime?: string;
  actualEndTime?: string;
  additionalInfo: ServiceOrderAdditionalInfo;
  description: string;
  dueDate: string;
  expectedVisitDate: string;
  id: string;
  labels: string[];
  lastVisitDate: string;
  meta: Meta;
  number: string;
  schedules: ServiceOrderScheduleSimpleView[];
  search: string;
  serviceCompanyId: string;
  serviceTime?: number;
  status: ServiceOrderStatus;
  type: ServiceOrderType;
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
  technician: EmployeesView;
  startTime: string;
  endTime: string;
}

export interface ServiceOrderScheduleSimpleView {
  id: string;
  serviceOrderId: string;
  technician: EmployeesSimpleView;
  startTime: string;
  endTime: string;
  type: JobScheduleType;
  source: string;
  createdAt: string;
}

export interface UpdateServiceOrderBody {
  externalId: string;
  description: string;
  priority: Priority;
  quotationId: string;
  checkListId: string;
}

export interface UpdateJobSchedule {
  startTime: string;
  endTime: string;
  technicianIds: string[];
  type: JobScheduleType;
}

export interface CompleteServiceOrder {
  answers: CheckListAnswerRecord[];
  description: string;
  externalId: string;
  serviceTime: number;
}

export interface CheckListAnswerRecord {
  answer: string;
  questionId: string;
}

export interface ServiceOrderSummary {
  avgCalloutServiceTime: number;
  avgEmergencyServiceTime: number;
  avgRepairServiceTime: number;
  numberOfOrders: number;
  numberOfCancelledOrders: number;
  numberOfCompletedOrders: number;
  numberOfOverDueOrders: number;
  numberOfScheduledOrders: number;
  numberOfUpcomingOrders: string;
  overDueOrderStartDate?: string;
  upcomingOrderEndDate?: string;
}

export interface ServiceOrderReportAdditionalInfo {
  checkListAnswers: CheckListAnswerRecord[];
  pdfPath: string;
  pdfGenerationStatus: PdfGenerationStatus;
}

export interface ServiceOrderReportArticleView {
  article: ArticleView;
  id: string;
  quantity: number;
  serviceOrderReportId: string;
  unitAmount: Amount[];
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
  serviceOrder: ServiceOrderView;
  fee: Fee;
}

export interface ServiceOrderReportAttachmentView {
  fileResource: FileResource;
  id: string;
  serviceOrderReportId: string;
}

export interface ServiceOrderReportSignatureView {
  id: string;
  serviceOrderReportId: string;
  fileResource: FileResource;
}

export interface ServiceOrderReportView {
  number: string;
  actualServiceTime: number;
  additionalInfo: ServiceOrderReportAdditionalInfo;
  attachments: ServiceOrderReportAttachmentView[];
  description: string;
  elevator: ElevatorView;
  externalId: string;
  id: string;
  meta: Meta;
  serviceOrder: ServiceOrderView;
  totalAmount: Amount;
  signatures: ServiceOrderReportSignatureView[];
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
  types?: ServiceOrderType[];
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

export interface UpdateServiceOrderScheduleBody {
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
  priority: Priority;
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
  priority: Priority;
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
  priority: Priority;
  serviceCompanyId: string;
  type: ServiceOrderType;
}

export interface ServiceOrderArticleView {
  article: ArticleView;
  description: string;
  id: string;
  name: string;
  quantity: number;
  serviceOrderId: string;
  unitAmount: Amount;
}
export interface ServiceOrderItemRecord {
  articleId: string;
  articleUnit: string;
  description: string;
  name: string;
  quantity: number;
  unitAmount: Amount;
}

export interface AppointmentConfirmationRequiredOrdersQueryParams {
  pageIndex: number;
  pageSize: number;
  query?: string;
  serviceCompanyId?: string;
}

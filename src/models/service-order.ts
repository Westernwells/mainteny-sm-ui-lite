import {ServiceCompany, ServiceCompanyView} from './service-company';
import {
  AttachmentResource,
  Elevator,
  ElevatorSimpleView,
  ElevatorView,
} from './elevator';
import {Contract, ContractSimpleView} from './contract';
import {
  Amount,
  Fee,
  JobStatus,
  Meta,
  Order,
  PdfGenerationStatus,
  AmountRecord,
} from './misc';
import {Technician, TechnicianSimpleView} from './technician';
import {UserAccount, UserAccountSimpleView} from './user';
import {EmployeesSimpleView, EmployeesView} from './employee';
import {ArticleView, ServiceOrderArticleRecord} from './article';
import {FileResource, FileResourceRecord} from './media';
import {ServiceOrderPaymentStatusView} from 'utils/service-order-utils';

export enum Priority {
  A = 'A',
  B = 'B',
  C = 'C',
  NONE = 'NONE',
}

export interface CallerInfo {
  name: string;
  calledAt?: string;
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
  INVOICE_ISSUED = 'INVOICE_ISSUED',
  DONE = 'DONE',
}

export enum ServiceOrderPaymentStatus {
  NOT_PAID = 'NOT_PAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
  AUTO_GENERATED = 'AUTO_GENERATED',
  NONE = 'NONE',
}

export enum ServiceOrderType {
  REGULAR = 'REGULAR',
  EMERGENCY = 'EMERGENCY',
  REPAIR = 'REPAIR',
  CALLOUT = 'CALLOUT',
  INSPECTION = 'INSPECTION',
  NEW_INSTALLATION = 'NEW_INSTALLATION',
  MODERNIZATION = 'MODERNIZATION',
  GENERAL = 'GENERAL',
}

export enum ServiceOrderOrderField {
  CREATED_TIME = 'CREATED_TIME',
  LAST_VISIT_DATE = 'LAST_VISIT_DATE',
  NEXT_VISIT_DATE = 'NEXT_VISIT_DATE',
}

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

export enum ChecklistStatus {
  INIT = 'INIT',
  COMPLETED = 'COMPLETED',
}

export interface ServiceOrderCheckListInfo {
  checkListId: string;
  technicianSignature: string;
  pdfPath: string;
  pdfGenerationStatus: PdfGenerationStatus;
  status: ChecklistStatus;
}
export interface ServiceOrder {
  id: string;
  number: string;
  externalID: string;
  articles: ServiceOrderArticleView[];
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
  confirmationInfo?: ServiceOrderConfirmationInfo;
  purchaseOrderNumber?: string;
  callerInfo?: CallerInfo;
  paymentStatus?: ServiceOrderPaymentStatus;
}

export interface ServiceOrderConfirmationInfo {
  sentDate: string;
  pdfGenerationStatus?: PdfGenerationStatus;
  pdfPath?: string;
}

export interface ServiceOrderView {
  id: string;
  number: string;
  externalId: string;
  articles: ServiceOrderArticleView[];
  elevator: ElevatorView;
  contract?: ContractSimpleView;
  description: string;
  type: ServiceOrderType;
  status: ServiceOrderStatus;
  lastVisitDate: string;
  expectedVisitDate: string;
  actualStartTime?: string;
  actualEndTime?: string;
  travelStartTime?: string;
  travelEndTime?: string;
  dueDate: string;
  serviceTime?: number;
  schedules: ServiceOrderScheduleSimpleView[];
  labels: string[];
  search: string;
  meta: Meta;
  report?: ServiceOrderReportView;
  additionalInfo: ServiceOrderAdditionalInfo;
}

export interface ServiceOrderSimpleView {
  actualStartTime?: string;
  actualEndTime?: string;
  travelStartTime?: string;
  travelEndTime?: string;
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
  externalId?: string;
  description?: string;
  serviceTime?: number;
  travelTime?: number;
  attachments?: FileResourceRecord[];
  signatures?: FileResourceRecord[];
  startTime?: string;
  endTime?: string;
  travelStartTime?: string;
  travelEndTime?: string;
  onlyShowTotalTime?: boolean;
  articles?: ServiceOrderArticleRecord[];
}

export interface CheckListAnswerRecord {
  componentId: string;
  values: string[];
  note: string;
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
  onlyShowTotalTime: boolean;
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
  actualTravelTime?: number;
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
  propertyOwnerId?: string;
  order?: Order;
  orderBy?: ServiceOrderOrderField;
  types?: ServiceOrderType[];
  paymentStatus?: ServiceOrderPaymentStatus[];
}

export interface ServiceOrderActivityView {
  actionTime: string;
  actionType: string;
  data: string;
  description: string;
  id: string;
  serviceOrderId: string;
  creator: UserAccountSimpleView;
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
  purchaseOrderNumber?: string;
  callerInfo?: CallerInfo;
}

export interface AssignmentDescriptionOrderModel {
  callerName: string;
  callTime: string;
  purchaseOrderNumber: string;
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
  purchaseOrderNumber: string;
  callerInfo: CallerInfo;
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

export interface UpdateServiceOrderArticleRecord {
  articleId: string;
  description: string;
  name: string;
  quantity: number;
  unitAmount: AmountRecord;
}

export interface ServiceOrderConfirmationPublishBody {
  email: string;
  emails: string[];
  subject: string;
  content: string;
}

export interface AppointmentConfirmationRequiredOrdersQueryParams {
  pageIndex: number;
  pageSize: number;
  query?: string;
  serviceCompanyId?: string;
}

export const mapServiceOrderPaymentStatus = (
  invoiceStatus: ServiceOrderPaymentStatusView,
) => {
  switch (invoiceStatus) {
    case ServiceOrderPaymentStatusView.PAID:
      return ServiceOrderPaymentStatus.PAID;
    case ServiceOrderPaymentStatusView.NOT_PAID:
      return ServiceOrderPaymentStatus.NOT_PAID;
    case ServiceOrderPaymentStatusView.PARTIALLY_PAID:
      return ServiceOrderPaymentStatus.PARTIALLY_PAID;
    case ServiceOrderPaymentStatusView.AUTO_GENERATED:
      return ServiceOrderPaymentStatus.AUTO_GENERATED;
    case ServiceOrderPaymentStatusView.NONE:
      return ServiceOrderPaymentStatus.NONE;
    default:
      return ServiceOrderPaymentStatus.NONE;
  }
};

import {
  AttachmentResource,
  Elevator,
  ElevatorSimpleView,
  ElevatorView,
} from './elevator';
import {ContractSimpleView} from './contract';
import {
  Amount,
  AmountRecord,
  EmailRecord,
  Fee,
  JobStatus,
  Meta,
  MultiVatsAmount,
  PdfGenerationStatus,
  ReportStatus,
} from './misc';
import {Technician, TechnicianSimpleView} from './technician';
import {UserAccount, UserAccountSimpleView} from './user';
import {EmployeesSimpleView, EmployeesView} from './employee';
import {ArticleRecord, ArticleView} from './article';
import {FileResource, FileResourceRecord} from './media';
import {
  AggregatedAmount,
  Discount,
  InvoiceSubItemsConfig,
  InvoiceUnitAmountSource,
} from './invoice';
import {ServiceCompanySimpleView} from './service-company';
import {Order} from './pagination';
import {PropertyOwnerView} from 'models/propertyManager';
import {CommentRecord} from './comment';
import {
  ArticleInfoRecord,
  EditableQuotationSubItemRecord,
  SubItemsConfig,
} from './quotation';

export enum Priority {
  A = 'A',
  B = 'B',
  C = 'C',
  NONE = 'NONE',
}

export enum ServiceOrderArticleOwnerType {
  USER = 'USER',
  CONTRACT = 'CONTRACT',
  TRAVEL_WORK = 'TRAVEL_WORK',
  SYSTEM = 'SYSTEM',
}

export interface CallerInfo {
  name: string;
  calledAt?: string;
  phoneNumber?: string;
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
  OVERDUE = 'OVERDUE',
  INVOICE_ISSUED = 'INVOICE_ISSUED',
  TECHNICIAN_ASSIGNED = 'TECHNICIAN_ASSIGNED',
  TRAVEL = 'TRAVEL',
  PAUSED = 'PAUSED',
  ARTICLES_ORDERED = 'ARTICLES_ORDERED',
  ARCHIVED = 'ARCHIVED',
  PLANNED = 'PLANNED',
}

export enum ServiceOrderStatusFilter {
  ALL = 'ALL',
  PENDING = 'PENDING',
  OVERDUE = 'OVERDUE',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  ARCHIVED = 'ARCHIVED',
}

export const ServiceOrderFilterToStatusMap = new Map<
  ServiceOrderStatusFilter,
  ServiceOrderStatus[]
>([
  [
    ServiceOrderStatusFilter.PENDING,
    [
      ServiceOrderStatus.SCHEDULING,
      ServiceOrderStatus.SCHEDULED,
      ServiceOrderStatus.ARTICLES_ORDERED,
      ServiceOrderStatus.TECHNICIAN_ASSIGNED,
      ServiceOrderStatus.READY_TO_SCHEDULE,
      ServiceOrderStatus.PLANNED,
    ],
  ],
  [
    ServiceOrderStatusFilter.ONGOING,
    [
      ServiceOrderStatus.TRAVEL,
      ServiceOrderStatus.IN_PROGRESS,
      ServiceOrderStatus.PAUSED,
    ],
  ],
]);

export const ServiceOrderStatusToFilter: Record<
  string,
  ServiceOrderStatusFilter
> = {
  [ServiceOrderStatus.SCHEDULING]: ServiceOrderStatusFilter.PENDING,
  [ServiceOrderStatus.SCHEDULED]: ServiceOrderStatusFilter.PENDING,
  [ServiceOrderStatus.ARTICLES_ORDERED]: ServiceOrderStatusFilter.PENDING,
  [ServiceOrderStatus.TECHNICIAN_ASSIGNED]: ServiceOrderStatusFilter.PENDING,
  [ServiceOrderStatus.READY_TO_SCHEDULE]: ServiceOrderStatusFilter.PENDING,
  [ServiceOrderStatus.TRAVEL]: ServiceOrderStatusFilter.ONGOING,
  [ServiceOrderStatus.IN_PROGRESS]: ServiceOrderStatusFilter.ONGOING,
  [ServiceOrderStatus.PAUSED]: ServiceOrderStatusFilter.ONGOING,
};

export enum ServiceOrderPaymentStatus {
  NO_INVOICE = 'NO_INVOICE',
  NOT_PAID = 'NOT_PAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  OVERDUE = 'OVERDUE',
  DONE = 'DONE',
}

export enum SERVICE_ORDER_PAYMENT_STATUS_VIEW {
  NO_INVOICE = 'No Invoice',
  NOT_PAID = 'Invoice sent',
  PARTIALLY_PAID = 'Partially Paid',
  OVERDUE = 'Overdue',
  DONE = 'Done',
}

export enum ServiceOrderPaymentWithIndicationStatus {
  AUTO_GENERATED_ADDITIONAL_INVOICE_NOT_PAID = 'AUTO_GENERATED_ADDITIONAL_INVOICE_NOT_PAID',
  AUTO_GENERATED_ADDITIONAL_INVOICE_PARTIALLY_PAID = 'AUTO_GENERATED_ADDITIONAL_INVOICE_PARTIALLY_PAID',
  AUTO_GENERATED_ADDITIONAL_INVOICE_OVERDUE = 'AUTO_GENERATED_ADDITIONAL_INVOICE_OVERDUE',
}

export const PAYMENT_STATUS_TO_AUTO_GENERATED = new Map<
  ServiceOrderPaymentStatus,
  ServiceOrderPaymentWithIndicationStatus
>([
  [
    ServiceOrderPaymentStatus.NOT_PAID,
    ServiceOrderPaymentWithIndicationStatus.AUTO_GENERATED_ADDITIONAL_INVOICE_NOT_PAID,
  ],
  [
    ServiceOrderPaymentStatus.PARTIALLY_PAID,
    ServiceOrderPaymentWithIndicationStatus.AUTO_GENERATED_ADDITIONAL_INVOICE_PARTIALLY_PAID,
  ],
  [
    ServiceOrderPaymentStatus.OVERDUE,
    ServiceOrderPaymentWithIndicationStatus.AUTO_GENERATED_ADDITIONAL_INVOICE_OVERDUE,
  ],
]);

export const AUTO_GENERATED_TO_PAYMENT_STATUS = new Map<
  ServiceOrderPaymentWithIndicationStatus,
  ServiceOrderPaymentStatus
>([
  [
    ServiceOrderPaymentWithIndicationStatus.AUTO_GENERATED_ADDITIONAL_INVOICE_NOT_PAID,
    ServiceOrderPaymentStatus.NOT_PAID,
  ],
  [
    ServiceOrderPaymentWithIndicationStatus.AUTO_GENERATED_ADDITIONAL_INVOICE_PARTIALLY_PAID,
    ServiceOrderPaymentStatus.PARTIALLY_PAID,
  ],
  [
    ServiceOrderPaymentWithIndicationStatus.AUTO_GENERATED_ADDITIONAL_INVOICE_OVERDUE,
    ServiceOrderPaymentStatus.OVERDUE,
  ],
]);

export enum ServiceOrderType {
  REGULAR = 'REGULAR',
  EMERGENCY = 'EMERGENCY',
  REPAIR = 'REPAIR',
  CALLOUT = 'CALLOUT',
  INSPECTION = 'INSPECTION',
  NEW_INSTALLATION = 'NEW_INSTALLATION',
  MODERNIZATION = 'MODERNIZATION',
  GENERAL = 'GENERAL',
  OPERATION = 'OPERATION',
}

export enum ServiceOrderTypeKeys {
  'Maintenance' = ServiceOrderType.REGULAR,
  'Emergency' = ServiceOrderType.EMERGENCY,
  'Repair' = ServiceOrderType.REPAIR,
  'Callout' = ServiceOrderType.CALLOUT,
  'Inspection' = ServiceOrderType.INSPECTION,
  'Installation' = ServiceOrderType.NEW_INSTALLATION,
  'Modernization' = ServiceOrderType.MODERNIZATION,
  'General' = ServiceOrderType.GENERAL,
  'Operation' = ServiceOrderType.OPERATION,
}

export enum ServiceOrderOrderField {
  CREATED_TIME = 'CREATED_TIME',
  DUE_DATE = 'DUE_DATE',
  EXTERNAL_ID = 'EXTERNAL_ID',
  PROPERTY_OWNER_NAME = 'PROPERTY_OWNER_NAME',
  ELEVATOR_ADDRESS = 'ELEVATOR_ADDRESS',
  ELEVATOR_EXTERNAL_ID = 'ELEVATOR_EXTERNAL_ID',
  TECHNICIAN_NAME = 'TECHNICIAN_NAME',
  JOB_TYPE = 'JOB_TYPE',
  PAYMENT_STATUS = 'PAYMENT_STATUS',
  JOB_STATUS = 'JOB_STATUS',
  LAST_ACTIVITY_AT = 'LAST_ACTIVITY_AT',
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
  technicianId: string;
  pdfGenerationStatus?: PdfGenerationStatus;
  status?: ChecklistStatus;
}

export interface ServiceOrder {
  id: string;
  number: string;
  externalID: string;
  articles: ServiceOrderArticleView[];
  elevator: Elevator;
  contract: ContractSimpleView;
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

export interface ServiceOrderTimeSlot {
  startTime: string;
  minutes?: number;
}

export interface ServiceOrderAdditionalInfo {
  appointmentConfirmed: boolean;
  appointmentNotificationDueDate?: string;
  appointmentNotificationRequired: boolean;
  appointmentNotificationSent: boolean;
  priority: Priority;
  checkListInfo?: {
    checkListId?: string;
    technicianSignature?: string;
    pdfPath?: string;
    pdfGenerationStatus?: PdfGenerationStatus;
    completedAt?: string;
    status?: ChecklistStatus;
  };
  moreInformation: string;
  quotationId: string;
  workReportGenerated: boolean;
  confirmationInfo?: ServiceOrderConfirmationInfo;
  purchaseOrderNumber?: string;
  callerInfo?: CallerInfo;
  paymentStatus?:
    | ServiceOrderPaymentStatus
    | ServiceOrderPaymentWithIndicationStatus;
  workTimeInfo?: {
    timeSlots: ServiceOrderTimeSlot[];
    percentageSurcharge?: number;
    billableMinutes?: number;
    startTime: string;
    endTime: string;
  };
  travelTimeInfo?: {
    timeSlots: ServiceOrderTimeSlot[];
    percentageSurcharge?: number;
    billableMinutes?: number;
    startTime: string;
    endTime: string;
  };
  documents?: FileResource[];
  pictures?: FileResource[];
  discount?: Discount;
  commentCount?: number;
  totalAmount?: Amount;
  lastActivityAt?: string;
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
  type: ServiceOrderType | string;
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
  reports?: ServiceOrderReportView[];
  additionalInfo: ServiceOrderAdditionalInfo;
  checkLists?: ServiceOrderCheckListInfo[];
  serviceCompany: ServiceCompanySimpleView;
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
  technician?: EmployeesView;
  startTime: string;
  endTime: string;
}

export interface ServiceOrderScheduleSimpleView {
  id: string;
  serviceOrderId: string;
  technician?: EmployeesSimpleView;
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
  documents: FileResourceRecord[];
  pictures: FileResourceRecord[];
}

export interface UpdateJobSchedule {
  startTime: string;
  endTime: string;
  technicianIds: string[];
  type: JobScheduleType;
}

export interface ServiceOrderReportTimeRecord {
  timeSlots: ServiceOrderTimeSlot[];
  percentageSurcharge?: number;
}

export interface CompleteServiceOrder {
  technicianId?: string;
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
  workTimeRecord?: ServiceOrderReportTimeRecord;
  travelTimeRecord?: ServiceOrderReportTimeRecord;
  showTime?: boolean;
  showHours?: boolean;
  customerName?: string;
}

export interface CheckListAnswerRecord {
  componentId: string;
  values: string[];
  note: string;
  pictures?: FileResourceRecord[];
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
  showTime?: boolean;
  showHours?: boolean;
  workTimeInfo?: {
    timeSlots: ServiceOrderTimeSlot[];
    percentageSurcharge?: number;
    billableMinutes?: number;
    startTime: string;
    endTime: string;
  };
  travelTimeInfo?: {
    timeSlots: ServiceOrderTimeSlot[];
    percentageSurcharge?: number;
    billableMinutes?: number;
    startTime: string;
    endTime: string;
  };
  status?: ReportStatus;
  customerName?: string;
}

export interface ServiceOrderReportArticleView {
  article: ArticleView;
  id: string;
  technicianId: string;
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
  technicianId: string;
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
  contractIds?: string[];
  end?: string;
  start?: string;
  dueDateStart?: string;
  dueDateEnd?: string;
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
  grossAmountFrom?: number;
  grossAmountTo?: number;
  hasComments?: boolean;
  includeArchived?: boolean;
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

export interface UpdateServiceOrderScheduleBody {
  endTime?: string;
  startTime?: string;
  technicianIds?: string[];
  dueDate?: string;
  purchaseOrderNumber?: string;
  callerInfo?: Partial<CallerInfo>;
  paymentStatus?: ServiceOrderPaymentStatus;
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

export enum ContactChannel {
  PUSH_NOTIFICATION = 'PUSH_NOTIFICATION',
  PHONE_CALL = 'PHONE_CALL',
  SMS = 'SMS',
}

export interface CreateServiceOrderRecord {
  type: string;
  externalId?: string;
  serviceCompanyId: string;
  elevatorId: string;
  description: string;
  technicianIds: string[];
  dueDate: string;
  timeRange?: {
    start: string;
    end: string;
  };
  priority?: Priority;
  moreInformation?: string;
  labels?: string[];
  quotationId?: string;
  purchaseOrderNumber?: string;
  callerInfo?: CallerInfo;
  confirmationChannels?: ContactChannel[];
  notificationChannels?: ContactChannel[];
  comments?: CommentRecord[];
}

export enum UnitAmountSource {
  DEFAULT = 'DEFAULT',
  MIX_ARTICLE = 'MIX_ARTICLE',
  MIX_SUB_ITEMS = 'MIX_SUB_ITEMS',
}

export interface ServiceOrderSubArticlesConfig {
  subItemsVisible?: boolean;
  priceVisible?: boolean;
}
export interface ServiceOrderArticleAdditionalInfo {
  discount?: Discount;
  owner?: {
    id: string;
    name: string;
  };
  unitAmountSource?: UnitAmountSource;
  subArticlesConfig?: ServiceOrderSubArticlesConfig;
  userSeqNumber?: string;
}
export interface ServiceOrderArticleView {
  id: string;
  name: string;
  description: string;
  serviceOrderId: string;
  article: ArticleInfoRecord;
  unitPurchaseAmount?: MultiVatsAmount;
  unitAmount: MultiVatsAmount;
  quantity: number;
  ownerType?: ServiceOrderArticleOwnerType;
  additionalInfo?: ServiceOrderArticleAdditionalInfo;
}

export interface ServiceOrderItemRecord {
  articleId: string;
  articleUnit: string;
  description?: string;
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

export interface SendServiceOrderReportRecord {
  technicianId: string;
  pdfPath: string;
  email: EmailRecord;
}

export interface QueryServiceOrderCommentsParams {
  pageIndex: number;
  pageSize: number;
}

export interface CreateServiceOrderComment {
  content: string;
  subject: string;
  id?: string;
}

export type ServiceOrderTableRow = {
  serviceOrderData: ServiceOrderView;
  id: string;
  elevatorExternalId: string;
  number: string;
  type: ServiceOrderType | string;
  address: string;
  fullAddress: string;
  dueDate: string;
  technicians: EmployeesSimpleView[];
  propertyOwner: PropertyOwnerView;
  jobStatus: ServiceOrderStatus;
  paymentStatus:
    | ServiceOrderPaymentStatus
    | ServiceOrderPaymentWithIndicationStatus;
  hasNotes: boolean;
  lastActivityAt: string;
  hasSchedule: boolean;
  scheduleDate: string;
};

// used to indicate fields for the search parameter of service order endpoint
// example query [number:or00000926] [externalid:or00000926] [type:repair] [status:completed] [e:address:münchen_ost,_orleanspl._11,_81667_münchen,_deutschland_de] [e:status:running]
export type SearchParameters = {
  search?: string;
  orderNumber?: string;
};

export type ServiceOrderFilterForm = {
  customer?: string;
  technician?: EmployeesView;
  orderNumber?: string;
  contract?: string;
  orderTypes: ServiceOrderType[];
  paymentStatus: ServiceOrderPaymentStatus[];
  grossAmountMin?: number;
  grossAmountMax?: number;
  hasComment?: boolean;
  isAppointmentRequired?: boolean;
};

export enum ServiceOrderTypePriority {
  URGENT = 'URGENT',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export type ServiceOrderTypeRecord = {
  icon: string;
  name: string;
  givenName?: string;
  priority: ServiceOrderTypePriority;
  createInAdvanceDays?: number;
};

export type ServiceOrderStatistics = {
  numOfServiceOrdersPerStatus: Record<string, number>;
  numOfServiceOrdersPerType: Record<string, number>;
};

export interface ServiceOrderNameChangedRecord {
  fromName: string;
  toName: string;
}

export interface DateCellParts {
  label: string;
  date?: string | null;
}
export interface ServiceOrderSubItemRecord {
  article?: ArticleInfoRecord;
  id?: string;
  name: string;
  unitPurchaseAmount?: Amount;
  unitAmount: Amount;
  quantity: number;
  description?: string;
  userSeqNumber?: string;
  ownerType?: ServiceOrderArticleOwnerType;
  ownerName?: string;
}

export type EditableServiceOrderSubArticleRecord = ServiceOrderSubItemRecord & {
  margin?: number;
  id?: string;
  parentId?: string;
};

export interface NewServiceOrderItemRecord {
  id?: string; // only for frontend key - we don't send it to backend
  article?: ArticleInfoRecord;
  name: string;
  description?: string;
  unitPurchaseAmount?: AmountRecord;
  unitAmount: AmountRecord;
  quantity: number;
  discount?: Discount;
  subItemsConfig?: ServiceOrderSubArticlesConfig;
  subArticles?: EditableServiceOrderSubArticleRecord[];
  userSeqNumber?: string;
  ownerType?: ServiceOrderArticleOwnerType;
  ownerName?: string;
  serviceOrderId?: string;
  subItems?: EditableServiceOrderSubArticleRecord[];
}

export type EditableServiceOrderItem = NewServiceOrderItemRecord & {
  id?: string;
  margin?: number;
};

export interface UpdateServiceOrderAmountRecord {
  articles: ServiceOrderArticleRecord[];
  globalDiscount?: Discount;
}
export interface ServiceOrderArticleRecord {
  articleId?: string;
  article?: ArticleInfoRecord;
  name: string;
  description?: string;
  quantity: number;
  unitPurchaseAmount?: AmountRecord;
  unitAmount: AmountRecord;
  ownerType?: ServiceOrderArticleOwnerType;
  discount?: Discount;
  owner?: {
    id: string;
    name: string;
  };
  subArticlesConfig?: SubItemsConfig;
  subArticles?: ServiceOrderSubArticleRecord[];
  userSeqNumber?: string;
}

export interface ServiceOrderSubArticleRecord {
  articleId?: string;
  id?: string;
  article?: ArticleInfoRecord;
  name: string;
  description?: string;
  quantity: number;
  unitAmount: AmountRecord;
  unitPurchaseAmount?: AmountRecord;
  userSeqNumber?: string;
}

export interface ServiceOrderSubArticleAmount {
  discount: Discount;
  percentageVat?: number;
  amountBeforeItemDiscount: Amount;
  amountAfterItemDiscount: Amount;
  amountAfterGlobalDiscount: Amount;
}

export interface ServiceOrderArticleAmount {
  discount: Discount;
  percentageVat?: number;
  amountBeforeItemDiscount?: Amount;
  amountAfterItemDiscount: Amount;
  amountAfterGlobalDiscount?: Amount;
  subItems: ServiceOrderSubArticleAmount[];
}

export interface ServiceOrderAmountDetail {
  discount: Discount;
  amountBeforeGlobalDiscount: AggregatedAmount;
  amountAfterGlobalDiscount: AggregatedAmount;
  items: ServiceOrderArticleAmount[];
}

export interface CalculateServiceOrderAmountRecord {
  articles: ServiceOrderArticleRecord[];
  globalDiscount?: Discount;
}

export const statusLabelMap: Record<ServiceOrderStatus, string> = {
  [ServiceOrderStatus.READY_TO_SCHEDULE]: 'Created on',
  [ServiceOrderStatus.TECHNICIAN_ASSIGNED]: 'Created on',
  [ServiceOrderStatus.OVERDUE]: 'Created on',

  [ServiceOrderStatus.PLANNED]: 'Scheduled for',
  [ServiceOrderStatus.SCHEDULED]: 'Scheduled for',

  [ServiceOrderStatus.PAUSED]: 'Started on',
  [ServiceOrderStatus.TRAVEL]: 'Started on',
  [ServiceOrderStatus.IN_PROGRESS]: 'Started on',

  [ServiceOrderStatus.ARCHIVED]: 'Archived on',
  [ServiceOrderStatus.CANCELLED]: 'Canceled on',
  [ServiceOrderStatus.COMPLETED]: 'Completed on',
  [ServiceOrderStatus.ALL]: '',
  [ServiceOrderStatus.INIT]: '',
  [ServiceOrderStatus.SCHEDULING]: '',
  [ServiceOrderStatus.INVOICE_ISSUED]: '',
  [ServiceOrderStatus.ARTICLES_ORDERED]: '',
};

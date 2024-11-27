import {
  Address,
  AddressRecord,
  Fee,
  InspectionCycle,
  Meta,
  Priority,
  StringMap,
} from './misc';
import {Client} from './client';
import {TechnicianSimpleView, TechnicianView} from './technician';
import {FileResource, FileResourceRecord} from './media';
import {ServiceCompanyTimeUnit} from './service-company';
import {ServiceOrderType, ServiceOrderView} from './service-order';
import {ContractSimpleView, ContractStatus} from './contract';
import {EmployeesSimpleView, EmployeesView} from './employee';
import {
  PropertyContactPersonSimpleView,
  PropertyOwnerView,
} from './propertyManager';
import {FileWithPreview} from 'components/MyDropZone/MyDropzone';
import {Order} from './pagination';
import {InvoiceOrderField, InvoiceStatus, InvoiceType} from 'models/invoice';
import {theme} from 'theme';

export enum ElevatorCommentType {
  TODO = 'TODO',
  NOTE = 'NOTE',
}

export enum ElevatorStatus {
  RUNNING = 'RUNNING',
  BROKEN = 'BROKEN',
  JOB_ONGOING = 'JOB_ONGOING',
  UNKNOWN = 'UNKNOWN',
  OUT_OF_SERVICE = 'OUT_OF_SERVICE',
}

// order matters for quick filter
export enum ElevatorStatusFilter {
  ALL = 'ALL',
  RUNNING = 'RUNNING',
  JOB_ONGOING = 'JOB_ONGOING',
  BROKEN = 'BROKEN',
  OUT_OF_SERVICE = 'OUT_OF_SERVICE',
  UNKNOWN = 'UNKNOWN',
}

export enum ElevatorCategory {
  ELEVATOR = 'ELEVATOR',
  ESCALATOR = 'ESCALATOR',
  MOVING_WALKWAY = 'MOVING_WALKWAY',
  ROLLER_DOOR = 'ROLLER_DOOR',
  LOADING_RAMP = 'LOADING_RAMP',
  HOMELIFT = 'HOMELIFT',
  CAR_PARKING_SYSTEM = 'CAR_PARKING_SYSTEM',
  PLATFORM_LIFT = 'PLATFORM_LIFT',
  REVOLVING_GATE = 'REVOLVING_GATE',
  AUTOMATIC_DOOR = 'AUTOMATIC_DOOR',
  SMOKE_VENT = 'SMOKE_VENT',
  GARAGE_DOOR = 'GARAGE_DOOR',
  BOARDING_BRIDGE = 'BOARDING_BRIDGE',
  FACADE_ACCESS_SYSTEM = 'FACADE_ACCESS_SYSTEM',
  OTHERS = 'OTHERS',
  FREIGHT_LIFT = 'FREIGHT_LIFT',
  PASSENGER_LIFT = 'PASSENGER_LIFT',
  GOODS_LIFT = 'GOODS_LIFT',
  STAIR_LIFT = 'STAIR_LIFT',
  DUMBWAITER = 'DUMBWAITER',
  DISABLED_LIFT = 'DISABLED_LIFT',
  FREIGHT_AND_PASSENGER_LIFT = 'FREIGHT_AND_PASSENGER_LIFT',
}

export enum ElevatorOrderField {
  CREATED_TIME = 'CREATED_TIME',
  LAST_VISIT_DATE = 'LAST_VISIT_DATE',
  NEXT_VISIT_DATE = 'NEXT_VISIT_DATE',
  EXTERNAL_ID = 'EXTERNAL_ID',
  MODEL = 'MODEL',
  BUILDING_LOCATION = 'BUILDING_LOCATION',
  PROPERTY_OWNER_NAME = 'PROPERTY_OWNER_NAME',
  ADDRESS = 'ADDRESS',
  ASSIGNED_TECHNICIAN_NAMES = 'ASSIGNED_TECHNICIAN_NAMES',
  NUMBER_OF_CONTRACTS = 'NUMBER_OF_CONTRACTS',
  LAST_INSPECTION_DATE = 'LAST_INSPECTION_DATE',
  NEXT_INSPECTION_DATE = 'NEXT_INSPECTION_DATE',
  STATUS = 'STATUS',
}

export interface ElevatorQueryParams {
  id: string;
  lastVisitDateEnd: any;
  lastVisitDateStart: any;
  neLat: number;
  neLng: number;
  nextVisitDateEnd: any;
  nextVisitDateStart: any;
  order: Order;
  orderBy: ElevatorOrderField;
  pageIndex: number;
  pageSize: number;
  query: string;
  swLat: number;
  swLng: number;
  status: ElevatorStatus[];
  distanceStart: number;
  distanceEnd: number;
  lastInspectionStart: string;
  lastInspectionEnd: string;
  nextInspectionStart: string;
  nextInspectionEnd: string;
  technicianId: string[];
  externalId: string[];
  serialNumber: string[];
  model: string[];
  category: string[];
  contractStatus: ContractStatus[];
  hasTodo: boolean;
  propertyOwnerId: string[];
}

export interface ElevatorPhone {
  phoneNumber: string;
  connectionType: string;
  systemId: string;
  callCenter: string;
  location: string;
  simCardNumber: string;
  simPin: string;
}

export interface ElevatorAdditionalInfo {
  priority: Priority;
  isServiceOrderGenerationEnabled: boolean;
  deviceIds: string[];
  dueDate: string;
  serviceOrderGenerationEnabled: boolean;
  buildingLocation: string;
  builtYear: number;
  cabinType: string;
  controllerManufacturer: string;
  controllerModel: string;
  documents: FileResource[];
  emergencyContactNumber: string;
  emergencyPhoneProvider: string;
  keyLocation: string;
  lastInspectionDate?: string;
  manufacturer: string;
  numberOfStops: 5;
  parking: string;
  pictures: FileResource[];
  propertySegment: string;
  qrCode?: FileResourceRecord;
  elevatorPhone?: ElevatorPhone;
  customerAppointment: CustomerAppointment;
  drive: string;
  speed: string;
  controller: string;
  iotDevice: string;
  cageWeight: string;
  counterWeight: string;
  hoistingHeight: string;
  shaftHeight: string;
  spendingLimit: number;
  distance: number;
  travelTime: number;
  travelFee: number;
  inspectionCycle: InspectionCycle;
  numberOfPeople: number;
  nextInspectionDate?: string;
  billingAddress?: AddressRecord;
  beneficiaryAddress?: AddressRecord;
}

export interface ElevatorMaintainerRecord {
  technician: TechnicianView;
  weight: number;
}

export interface ElevatorProperty {
  id: string;
  elevatorId: string;
  key: string;
  value: string;
}

export interface Elevator {
  id: string;
  number: string;
  model: string;
  type: string;
  capacity: string;
  category: ElevatorCategory;
  technicianNumber: number;
  availability: number;
  address: Address;
  propertyOwner: Client;
  propertyManager: PropertyContactPersonSimpleView;
  lastVisitDate: string;
  nextVisitDate: string;
  serviceTime: number;
  status: ElevatorStatus;
  serialNumber: string;
  properties: ElevatorProperty[];
  additionalInfo: ElevatorAdditionalInfo;
  labels: string[];
  requiredSkills: string[];
  assignments: ElevatorMaintainerRecord[];
  search: string;
  meta: Meta;
}

export enum ElevatorTimeRuleType {
  TIME_OF_DAY_RANGE = 'TIME_OF_DAY_RANGE',
  TIME_OF_DAY = 'TIME_OF_DAY',
  DAY_OF_WEEK = 'DAY_OF_WEEK',
  DAY_OF_WEEK_AND_TIME_RANGES = 'DAY_OF_WEEK_AND_TIME_RANGES',
  DAYS_OF_WEEK_AND_TIME_RANGE = 'DAYS_OF_WEEK_AND_TIME_RANGE',
}

export interface ElevatorTimeRuleView {
  id: string;
  elevator_id: string;
  type: ElevatorTimeRuleType;
  data: string;
}

export interface ElevatorView {
  id: string;
  number: string;
  model: string;
  type: string;
  externalId: string;
  capacity: string;
  category: ElevatorCategory;
  technicianNumber: number;
  contracts: ContractSimpleView[];
  availability: number;
  address: Address;
  propertyOwner: PropertyOwnerView;
  properties: ElevatorProperty[];
  lastVisitDate: string;
  nextVisitDate: string;
  serialNumber: string;
  serviceTime: number;
  status: ElevatorStatus;
  labels: [];
  additionalInfo: ElevatorAdditionalInfo;
  assignments: ElevatorAssignmentSimpleView[];
  search: string;
  meta: Meta;
  timeRules: ElevatorTimeRuleView[];
}

export interface ElevatorSimpleView {
  id: string;
  propertyOwner: PropertyOwnerView;
  properties?: ElevatorProperty[];
  number: string;
  model: string;
  type: string;
  capacity: string;
  category: ElevatorCategory;
  address: Address;
  lastVisitDate: string;
  serviceTime: number;
  status: ElevatorStatus;
  labels: string[];
  additionalInfo: ElevatorAdditionalInfo;
  meta: Meta;
}

export interface ElevatorAssignmentSimpleView {
  elevatorId: string;
  id: string;
  technician: EmployeesSimpleView;
  weight: number;
}

export interface CreateElevatorRecord {
  propertyOwnerId: string;
  number: string;
  model: string;
  type: string;
  capacity: string;
  category: ElevatorCategory;
  technicianNumber: number;
  lastVisitDate: string;
  serviceTime: number;
  status: ElevatorStatus;
  address: AddressRecord;
  priority: Priority;
  properties: StringMap<string>;
}

export interface UpdateElevatorRecord {
  propertyOwnerId: string;
  number: string;
  model: string;
  type: string;
  capacity: string;
  category: ElevatorCategory;
  technicianNumber: number;
  lastVisitDate: string;
  serviceTime: number;
  status: ElevatorStatus;
  address: AddressRecord;
  priority: Priority;
  properties: StringMap<string>;
}

export interface ElevatorMaintenanceHistoryAttachment {
  id: string;
  elevatorMaintenanceHistoryId: string;
  fileResource: FileResource;
}

export interface ElevatorMaintenanceHistoryView {
  id: string;
  elevator: ElevatorSimpleView;
  description: string;
  attachments: ElevatorMaintenanceHistoryAttachment[];
  technician: TechnicianSimpleView;
  fee: Fee;
  serviceOrder: ServiceOrderView;
  actualServiceTime: number;
  createdAt: string;
}

export interface ElevatorAvailabilityParams {
  elevatorId: string[];
  end: string;
  start: string;
  timeUnit: ServiceCompanyTimeUnit;
}

export interface ElevatorAvailabilityAdditionalProps {
  [key: string]: number;
}

export interface ElevatorAvailability {
  [key: string]: ElevatorAvailabilityAdditionalProps;
}

export interface AttachmentResource {
  id: string;
  elevatorMaintenanceHistoryId: string;
  fileResource: FileResource;
}

export interface CustomerElevatorParams {
  pageIndex: number;
  pageSize: number;
  query: string;
  orderBy?: ElevatorOrderField;
  order?: Order;
}

export interface ElevatorDataGrid {
  address: string;
  showAddress: boolean;
}

export interface ElevatorOrderPair {
  elevator: ElevatorView;
  serviceOrder?: ServiceOrderView;
}

export interface ElevatorsByAddress {
  elevators: ElevatorOrderPair[];
  address: Address;
}

export interface ElevatorByAddr {
  [key: string]: ElevatorView[];
}

export interface DataGridElevatorView extends ElevatorView {
  showAddress: boolean;
}

export interface DaysTimeRange {
  daysOfWeek: string[];
  timeRange: {
    start: string;
    end: string;
  };
}

export interface ElevatorTimeRuleRecord {
  daysTimeRange: Partial<DaysTimeRange>[];
}

export interface CustomerAppointment {
  shouldNotifyCustomer: boolean;
  appointmentNotificationDue: number;
  requiresAppointment: boolean;
}

export interface ElevatorRequestBody {
  address: AddressRecord;
  buildingLocation: string;
  builtYear: number;
  cabinType: string;
  capacity: string;
  category: string;
  controllerManufacturer: string;
  controllerModel: string;
  emergencyContactNumber: string;
  emergencyPhoneProvider: string;
  keyLocation: string;
  lastInspectionDate: string | null;
  lastVisitDate: string | null;
  manufacturer: string;
  model: string;
  externalId: string;
  numberOfStops: number;
  parking: string;
  pictures: FileResourceRecord[];
  documents: FileResourceRecord[] | FileWithPreview[];
  priority: Priority;
  properties: {[key: string]: string | undefined};
  propertyManagerId: string;
  propertyOwnerId: string;
  propertySegment: string;
  qrCode: FileResourceRecord;
  serialNumber: string;
  serviceTime: number;
  status: ElevatorStatus;
  technicianNumber: number;
  type: string;
  elevatorPhone: Partial<ElevatorPhone>;
  timeRule: Partial<ElevatorTimeRuleRecord>;
  customerAppointment: CustomerAppointment;
  technicianWeights: {[key: string]: string | number};
  drive: string;
  speed: string;
  controller: string;
  iotDevice: string;
  cageWeight: string;
  counterWeight: string;
  hoistingHeight: string;
  shaftHeight: string;
  spendingLimit: number;
  inspectionCycle: InspectionCycle;
  distance: number;
  travelTime: number;
  travelFee: number;
  numberOfPeople: number;
  billingAddress?: AddressRecord;
  beneficiaryAddress?: AddressRecord;
}

export interface ElevatorComment {
  content: string;
  refId: string;
  id: string;
  meta: Meta;
  subject: string;
  type: ElevatorCommentType;
}

export interface ElevatorCommentRecord {
  content: string;
  subject: string;
}

export interface QueryTodoParams {
  pageIndex: number;
  pageSize: number;
}

export enum UnitAppointmentView {
  YES = 'Yes',
  NO = 'No',
}

export enum UnitAppointment {
  YES = 'YES',
  NO = 'NO',
}

export interface ElevatorSortableFields {
  assignedTechnicianNames: string;
  numberOfContracts?: number;
}

export interface QueryElevatorInvoiceParams {
  pageIndex: number;
  pageSize: number;
  order?: Order;
  orderByField?: InvoiceOrderField;
  query?: string;
  contractId?: string[];
  createdDateTimeFrom?: string;
  createdDateTimeTo?: string;
  status: InvoiceStatus[];
  propertyOwnerId?: string[];
  totalAmountFrom?: number;
  totalAmountTo?: number;
  invoiceTypes?: InvoiceType[];
  serviceOrderTypes?: ServiceOrderType[];
  totalGrossAmountFrom?: string;
  totalGrossAmountTo?: string;
  serviceOrderId?: string;
  elevatorId?: string;
}

export type UnitTableRow = {
  data: ElevatorView;
  id: string;
  number: string;
  address: string;
  fullAddress: string;
  building: string;
  propertyOwner?: PropertyOwnerView;
  lastMaintenance?: string;
  nextInspection?: string;
  engineers: EmployeesSimpleView[];
  status: ElevatorStatus;
  hasContract: boolean;
};

// used to indicate fields for the search parameter in elevator endpoint
export type SearchParameters = {
  search?: string;
  address?: string;
};

export const STATUS_COLOR = {
  [ElevatorStatus.RUNNING]: theme.palette.success.darkSuccess,
  [ElevatorStatus.JOB_ONGOING]: theme.palette.primary.light,
  [ElevatorStatus.BROKEN]: theme.palette.error.main,
  [ElevatorStatus.OUT_OF_SERVICE]: theme.palette.warning.main,
  [ElevatorStatus.UNKNOWN]: theme.palette.grey[200],
};

export enum DISTANCE_FILTER {
  FIVE = '5',
  TEN = '10',
  TWENTY = '20',
}

export type UnitDistanceQuery = {
  distanceStart?: number;
  distanceEnd?: number;
};

export type UnitFilterForm = {
  address?: string;
  distance?: DISTANCE_FILTER;
  lastInspectionStart?: string;
  lastInspectionEnd?: string;
  nextInspectionStart?: string;
  nextInspectionEnd?: string;
  technician?: EmployeesView;
  unitNumber?: string;
  fabricNumber?: string;
  modelNumber?: string;
  unitCategory?: string;
  hasActiveContract?: boolean;
  hasTodos?: boolean;
  customer?: string;
};

export type UnitStatistics = {
  numOfElevatorsPerStatus: Record<string, number>;
};

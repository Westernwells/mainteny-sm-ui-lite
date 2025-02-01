import {
  Address,
  AddressRecord,
  Fee,
  InspectionCycle,
  Meta,
  Priority,
  SimpleMeta,
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
import {UserAccountSimpleView} from './user';
import {ContactPersonAdditionalInfo} from './contacts';
import {CustomizableColumn} from 'models/table';

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
  MANUFACTURER = 'MANUFACTURER',
  SERIAL_NUMBER = 'SERIAL_NUMBER',
  REQUIRED_TIME = 'REQUIRED_TIME',
  DISTANCE = 'DISTANCE',
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
  shouldNotifyCustomer?: boolean;
  appointmentNotificationDue?: number;
  requiresAppointment?: boolean;
  description?: string;
  contactPerson?: {
    id: string;
    userAccount: UserAccountSimpleView;
    additionalInfo: ContactPersonAdditionalInfo;
    meta: SimpleMeta;
  };
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
  lastVisitDate?: string;
  engineers: EmployeesSimpleView[];
  status: ElevatorStatus;
  hasContract: boolean;
  serialNumber: string;
  manufacturer: string;
  model: string;
  lastInspectionDate?: string;
  requiredTime: number;
  // appointmentPreference
  distance: number;
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

export type ElevatorDataSchemaItem = {
  type: string;
  name: string;
  unit: string;
};

export interface ElevatorDataSchemaItemWithState
  extends ElevatorDataSchemaItem {
  isEditing?: boolean;
  dataMigrationItem?: ElevatorDataMigrationItem;
  fromDatabase?: boolean;
}

export type ElevatorDataSchemaAdditionalInfo = {
  items: ElevatorDataSchemaItem[];
};

export type ElevatorDataSchemaView = {
  id: string;
  name: string;
  additionalInfo: ElevatorDataSchemaAdditionalInfo;
  meta: Meta;
};

export interface ElevatorDataSchemasTableRow {
  id: string;
  name: string;
  noOfFields: number;
  createdAt: string;
  lastUpdatedAt: string;
}

export interface CreateElevatorDataSchemaBody {
  serviceCompanyId: string;
  name: string;
  items: ElevatorDataSchemaItem[];
}

export interface ElevatorDataMigrationItem {
  fromName: string;
  toName: string;
}

export interface EditElevatorDataSchemaBody {
  name: string;
  items: ElevatorDataSchemaItem[];
  dataMigrationItems?: ElevatorDataMigrationItem[];
}

export interface FetchElevatorDataItemsParams {
  schemaId: string;
}

export interface ElevatorDataItemView {
  type: string;
  name: string;
  value: string;
  unit: string;
}

export interface ElevatorDataItemRecord {
  name: string;
  value: string;
}

export interface UpdateElevatorDataItemBody {
  items: ElevatorDataItemRecord[];
}

export interface GetElevatorDataSchemasAffectedFieldParams {
  fieldNames: string[];
}

export enum TABLE_COLUMNS_ID {
  NUMBER = 'NUMBER',
  BUILDING = 'BUILDING',
  ADDRESS = 'ADDRESS',
  CUSTOMER = 'CUSTOMER',
  LAST_VISIT = 'LAST_VISIT',
  ENGINEERS = 'ENGINEERS',
  ACTIVE_CONTRACTS = 'ACTIVE_CONTRACTS',
  STATUS = 'STATUS',
  SERIAL_NUMBER = 'SERIAL_NUMBER',
  MANUFACTURER = 'MANUFACTURER',
  MODEL = 'MODEL',
  LAST_INSPECTION = 'LAST_INSPECTION',
  REQUIRED_TIME = 'REQUIRED_TIME',
  APPOINTMENT_PREFERENCE = 'APPOINTMENT_PREFERENCE',
  DISTANCE = 'DISTANCE',
}

export const UNIT_TABLE_COLUMNS: CustomizableColumn[] = [
  {
    id: TABLE_COLUMNS_ID.NUMBER,
    columnName: 'Number',
    orderIndex: 0,
    fixed: true,
    default: true,
  },
  {
    id: TABLE_COLUMNS_ID.BUILDING,
    columnName: 'Building',
    orderIndex: 1,
    fixed: false,
    default: true,
  },
  {
    id: TABLE_COLUMNS_ID.ADDRESS,
    columnName: 'Address',
    orderIndex: 2,
    fixed: false,
    default: true,
  },
  {
    id: TABLE_COLUMNS_ID.CUSTOMER,
    columnName: 'Customer',
    orderIndex: 3,
    fixed: false,
    default: true,
  },
  {
    id: TABLE_COLUMNS_ID.LAST_VISIT,
    columnName: 'Last visit',
    orderIndex: 4,
    fixed: false,
    default: true,
  },
  {
    id: TABLE_COLUMNS_ID.ENGINEERS,
    columnName: 'Engineers',
    orderIndex: 5,
    fixed: false,
    default: true,
  },
  {
    id: TABLE_COLUMNS_ID.ACTIVE_CONTRACTS,
    columnName: 'Active Contracts',
    orderIndex: 6,
    fixed: false,
    default: true,
  },
  {
    id: TABLE_COLUMNS_ID.STATUS,
    columnName: 'Status',
    orderIndex: 7,
    fixed: false,
    default: true,
  },
  {
    id: TABLE_COLUMNS_ID.SERIAL_NUMBER,
    columnName: 'Serial number',
    orderIndex: 8,
    fixed: false,
    default: false,
  },
  {
    id: TABLE_COLUMNS_ID.MANUFACTURER,
    columnName: 'Manufacturer',
    orderIndex: 9,
    fixed: false,
    default: false,
  },
  {
    id: TABLE_COLUMNS_ID.MODEL,
    columnName: 'Model',
    orderIndex: 10,
    fixed: false,
    default: false,
  },
  {
    id: TABLE_COLUMNS_ID.LAST_INSPECTION,
    columnName: 'Last inspection',
    orderIndex: 11,
    fixed: false,
    default: false,
  },
  {
    id: TABLE_COLUMNS_ID.REQUIRED_TIME,
    columnName: 'Required time',
    orderIndex: 12,
    fixed: false,
    default: false,
  },
  {
    id: TABLE_COLUMNS_ID.DISTANCE,
    columnName: 'Distance',
    orderIndex: 13,
    fixed: false,
    default: false,
  },
];

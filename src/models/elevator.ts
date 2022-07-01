import {
  Address,
  AddressRecord,
  Fee,
  Meta,
  Order,
  Priority,
  StringMap,
  StringValue,
} from './misc';
import {Client} from './client';
import {TechnicianSimpleView, TechnicianView} from './technician';
import {FileResource, FileResourceRecord} from './media';
import {ServiceCompanyTimeUnit} from './service-company';
import {ServiceOrderOrderField, ServiceOrderView} from './service-order';
import {ContractSimpleView} from './contract';
import {EmployeesSimpleView} from './employee';
import {
  PropertyContactPersonSimpleView,
  PropertyOwnerSimpleView,
  PropertyOwnerView,
} from './propertyManager';

export enum ElevatorCommentType {
  TODO = 'TODO',
  NOTE = 'NOTE',
}

export enum ElevatorStatus {
  RUNNING = 'RUNNING',
  BROKEN = 'BROKEN',
  STOPPED = 'STOPPED',
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
  OTHERS = '',
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
  orderBy: ServiceOrderOrderField;
  LAST_VISIT_DATE: string;
  pageIndex: number;
  pageSize: number;
  query: string;
  swLat: number;
  swLng: number;
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
  emergencyContractNumber: string;
  emergencyPhoneProvider: string;
  keyLocation: string;
  lastInspectionDate: string;
  manufacturer: string;
  numberOfStops: 5;
  parking: string;
  pictures: FileResource[];
  propertySegment: string;
  qrCode: FileResourceRecord;
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
  propertyManager: PropertyContactPersonSimpleView;
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

export interface ElevatorRequestBody {
  address: AddressRecord;
  buildingLocation: string;
  builtYear: number;
  cabinType: string;
  capacity: string;
  category: string;
  controllerManufacturer: string;
  controllerModel: string;
  documents: FileResourceRecord[];
  emergencyContractNumber: string;
  emergencyPhoneProvider: string;
  keyLocation: string;
  lastInspectionDate: string;
  lastVisitDate: string;
  manufacturer: string;
  model: string;
  externalId: string;
  numberOfStops: number;
  parking: string;
  pictures: FileResourceRecord[];
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
}

export interface ElevatorComment {
  content: string;
  elevatorId: string;
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

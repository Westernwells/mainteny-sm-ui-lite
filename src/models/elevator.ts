import {Address, AddressRecord, Fee, Meta, Priority, StringMap} from './misc';
import {Client, ClientSimpleView} from './client';
import {TechnicianSimpleView} from './technician';
import {FileResource} from './media';
import {ServiceCompanyTimeUnit} from './service-company';
import {ServiceOrderView} from './service-order';

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

export interface ElevatorAdditionalInfo {
  priority: Priority;
  isServiceOrderGenerationEnabled: boolean;
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
  lastVisitDate: string;
  serviceTime: number;
  status: ElevatorStatus;
  properties: ElevatorProperty[];
  additionalInfo: ElevatorAdditionalInfo;
  labels: string[];
  requiredSkills: string[];
  search: string;
  meta: Meta;
}

export interface ElevatorView {
  id: string;
  number: string;
  model: string;
  type: string;
  capacity: string;
  category: ElevatorCategory;
  technicianNumber: number;
  availability: number;
  address: Address;
  propertyOwner: ClientSimpleView;
  lastVisitDate: string;
  nextVisitDate: string;
  serviceTime: number;
  status: ElevatorStatus;
  labels: [];
  additionalInfo: ElevatorAdditionalInfo;
  search: string;
  meta: Meta;
}

export interface ElevatorSimpleView {
  id: string;
  propertyOwner: ClientSimpleView;
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

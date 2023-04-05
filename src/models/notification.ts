import {Address, Contact} from './misc';
import {ServiceOrderType} from './service-order';
import {TechnicianSimpleView} from './technician';
import {UserAccountSimpleView} from './user';

export enum MessageType {
  NON_TECHNICIAN_ASSIGNMENT_FOR_SERVICE_ORDER = 'NON_TECHNICIAN_ASSIGNMENT_FOR_SERVICE_ORDER',
  EMERGENCY_ORDER_ACCEPTED = 'EMERGENCY_ORDER_ACCEPTED',
  TECHNICIAN_JOB_SCHEDULE_UPDATED = 'TECHNICIAN_JOB_SCHEDULE_UPDATED',
  EMERGENCE_ASSIGNMENT_REQUEST = 'EMERGENCE_ASSIGNMENT_REQUEST',
  SERVICE_ORDER_SCHEDULE_UPDATED = 'SERVICE_ORDER_SCHEDULE_UPDATED',
  APPOINTMENT_NOTIFICATION_DUE = 'APPOINTMENT_NOTIFICATION_DUE',
  NO_SERVICE_ORDER_FOUND = 'NO_SERVICE_ORDER_FOUND',
  CONTRACT_EXPIRY_ALERT = 'CONTRACT_EXPIRY_ALERT',
  SERVICE_ORDER_SCHEDULE_ALERT = 'SERVICE_ORDER_SCHEDULE_ALERT',
  ELEVATOR_ISSUE_CREATED = 'ELEVATOR_ISSUE_CREATED',
  TECHNICIAN_DISPATCH_JOB_CREATED = 'TECHNICIAN_DISPATCH_JOB_CREATED',
  TECHNICIAN_DISPATCH_JOB_STARTED = 'TECHNICIAN_DISPATCH_JOB_STARTED',
  TECHNICIAN_DISPATCH_JOB_COMPLETED = 'TECHNICIAN_DISPATCH_JOB_COMPLETED',
  FILE_UPDATED = 'FILE_UPDATED',
}

export enum Type {
  EMAIL = 'EMAIL',
  IN_APP_NOTIFICATION = 'IN_APP_NOTIFICATION',
  PUSH_NOTIFICATION = 'PUSH_NOTIFICATION',
  SMS = 'SMS',
}

export interface PropertyOwnerNotificationView {
  id: string;
  name: string;
  address: Address;
  contact: Contact;
}

export interface ElevatorNotificationView {
  id: string;
  number: string;
  model: string;
  address: Address;
  propertyOwner: PropertyOwnerNotificationView;
}

export interface TechnicianNotificationView {
  id: string;
  address: Address;
  userAccount: UserAccountSimpleView;
}

export interface ServiceOrderNotificationData {
  id: string;
  number: string;
  elevator: ElevatorNotificationView;
  description: string;
  technician: TechnicianNotificationView;
  type: ServiceOrderType;
}

export interface NonTechnicianAssignmentData {
  serviceOrder: ServiceOrderNotificationData;
  timestamp: string;
}

export interface ServiceOrderAssignedData {
  serviceOrder: ServiceOrderNotificationData;
  timestamp: string;
}

export interface TechnicianJobScheduleUpdatedData {
  technician: TechnicianSimpleView;
  timestamp: string;
}

export interface NotificationMessage<T> {
  content: string;
  data: T;
  id: string;
  markedAsRead: boolean;
  messageType: MessageType;
  target: string;
  timestamp: string;
  title: string;
  type: Type;
}

export interface NotificationsQueryParams {
  start: string;
  end: string;
  target?: string[];
  type: Type[];
  messageType: MessageType[];
  read: boolean[];
  pageIndex: number;
  pageSize: number;
}

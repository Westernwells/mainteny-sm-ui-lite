import {
  Address,
  AddressRecord,
  Meta,
  TechnicianEventType,
  TimeWindowRecord,
  TimeWindowType,
} from './misc';
import {UserAccountSimpleView, UserAccountView, UserView} from './user';
import {ServiceOrderType} from './service-order';

export interface TechnicianTimeWindowRecord extends TimeWindowRecord {
  id: string;
  technicianId: string;
}

export interface TechnicianAdditionalInfo {
  leftVacationDays: number;
  assignedServiceOrderTypes: ServiceOrderType[];
}

export interface Technician {
  id: string;
  address: Address;
  workingHours: TechnicianWorkingHours[];
  userAccount: UserAccountView;
  meta: Meta;
}

export interface TechnicianUserData {
  technicianId: string;
  address: AddressRecord;
  workingHours: TechnicianTimeWindowRecord[];
  isOnline: Boolean;
  additionalInfo: TechnicianAdditionalInfo;
  meta: Meta;
}
// use related view example api api/users
export interface TechnicianUserView extends UserView<TechnicianUserData> {}

export interface TechEventAdditionalInfo {
  leftVacationDays: number;
  assignedServiceOrderTypes?: ServiceOrderType[];
}

export interface TechnicianView {
  id: string;
  userAccount: UserAccountView;
  address: Address;
  isOnline: boolean;
  additionalInfo: TechnicianAdditionalInfo;
  workingHours: TechnicianWorkingHours[];
  meta: Meta;
}

export interface MaintainerView {
  technician: TechnicianView;
  weight: number;
}

export interface TechnicianSimpleView {
  id: string;
  userAccount: UserAccountSimpleView;
  address: Address;
  isOnline: boolean;
  additionalInfo: TechnicianAdditionalInfo;
  meta: Meta;
}

export interface TechnicianEventView {
  id: string;
  technician: TechnicianSimpleView;
  startTime: string;
  endTime: string;
  eventType: TechnicianEventType;
  notes: string;
  meta: Meta;
}

export interface TechnicianAvailabilityView {
  start: string;
  end: string;
}

export interface TechnicianWithAvailabilityView {
  userAccount: UserAccountView;
  time: string;
  totalHours: string;
}

export interface TechnicianWithUnAvailabilityView {
  userAccount: UserAccountView;
  time: string;
  totalHours: string;
  eventType: string;
}

export interface TechnicianWorkingHours {
  fromTime: string;
  toTime: string;
  type: TimeWindowType;
}

export interface TechnicianAdditionalInfo {
  leftVacationDays: number;
}

export interface QueryTechniciansParams {
  pageIndex: number;
  pageSize: number;
  query: string;
}

export interface TechniciansEventsParams {
  pageIndex: number;
  pageSize: number;
  end: string;
  start: string;
  eventType: string[];
}

export interface TechnicianEventPair {
  technicianId: string;
  eventViews: TechnicianEventView[];
}

export interface TechnicianEventView {
  startTime: string;
  endTime: string;
  eventType: TechnicianEventType;
  id: string;
  meta: Meta;
  notes: string;
  technician: TechnicianSimpleView;
  durationInDays: number;
}

export interface RecommendTechnicianPayload {
  count: number;
  time: string;
}

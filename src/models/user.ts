import {ServiceCompany, ServiceCompanyView} from './service-company';
import {AddressRecord, Meta, Contact, TimeWindowRecord} from './misc';
import {ServiceOrderType} from './service-order';
import {WorkHoursType} from './workHours';

export enum UserAccountStatus {
  NORMAL = 'NORMAL',
  LOCKED = 'LOCKED',
  RESET_PASSWORD = 'RESET_PASSWORD',
  INVITATION_SENT = 'INVITATION_SENT',
  INIT = 'INIT',
}

export enum Role {
  ADMIN = 'ADMIN',
  SERVICE_MANAGER = 'SERVICE_MANAGER',
  TECHNICIAN = 'TECHNICIAN',
  CONTRACTOR = 'CONTRACTOR',
}

export interface UserAccount {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  photoUrl: string;
  roles: Role[];
  serviceCompany: ServiceCompany;
  contact: Contact;
  status: UserAccountStatus;
  meta: Meta;
}

export interface UserAccountView {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  photoUrl: string;
  roles: Role[];
  serviceCompany: ServiceCompanyView;
  status: UserAccountStatus;
  contact: Contact;
  meta: Meta;
  title: string;
}

export interface UserAccountSimpleView {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  photoUrl: string;
  roles: Role[];
  status: UserAccountStatus;
  contact: Contact;
  title: string;
  serviceCompanyId: string;
  category: string;
}

export interface CreateUserAccountData {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  photoUrl: string;
  contact: Contact;
  serviceCompanyId: string;
}

export interface UpdateUserAccountData {
  username: string;
  firstName: string;
  lastName: string;
  photoUrl: string;
  contact: Contact;
}

export interface TechnicianData {
  address: AddressRecord;
  workingHours: TimeWindowRecord[];
}

export interface CreateTechnicianRecord {
  userAccount: CreateUserAccountData;
  technician: TechnicianData;
}

export interface UpdateTechnicianRecord {
  userAccount: UpdateUserAccountData;
  technician: TechnicianData;
}

export interface CreateServiceManagerRecord {
  userAccount: CreateUserAccountData;
  technician?: TechnicianData;
}

export interface UpdateServiceManagerRecord {
  userAccount: UpdateUserAccountData;
  technician?: TechnicianData;
}

export interface UserView {
  userAccount: UserAccountView;
  userData: UserData;
  id: string;
}

export interface UserAdditionalInfo {
  leftVacationDays: number;
  assignedServiceOrderTypes?: ServiceOrderType[];
  totalYearlyVacationDaysAllowed?: number;
}

export interface UserData {
  employeeId: string;
  address: AddressRecord;
  workingHours: TimeWindowRecord[];
  isOnline: Boolean;
  additionalInfo: UserAdditionalInfo;
  meta: Meta;
  team: string;
  externalId: string;
  number: string;
}

export interface ServiceManagerData {}

export interface UserActivityAdditionalInfo {
  comment?: string;
}
export interface UserActivityView {
  id: string;
  type: WorkHoursType;
  refId?: string;
  data: string;
  user: UserAccountSimpleView;
  description: string;
  startTime: string;
  minutes?: number;
  billableMinutes?: number;
  additionalInfo: UserActivityAdditionalInfo;
  search: string;
  createdAt?: string;
}

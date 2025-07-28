import {ServiceCompany, ServiceCompanyView} from './service-company';
import {AddressRecord, Meta, PersonalContact, TimeWindowRecord} from './misc';
import {WorkHoursType} from './workHours';

export enum UserAccountStatus {
  NORMAL = 'NORMAL',
  LOCKED = 'LOCKED',
  RESET_PASSWORD = 'RESET_PASSWORD',
  INVITATION_SENT = 'INVITATION_SENT',
  INIT = 'INIT',
}

export enum Role {
  GENERAL_MANAGER = 'GENERAL_MANAGER',
  ASSISTANT = 'ASSISTANT',
  FACILITY_MANAGER = 'FACILITY_MANAGER',
  PROPERTY_MANAGER = 'PROPERTY_MANAGER',
  CONTACT_PERSON = 'CONTACT_PERSON',
  ASSET_OWNER = 'ASSET_OWNER',
  OTHER_CONTACT = 'OTHER_CONTACT',
  OTHERS = 'OTHERS',

  // deprecated
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
  contact: PersonalContact;
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
  contact: PersonalContact;
  meta: Meta;
  title: string;
  category: string;
}

export interface UserAccountSimpleView {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  photoUrl: string;
  contact: PersonalContact;
  category: string;
  title: string;
  serviceCompanyId?: string;
  roles: Role[];
  status: UserAccountStatus;
}

export interface CreateUserAccountData {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  photoUrl: string;
  contact: PersonalContact;
  serviceCompanyId: string;
}

export interface UpdateUserAccountData {
  username: string;
  firstName: string;
  lastName: string;
  photoUrl: string;
  contact: PersonalContact;
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
  assignedServiceOrderTypes?: string[];
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
  subtype: string;
  refId?: string;
  data: string;
  user: UserAccountSimpleView;
  description: string;
  startTime: string;
  minutes?: number;
  billableMinutes?: number;
  additionalInfo: UserActivityAdditionalInfo;
  search: string;
  createdAt: string;
}

export interface UserActivityStatistics {
  totalMinutesPerType: {[key: string]: number};
  totalBillableMinutesPerType: {[key: string]: number};
}

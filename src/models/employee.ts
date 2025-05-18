import {Address, AddressRecord, DataEditingScope, Meta} from './misc';
import {ServiceOrderType} from './service-order';
import {CreateUserAccountData, Role, UserAccountView} from './user';
import {AvailabilityType} from './availability';
import {Order} from './pagination';

export enum UserOrderField {
  CREATED_DATE = 'CREATED_DATE',
}

export interface UserQueryParams {
  serviceCompanyId: string;
  pageIndex: number;
  pageSize: number;
  query: string;
  roles: Role[];
}

export interface EmployeeAdditionalInfo {
  leftVacationDays: number;
  assignedServiceOrderTypes?: ServiceOrderType[];
  totalYearlyVacationDaysAllowed?: number;
}

export enum TimeWindowType {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
  WEEKDAY = 'WEEKDAY',
  WEEKEND = 'WEEKEND',
  PUBLIC_HOLIDAY = 'PUBLIC_HOLIDAY',
}

export interface EmployeesView {
  id: string;
  number: string;
  externalId: string;
  team: string;
  address: Address;
  workingHours: TimeWindowRecord[];
  userAccount: UserAccountView;
  isOnline: boolean;
  additionalInfo: EmployeeAdditionalInfo;
  meta: Meta;
  online: boolean;
}

export type TimeWindowRecord = {
  fromTime: string;
  toTime: string;
  breakFromTime?: string;
  breakToTime?: string;
  type: TimeWindowType;
};

export enum EmployeeStatus {
  SICK_LEAVE = 'SICK_LEAVE',
  HOLIDAY = 'HOLIDAY',
  WORKING = 'WORKING',
  WEEKEND = 'WEEKEND',
  PUBLIC_HOLIDAY = 'PUBLIC_HOLIDAY',
}

export interface EmployeeStatusView {
  employee: EmployeesView;
  status: EmployeeStatus;
}

export interface EmployeesSimpleView {
  additionalInfo: EmployeeAdditionalInfo;
  address: Address;
  id: string;
  isOnline: boolean;
  meta: Meta;
  userAccount: UserAccountView;
  online: boolean;
  externalId: string;
}

export interface BasicEmployeeFormModel {
  phone: string;
  firstName: string;
  lastName: string;
  email: string;
  address: {
    countryCode: string;
    fullName: string;
    location: {
      latitude: number;
      longitude: number;
    };
  } | null;
  employeeId: string;
  team: string;
  totalYearlyVacationDaysAllowed: number;
}

export interface RoleEmployeeFormModel {
  roles: string[];
}

export interface AdditionalInformationEmployeeFormModel {
  serviceOrderTypes: string[];
}

export interface CredentialEmployeeFormModel {
  password: string;
  confirmPassword: string;
}

export interface QueryServiceCompanyEmployeeStatusParams {
  date: string;
  pageIndex: number;
  pageSize: number;
  query?: string;
  roles: Role[];
}

export type WorkingEmployeesSummary = {
  numberOfAvailableEmployees: number;
};

// Query Request Types

export type WorkingEmployeeSummaryRequest = {
  time: string;
  employeeType: Role[];
};

export type EmployeeContractTableRow = {
  id: string;
  name: string;
  email: string;
  photoUrl: string;
  roles: Role[];
  address: string;
  team: string;
  phone: string;
  shift: string;
  availability: AvailabilityType;
  employeeId: string;
};

export enum EmployeeEventType {
  WORK = 'WORK',
  WORK_TRAVEL = 'WORK_TRAVEL',
  VACATION = 'VACATION',
  SICK_LEAVE = 'SICK_LEAVE',
  SPECIAL_LEAVE = 'SPECIAL_LEAVE',
  OTHERS = 'OTHERS',
  HOLIDAY = 'HOLIDAY',
  OFFICE_HOURS = 'OFFICE_HOURS',
  TRAINING = 'TRAINING',
  BREAK = 'BREAK',
}

export type EmployeeEventTypeRecord = {
  subtype: string;
  type: EmployeeEventType;
  presence?: boolean;
};

export type UpdateEmployeeEventTypeRecord = {
  from: EmployeeEventTypeRecord;
  to: EmployeeEventTypeRecord;
  scope: DataEditingScope;
};

export type SaveEmployeeEventTypeRecords = {
  added: EmployeeEventTypeRecord[];
  updated: UpdateEmployeeEventTypeRecord[];
  deleted: EmployeeEventTypeRecord[];
};

export enum EmployeeOrderField {
  NAME = 'NAME',
  EXTERNAL_ID = 'EXTERNAL_ID',
  ROLE = 'ROLE',
  ADDRESS = 'ADDRESS',
  PHONE = 'PHONE',
  SHIFT = 'SHIFT',
  CREATED_DATE = 'CREATED_DATE',
}

export interface QueryEmployeesParams {
  order?: Order;
  orderBy?: EmployeeOrderField;
  pageIndex?: number;
  pageSize?: number;
  query?: string;
  roles?: Role[];
  serviceOrderType?: string;
}

export interface EmailSignature {
  id: string;
  name: string;
  content: SignatureContent;
  createdAt: Date;
  enabled?: boolean;
}

export interface SignatureContent {
  images: string[];
  html: string;
}

export interface CreateEmailSignatureRecord {
  name: string;
  content: SignatureContent;
  enabled?: boolean;
}

export type Shift = {
  fromTime: string;
  toTime: string;
};

export type ShiftEntry = {
  firstShift: Shift;
  secondShift?: Shift;
};

export type ShiftForm = Record<TimeWindowType, ShiftEntry>;

export type CreateEmployeeAccountData = Partial<CreateUserAccountData> & {
  phone: string;
  roles: string[];
  address: AddressRecord | null;
  employeeId: string;
  team?: string;
  totalYearlyVacationDaysAllowed?: number;
  serviceOrderTypes?: string[];
};

export type EmployeeAccountData = Partial<CreateUserAccountData> & {
  employeeId: string;
  team?: string;
  email: string;
  phone: string;
  roles: string[];
  serviceOrderTypes?: string[];
  addressFullName?: string | false;
  address?: AddressRecord | null;
  firstName?: string;
  lastName?: string;
  totalYearlyVacationDaysAllowed?: number;
  shifts: ShiftForm;
};

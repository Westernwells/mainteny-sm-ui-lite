import {Shift} from 'pages/NewEmployee/model';
import {Address, Meta} from './misc';
import {ServiceOrderType} from './service-order';
import {Role, UserAccountView} from './user';

export interface UserQueryParams {
  pageIndex: number;
  pageSize: number;
  query: string;
  roles: Role[];
}

export interface EmployeeAdditionalInfo {
  leftVacationDays: number;
  assignedServiceOrderTypes?: ServiceOrderType[];
}

export interface EmployeesView {
  address: Address;
  additionalInfo: EmployeeAdditionalInfo;
  id: string;
  isOnline: boolean;
  online: boolean;
  meta: Meta;
  userAccount: UserAccountView;
}

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
}

export interface RoleEmployeeFormModel {
  roles: string[];
}

export interface AdditionalInformationEmployeeFormModel {
  serviceOrderTypes: string[];
  shifts: Shift<string>[];
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

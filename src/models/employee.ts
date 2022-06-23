import {Shift} from 'pages/Employee/NewEmployee/model';
import {Address, Meta} from './misc';
import {ServiceOrderType} from './service-order';
import {
  TechnicianEventView,
  TechnicianView,
  TechnicianWorkingHours,
} from './technician';
import {Role, UserAccountView, UserView} from './user';

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

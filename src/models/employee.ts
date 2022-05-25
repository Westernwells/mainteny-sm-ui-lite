import {Address, Meta} from './misc';
import {
  TechEventAdditionalInfo,
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

export interface EmployeesView {
  address?: Address;
  workingHours?: TechnicianWorkingHours[];
  additionalInfo?: TechEventAdditionalInfo;
  id?: string;
  isOnline?: boolean;
  meta?: Meta;
  userAccount: UserAccountView;
  events?: TechnicianEventView[];
}

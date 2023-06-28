import {AddressRecord} from 'models/misc';
import {CreateUserAccountData} from 'models/user';

export interface Shift<T> {
  fromTime: T;
  toTime: T;
  type: string;
}

export type EmployeeAccountData = Partial<CreateUserAccountData> & {
  phone: string;
  roles: string[];
  employeeId: string;
  email: string;
  serviceOrderTypes?: string[];
  shifts: Shift<string>[];
  addressFullName?: string | false;
  team?: string;
  address?: AddressRecord | null;
  firstName?: string;
  lastName?: string;
};

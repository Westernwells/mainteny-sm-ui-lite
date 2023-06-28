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
  serviceOrderTypes: string[];
  shifts: Shift<string | undefined>[];
  address: AddressRecord | null;
  employeeId: string;
  team?: string;
};

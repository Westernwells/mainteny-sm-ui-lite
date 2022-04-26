import {CreateUserAccountData} from 'models/user';

export interface Shift<T> {
  fromTime: T;
  toTime: T;
  workDays: string;
}

export type EmployeeAccountData = Partial<CreateUserAccountData> & {
  phone: string;
  roles: string[];
  serviceOrderTypes: string[];
  shifts: Shift<string | undefined>[];
  // TODO: resolve 'any' here
  address: any;
};

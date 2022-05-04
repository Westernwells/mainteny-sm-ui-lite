import {CreateUserAccountData} from 'models/user';

export interface Shift<T> {
  fromTime: T;
  toTime: T;
  type: string;
}

export type EmployeeAccountData = Partial<CreateUserAccountData> & {
  phone: string;
  roles: string[];
  email: string;
  serviceOrderTypes: string[];
  shifts: Shift<string>[];
  addressFullName?: string | false;
  address?: {
    countryCode: string;
    fullName: string;
    location: {
      latitude: number;
      longitude: number;
    };
  } | null;
};

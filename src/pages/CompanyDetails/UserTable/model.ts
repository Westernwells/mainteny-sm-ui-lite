import {Shift} from 'pages/NewEmployee/model';

export type UserFormTypes = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  employeeId: string;
  shifts: Shift<string>[];
  password?: string;
  address: {
    countryCode: string;
    fullName: string;
    location: {
      latitude: number;
      longitude: number;
    };
  } | null;
};

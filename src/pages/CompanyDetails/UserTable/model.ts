import {AddressRecord} from 'models/misc';
import {ShiftForm} from 'models/employee';

export type UserFormTypes = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  employeeId: string;
  shifts: ShiftForm;
  password?: string;
  address: AddressRecord | null;
};

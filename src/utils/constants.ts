import {EmployeeEventType} from 'models/employee';
import {InvoiceFormat} from 'models/propertyManager';

export const ONE_KB_IN_BYTES = 1024;
export const ONE_MB_IN_BYTES = ONE_KB_IN_BYTES * 1024;
export const IMAGE_SIZE_IN_MB = 500_000; // 0.5MB

export const CUSTOMER_ALL_INVOICE_FORMATS = [
  {
    label: 'PDF',
    value: InvoiceFormat.PDF,
  },
  {
    label: 'Xinvoice (XML)',
    value: InvoiceFormat.XML,
  },
  {
    label: 'PDF & Xinvoice (XML)',
    value: InvoiceFormat.PDF_AND_XML,
  },
];

export const ALL_EMPLOYEE_EVENT_TYPES = [
  {
    label: 'Work',
    value: EmployeeEventType.WORK,
  },
  {
    label: 'Work travel',
    value: EmployeeEventType.WORK_TRAVEL,
  },
  {
    label: 'Vacation',
    value: EmployeeEventType.VACATION,
  },
  {
    label: 'Sick leave',
    value: EmployeeEventType.SICK_LEAVE,
  },
  {
    label: 'Special leave',
    value: EmployeeEventType.SPECIAL_LEAVE,
  },
  {
    label: 'Others',
    value: EmployeeEventType.OTHERS,
  },
];

export const EMPLOYEE_EVENT_TYPES_TO_PRESENCE_BOOLEAN = {
  [EmployeeEventType.BREAK]: false,
  [EmployeeEventType.HOLIDAY]: false,
  [EmployeeEventType.OFFICE_HOURS]: true,
  [EmployeeEventType.OTHERS]: true,
  [EmployeeEventType.SICK_LEAVE]: false,
  [EmployeeEventType.SPECIAL_LEAVE]: false,
  [EmployeeEventType.TRAINING]: true,
  [EmployeeEventType.VACATION]: false,
  [EmployeeEventType.WORK]: true,
  [EmployeeEventType.WORK_TRAVEL]: true,
};

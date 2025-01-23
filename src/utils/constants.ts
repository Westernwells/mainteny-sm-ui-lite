import {ClientReportForPDFConfig} from 'models/client-storage';
import {EmployeeEventType} from 'models/employee';
import {InvoiceFormat} from 'models/propertyManager';
import {ServiceOrderTypePriority} from 'models/service-order';

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
  {
    label: 'Post',
    value: InvoiceFormat.POST,
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

export const DEFAULT_EMPLOYEE_EVENT_TYPES = [
  'OFFICE_WORK',
  'FIELD_WORK',
  'TRAINING',
  'VACATION',
  'SICK_LEAVE',
];

export const CLIENT_STORAGE_PDF_CONFIG_KEY = 'pdf-configurations';
export const CLIENT_STORAGE_PDF_TEMPLATE_KEY = 'pdf-template';

export const DEFAULT_CLIENT_STORAGE_PDF_CONFIG_STATE: ClientReportForPDFConfig =
  {
    includeUnitNumber: true,
    includeSerialNumber: true,
    includeUsername: true,
    includeUserEmail: false,
    includeUserPhone: false,
    includeCustomerVAT: false,
    includeUnitBuilding: false,
  };

export const ALL_SERVICE_ORDER_TYPE_PRIORITY = [
  {
    label: 'Urgent',
    value: ServiceOrderTypePriority.URGENT,
  },
  {
    label: 'High',
    value: ServiceOrderTypePriority.HIGH,
  },
  {
    label: 'Medium',
    value: ServiceOrderTypePriority.MEDIUM,
  },
  {
    label: 'Low',
    value: ServiceOrderTypePriority.LOW,
  },
];

export const DEFAULT_ELEVATOR_TECHNICAL_FIELD_NAMES = [
  '# stops',
  'drive',
  'capacity',
  'speed',
  'controller',
  'iot device',
  'cabin type',
  'cage weight',
  'counterweight',
  'hoisting height',
  'shaft height',
  'number of people',
  'manufacturer',
  'system id',
  'phone connection',
  'phone number',
  'sim card number',
  'sim pin',
  'call center',
  'place of installation',
];

export const DEFAULT_ELEVATOR_TECHNICAL_FIELD_CATEGORIES = [
  'technical data',
  'auto dialer',
];

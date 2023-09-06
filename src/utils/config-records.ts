import {
  AutoNumberConfigRecord,
  ServiceCompanyNumberType,
} from 'models/service-company';

export const configRecords: AutoNumberConfigRecord[] = [
  {
    type: ServiceCompanyNumberType.ARTICLE,
    prefix: '',
    numberOfDigits: 1,
    enabled: false,
    startFrom: 1,
  },
  {
    type: ServiceCompanyNumberType.ARTICLE_ORDER,
    prefix: '',
    numberOfDigits: 1,
    enabled: false,
    startFrom: 1,
  },
  {
    type: ServiceCompanyNumberType.CONTRACT,
    prefix: '',
    numberOfDigits: 1,
    enabled: false,
    startFrom: 1,
  },
  {
    type: ServiceCompanyNumberType.ELEVATOR,
    prefix: '',
    numberOfDigits: 1,
    enabled: false,
    startFrom: 1,
  },
  {
    type: ServiceCompanyNumberType.EMPLOYEE,
    prefix: '',
    numberOfDigits: 1,
    enabled: false,
    startFrom: 1,
  },
  {
    type: ServiceCompanyNumberType.INVOICE,
    prefix: '',
    numberOfDigits: 1,
    enabled: false,
    startFrom: 1,
  },
  {
    type: ServiceCompanyNumberType.PROPERTY_OWNER,
    prefix: '',
    numberOfDigits: 1,
    enabled: false,
    startFrom: 1,
  },
];

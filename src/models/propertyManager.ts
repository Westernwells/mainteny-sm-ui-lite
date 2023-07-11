import {
  Address,
  AddressRecord,
  Contact,
  Meta,
  Priority,
  WithOptional,
} from './misc';
import {ServiceCompany} from './service-company';
import {UserAccount, UserAccountSimpleView} from './user';

export interface PropertyOwner {
  id: string;
  name: string;
  address: AddressRecord;
  serviceCompany: ServiceCompany;
  contact: ContactPropertyOwner;
  search: string;
  meta: Meta;
  units?: number;
}

export interface PropertyContactPersonSimpleView {
  customerId: string;
  id: string;
  meta: Meta;
  propertyOwnerId: string;
  userAccount: UserAccountSimpleView;
}

export interface PropertyOwnerAdditionalInfo {
  priority: Priority;
  billingEmail?: string;
  costCenter: string;
  secondaryPhoneNumber: string;
  registrationDate: string;
  taxNumber?: string;
}

export interface PropertyOwnerView {
  id: string;
  name: string;
  number: string;
  billingAddress?: Address;
  beneficiaryAddress?: Address;
  otherAddress?: Address;
  serviceCompany: ServiceCompany;
  contact: ContactPropertyOwner;
  search: string;
  meta: Meta;
  unitNumber?: number;
  additionalInfo: PropertyOwnerAdditionalInfo;
  labels: string[];
  externalId: string;
}

export interface PropertyOwnerSimpleView {
  additionalInfo: PropertyOwnerAdditionalInfo;
  billingAddress?: Address;
  beneficiaryAddress?: Address;
  otherAddress?: Address;
  contact: ContactPropertyOwner;
  id: string;
  labels: string[];
  meta: Meta;
  name: string;
  serviceCompanyId: string;
  externalId: string;
  units?: number;
}

export interface PropertyManager {
  id: string;
  propertyOwner: PropertyOwner;
  userAccount: UserAccount;
  meta: Meta;
}

export interface QueryPropertyOwnersParams {
  pageIndex: number;
  pageSize: number;
  query: string;
  serviceCompanyId: string;
  unitNumberStart?: number;
  unitNumberEnd?: number;
}

export interface ContactPropertyOwner extends Contact {
  url: string;
}

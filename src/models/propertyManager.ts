import {
  Address,
  AddressRecord,
  Contact,
  Meta,
  Order,
  Priority,
  WithOptional,
} from './misc';
import {ServiceCompany} from './service-company';
import {UserAccount, UserAccountSimpleView} from './user';

export interface PropertyOwner {
  id: string;
  name: string;
  address: AddressRecord;
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
  vatId?: string;
  offsettingAccount?: string;
}

export interface PropertyOwnerView {
  id: string;
  name: string;
  number: string;
  billingAddress?: Address;
  beneficiaryAddress?: Address;
  otherAddress?: Address;
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

export enum PropertyOwnerOrderField {
  CREATED_TIME = 'CREATED_TIME',
  NAME = 'NAME',
  XERO_LAST_SYNC_TIME = 'XERO_LAST_SYNC_TIME',
}

export interface QueryPropertyOwnersParams {
  pageIndex: number;
  pageSize: number;
  query: string;
  serviceCompanyId: string;
  unitNumberStart?: number;
  unitNumberEnd?: number;
  order?: Order;
  orderBy?: PropertyOwnerOrderField;
}

export interface ContactPropertyOwner extends Contact {
  url: string;
}

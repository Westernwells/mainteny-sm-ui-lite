import {Address, AddressRecord, Contact, Meta, Priority} from './misc';
import {ServiceCompany} from './service-company';
import {UserAccount, UserAccountSimpleView} from './user';

export interface PropertyOwner {
  id: string;
  name: string;
  address: AddressRecord;
  serviceCompany: ServiceCompany;
  contact: Contact;
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
}

export interface PropertyOwnerView {
  id: string;
  name: string;
  number: string;
  postalAddress: Address;
  serviceCompany: ServiceCompany;
  externalId: string;
  contact: Contact;
  search: string;
  meta: Meta;
  units?: number;
  additionalInfo: PropertyOwnerAdditionalInfo;
  labels: string[];
}

export interface PropertyOwnerSimpleView {
  additionalInfo: PropertyOwnerAdditionalInfo;
  postalAddress: Address;
  contact: Contact;
  id: string;
  labels: string[];
  meta: Meta;
  name: string;
  serviceCompanyId: string;
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
}

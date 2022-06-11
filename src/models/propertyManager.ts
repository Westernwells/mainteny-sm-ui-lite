import {Address, AddressRecord, Contact, Meta, Priority} from './misc';
import {ServiceCompany} from './service-company';
import {UserAccount} from './user';

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

export interface PropertyOwnerAdditionalInfo {
  priority: Priority;
}

export interface PropertyOwnerView {
  id: string;
  name: string;
  address: Address;
  serviceCompany: ServiceCompany;
  contact: Contact;
  search: string;
  meta: Meta;
  units?: number;
  additionalInfo: PropertyOwnerAdditionalInfo;
  labels: string[];
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

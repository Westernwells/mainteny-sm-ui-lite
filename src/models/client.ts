import {Address, AddressRecord, Meta, Contact, Priority} from './misc';
import {ServiceCompany, ServiceCompanySimpleView} from './service-company';

export interface ClientAdditionalInfo {
  priority: Priority;
}

export interface Client {
  id: string;
  name: string;
  address: Address;
  serviceCompany: ServiceCompany;
  contact: Contact;
  additionalInfo: ClientAdditionalInfo;
  search: string;
  meta: Meta;
}

export interface ClientView {
  id: string;
  name: string;
  elevatorCount?: number;
  address: Address;
  contact: Contact;
  serviceCompany: ServiceCompanySimpleView;
  additionalInfo: ClientAdditionalInfo;
  meta: Meta;
}

export interface ClientSimpleView {
  id: string;
  name: string;
  serviceCompanyId: string;
  address: Address;
  contact: Contact;
  labels: string[];
  additionalInfo: ClientAdditionalInfo;
  meta: Meta;
}

export interface CreateClientRecord {
  name: string;
  address: AddressRecord;
  contact: Contact;
  priority: Priority;
}

export interface UpdateClientRecord {
  name: string;
  address: AddressRecord;
  contact: Contact;
  priority: Priority;
}

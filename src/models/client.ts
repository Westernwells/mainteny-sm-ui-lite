import {Address, AddressRecord, Meta, PersonalContact, Priority} from './misc';
import {UserAccount} from './user';

export interface ClientAdditionalInfo {
  priority: Priority;
}

export interface Client {
  id: string;
  name: string;
  address: Address;
  contact: PersonalContact;
  additionalInfo: ClientAdditionalInfo;
  search: string;
  meta: Meta;
}

export interface ClientView {
  id: string;
  name: string;
  elevatorCount?: number;
  address: Address;
  contact: PersonalContact;
  additionalInfo: ClientAdditionalInfo;
  meta: Meta;
}

export interface ClientSimpleView {
  id: string;
  name: string;
  serviceCompanyId: string;
  address: Address;
  contact: PersonalContact;
  labels: string[];
  additionalInfo: ClientAdditionalInfo;
  meta: Meta;
}

export interface ClientManager {
  id: string;
  meta: Meta;
  propertyOwner: Client;
  userAccount: UserAccount;
}

export interface CreateClientRecord {
  name: string;
  address: AddressRecord;
  contact: PersonalContact;
  priority: Priority;
}

export interface UpdateClientRecord {
  name: string;
  address: AddressRecord;
  contact: PersonalContact;
  priority: Priority;
}

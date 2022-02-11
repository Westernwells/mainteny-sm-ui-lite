import {AddressRecord, Contact, Meta} from './misc';
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
}

export interface PropertyManager {
  id: string;
  propertyOwner: PropertyOwner;
  userAccount: UserAccount;
  meta: Meta;
}

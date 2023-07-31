import {AddressRecord, Contact, Meta} from './misc';
import {ServiceCompany} from './service-company';
import {UserAccount, UserView} from './user';

// TODO: Validate this model
export interface Manager {
  id: string;
  name: string;
  address: AddressRecord;
  contact: Contact;
  search: string;
  meta: Meta;
}

export interface ServiceManager {
  id: string;
  serviceManager: Manager;
  userAccount: UserAccount;
  meta: Meta;
}

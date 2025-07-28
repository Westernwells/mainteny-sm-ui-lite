import {AddressRecord, PersonalContact, Meta} from './misc';
import {UserAccount, UserView} from './user';
export interface Manager {
  id: string;
  name: string;
  address: AddressRecord;
  contact: PersonalContact;
  search: string;
  meta: Meta;
}

export interface ServiceManager {
  id: string;
  serviceManager: Manager;
  userAccount: UserAccount;
  meta: Meta;
}

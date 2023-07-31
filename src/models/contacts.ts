import {Meta, Contact, Priority, Address, CompanyContact} from './misc';
import {UserAccountView} from './user';

export interface ContactsView {
  id: string;
  customerId: string;
  meta: Meta;
  number: string;
  userAccount: ContactsUserAccount;
  propertyOwner: PropertyOwner;
  additionalInfo?: {
    secondaryPhone?: string;
  };
}

export interface PropertyOwner {
  id: string;
  additionalInfo: Priority;
  contact: CompanyContact;
  name: string;
  labels: string[];
  billingAddress?: Address;
  beneficiaryAddress?: Address;
  otherAddress?: Address;
  serviceCompanyId: string;
  secondaryPhoneNumber?: string;
}

interface ContactsMeta extends Meta {
  deleted: boolean;
}

interface ContactsUserAccount extends UserAccountView {
  meta: ContactsMeta;
  category: string;
  contact: Contact;
  search: string;
  title: string;
}

export enum ContactsStatus {
  ACTIVE = 'NORMAL',
  INACTIVE = 'INIT',
  PENDING = 'INVITATION_SENT',
}

export interface ContactFormModel {
  phone: string;
  secondaryPhone: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: string;
}

export interface ContactBody {
  propertyContactPerson: {
    externalId: string;
    roles: string[];
    propertyOwnerId?: string;
    secondaryPhone?: string;
  };
  userAccount: {
    category: string;
    contact: Contact;
    firstName: string;
    lastName: string;
    photoUrl: string;
    title: string;
    username: string;
    serviceCompanyId?: string;
  };
}

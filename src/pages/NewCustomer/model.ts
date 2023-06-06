import {AddressRecord} from 'models/misc';
import {Priority} from 'models/service-order';

export type BasicCustomerFormModel = {
  name: string;
  phone: string;
  secondaryPhoneNumber?: string;
  billingAddress: AddressRecord | null;
  url: string;
  email: string;
  billingEmail?: string;
  postalAddress: AddressRecord | null;
  priority: Priority | null;
  externalId: string;
  registrationDate: Date;
  costCenter: string;
};

export type NewCustomerBody = {
  billingAddress: AddressRecord | null;
  businessAddress: AddressRecord | null;
  contact: {
    email: string;
    phone: string;
    url: string;
  };
  externalId: string;
  name: string;
  postalAddress: AddressRecord | null;
  priority: Priority | null;
  serviceCompanyId: string;
  registrationDate: Date;
  costCenter: string;
  billingEmail?: string;
  secondaryPhoneNumber?: string;
};

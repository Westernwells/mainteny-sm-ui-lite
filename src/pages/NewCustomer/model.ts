import {AddressRecord, Contact} from 'models/misc';
import {Priority} from 'models/service-order';
import {convertToText} from 'utils/utils';

export type CustomerBasicInfoFormModel = {
  name: string;
  phone: string;
  secondaryPhoneNumber?: string;
  url: string;
  email: string;
  billingEmail?: string;
  priority: Priority | null;
  externalId: string;
  registrationDate: Date;
  costCenter: string;
  vatId: string;
  offsettingAccount: string;
  buyerReference?: string;
  invoiceFormat?: string;
  vat?: string;
};

export type CustomerAddressFormModel = {
  billingAddress: AddressRecord | null;
  beneficiaryAddress: AddressRecord | null;
  otherAddress: AddressRecord | null;
};

export enum PropertyContactPersonRole {
  FACILITY_MANAGER = 'FACILITY_MANAGER',
  PROPERTY_MANAGER = 'PROPERTY_MANAGER',
  CONTACT_PERSON = 'CONTACT_PERSON',
  ASSET_OWNER = 'ASSET_OWNER',
  OTHERS = 'OTHERS',
}

export const propertyContactPersonRoleOptions = Object.values(
  PropertyContactPersonRole,
).map((role) => convertToText(role));

export type CustomerContactPersonFormModel = {
  propertyContactPerson: {
    roles: PropertyContactPersonRole[];
    externalId?: string;
    propertyOwnerId?: string;
    secondaryPhone?: string;
  };
  userAccount: {
    username: string;
    firstName: string;
    lastName: string;
    photoUrl: string;
    contact: Contact;
    serviceCompanyId: string;
    category?: string;
    title?: string;
    reportToUser?: string;
  };
};

export type CustomerContactPersonsFormModel = {
  contactPersons: CustomerContactPersonFormModel[];
};

export type NewCustomerBody = {
  billingAddress: AddressRecord | null;
  beneficiaryAddress: AddressRecord | null;
  otherAddress: AddressRecord | null;
  contact: {
    email: string;
    phone: string;
    url: string;
  };
  externalId: string;
  name: string;
  priority: Priority | null;
  serviceCompanyId: string;
  registrationDate: Date;
  costCenter: string;
  billingEmail?: string;
  secondaryPhoneNumber?: string;
  contactPersons?: CustomerContactPersonFormModel[];
  vatId?: string;
  offsettingAccount?: string;
  buyerReference?: string;
  invoiceFormat?: string;
  vat?: string;
};

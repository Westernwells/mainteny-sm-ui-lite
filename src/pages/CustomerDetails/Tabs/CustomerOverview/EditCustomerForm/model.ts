import {AddressRecord, Priority} from 'models/misc';

export type CustomerEditForm = {
  name: string;
  phone: string;
  billingAddress: AddressRecord | null;
  beneficiaryAddress: AddressRecord | null;
  otherAddress: AddressRecord | null;
  url: string;
  email: string;
  priority: Priority;
  externalId: string;
  costCenter?: string;
  billingEmail?: string;
  registrationDate?: string;
  secondaryPhoneNumber?: string;
  taxNumber: string;
};

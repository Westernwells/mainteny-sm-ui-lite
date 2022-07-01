import {AddressRecord, Priority} from 'models/misc';

export type CustomerEditForm = {
  name: string;
  phone: string;
  billingAddress: AddressRecord | null;
  url: string;
  email: string;
  postalAddress: AddressRecord | null;
  priority: Priority;
  externalId: string;
  businessAddress?: AddressRecord | null;
};

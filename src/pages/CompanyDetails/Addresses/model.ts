import {AddressRecord} from 'models/misc';

export interface AddressesCompanyFormModel {
  billingAddress: AddressRecord | null;
  postalAddress: AddressRecord | null;
  businessAddress?: AddressRecord | null;
}

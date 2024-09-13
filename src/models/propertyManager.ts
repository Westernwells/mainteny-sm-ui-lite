import {ContractTermView} from './contract';
import {
  Address,
  AddressRecord,
  CompanyContact,
  Contact,
  Meta,
  Priority,
} from './misc';
import {ServiceCompanySimpleView} from './service-company';
import {UserAccount, UserAccountSimpleView} from './user';
import {Order} from './pagination';

export interface PropertyOwner {
  id: string;
  name: string;
  address: AddressRecord;
  contact: ContactPropertyOwner;
  search: string;
  meta: Meta;
  units?: number;
}

export interface PropertyContactPersonSimpleView {
  customerId: string;
  id: string;
  meta: Meta;
  propertyOwnerId: string;
  userAccount: UserAccountSimpleView;
}

export interface PropertyOwnerAdditionalInfo {
  priority: Priority;
  billingEmail?: string;
  costCenter: string;
  secondaryPhoneNumber: string;
  registrationDate: string;
  vatId?: string;
  offsettingAccount?: string;
  customerPortalEnabled?: boolean;
  buyerReference?: string;
  invoiceFormat: InvoiceFormat;
}

export interface PropertyOwnerView {
  id: string;
  name: string;
  number: string;
  billingAddress?: Address;
  beneficiaryAddress?: Address;
  otherAddress?: Address;
  contact: ContactPropertyOwner;
  search: string;
  meta: Meta;
  unitNumber?: number;
  additionalInfo: PropertyOwnerAdditionalInfo;
  labels: string[];
  externalId: string;
  serviceCompany?: ServiceCompanySimpleView;
  contactPersons?: CompanyContact;
  paymentTerm?: ContractTermView;
}

export interface PropertyOwnerSimpleView {
  additionalInfo: PropertyOwnerAdditionalInfo;
  billingAddress?: Address;
  beneficiaryAddress?: Address;
  otherAddress?: Address;
  contact: ContactPropertyOwner;
  id: string;
  labels: string[];
  meta: Meta;
  name: string;
  serviceCompanyId: string;
  externalId: string;
  number?: number;
}

export interface PropertyManager {
  id: string;
  propertyOwner: PropertyOwner;
  userAccount: UserAccount;
  meta: Meta;
}

export enum PropertyOwnerOrderField {
  CREATED_TIME = 'CREATED_TIME',
  NAME = 'NAME',
  XERO_LAST_SYNC_TIME = 'XERO_LAST_SYNC_TIME',
  EXTERNAL_ID = 'EXTERNAL_ID',
  BILLING_ADDRESS = 'BILLING_ADDRESS',
  PHONE = 'PHONE',
  NUMBER_OF_ELEVATOR = 'NUMBER_OF_ELEVATOR',
  REGISTRATION_DATE = 'REGISTRATION_DATE',
  XERO_LAST_SYNC_TIME_DESC = 'XERO_LAST_SYNC_TIME_DESC',
}

export interface QueryPropertyOwnersParams {
  pageIndex: number;
  pageSize: number;
  query: string;
  serviceCompanyId: string;
  unitNumberStart?: number;
  unitNumberEnd?: number;
  order?: Order;
  orderBy?: PropertyOwnerOrderField;
}

export interface ContactPropertyOwner extends Contact {
  url: string;
}

export enum InvoiceFormat {
  PDF = 'PDF',
  XML = 'XML',
  PDF_AND_XML = 'PDF_AND_XML',
}

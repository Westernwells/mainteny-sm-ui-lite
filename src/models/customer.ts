import {Address, AddressRecord, Priority} from './misc';
import {InvoiceFormat} from './propertyManager';
import {ContactsView} from './contacts';
import {UserAccountView} from 'models/user';
import {FileWithPreview} from 'models/files';

export interface CreateCustomerNote {
  content: string;
  subject: string;
}

export interface CustomerFinanceFormModel {
  buyerReference: string;
  costCenter: string;
  offsettingAccount: string;
  invoiceFormat: InvoiceFormat;
  ean: string;
  vat: string;
  billingEmail: string;
  paymentTermId: string;
  billingAddress: Address | null;
  otherAddress: Address | null;
  beneficiaryAddress: Address | null;
}

export interface CustomerGeneralInformationFormModel {
  customerImagePath: string;
  secondaryPhoneNumber: string;
  phone: string;
  email: string;
  url: string;
  priority: Priority;
  vatId: string;
  name: string;
  externalId: string;
  businessAddress: Address | null;
  postalAddress: Address | null;
  logoFile: FileWithPreview | null;
  billingAddress?: Address | null;
  otherAddress?: Address | null;
  beneficiaryAddress?: Address | null;
  billingEmail?: string;
}

export interface CustomerPortalTableRow {
  contactResourceData: ContactsView;
  id: string;
  customerId: string;
  userAccount: UserAccountView;
  emailAddress: string;
  role: string[];
  access: string;
}

export interface CustomerStatisticsParams {
  endDate?: string;
  startDate?: string;
}

export interface PropertyOwnerStatistics {
  totalRevenue: number;
  numberOfServiceOrders: number;
}

export type CustomerEditForm = {
  name?: string;
  phone?: string;
  billingAddress?: AddressRecord | null;
  beneficiaryAddress?: AddressRecord | null;
  otherAddress?: AddressRecord | null;
  url?: string;
  email?: string;
  priority?: Priority;
  externalId?: string;
  costCenter?: string;
  billingEmail?: string;
  registrationDate?: string;
  secondaryPhoneNumber?: string;
  vatId?: string;
  offsettingAccount?: string;
  paymentTermId?: string;
  customerPortalEnabled?: boolean;
  buyerReference?: string;
  invoiceFormat?: string;
  moreInfo?: string;
  vat?: string;
};

import {Fee, Meta} from './misc';
import {PropertyOwner} from './propertyManager';
import {ServiceCompanySimpleView} from './service-company';
import {ServiceOrderView} from './service-order';

export enum InvoiceStatus {
  PAID = 'PAID',
  NOT_PAID = 'NOT_PAID',
}

export enum InvoiceStatusView {
  PAID = 'Paid',
  NOT_PAID = 'Unpaid',
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  name: string;
  quantity: number;
  unitPrice: Fee;
  vat: number;
}

export interface InvoiceAdditionalInfo {
  dueDate: string;
  pdfGenerationStatus: string;
  pdfPath: string;
}

export interface InvoiceView {
  id: string;
  number: string;
  description: string;
  totalAmount: Fee;
  issuedDate: string;
  status: InvoiceStatus;
  serviceCompany: ServiceCompanySimpleView;
  serviceOrder: ServiceOrderView;
  propertyOwner: PropertyOwner;
  items: InvoiceItem[];
  search: string;
  meta: Meta;
  additionalInfo: InvoiceAdditionalInfo;
}

export interface QueryInvoiceParams {
  pageIndex: number;
  pageSize: number;
  query: string;
  status: InvoiceStatus[];
}

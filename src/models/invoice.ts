import {Amount, Fee, Meta, PdfGenerationStatus} from './misc';
import {PropertyOwner} from './propertyManager';
import {ServiceCompanySimpleView} from './service-company';
import {ServiceOrderView, ServiceOrderType} from './service-order';

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
  pdfGenerationStatus: PdfGenerationStatus;
  pdfPath: string;
}

export interface InvoiceView {
  id: string;
  number: string;
  description: string;
  totalAmount: Amount;
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

export interface InvoiceFilters {
  amount: [number, number] | number[];
  status?: InvoiceStatus;
  serviceType: ServiceOrderType[];
}

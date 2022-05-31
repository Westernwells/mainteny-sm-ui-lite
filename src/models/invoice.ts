import {
  Amount,
  AmountRecord,
  Fee,
  Meta,
  PaymentInfo,
  PdfGenerationStatus,
} from './misc';
import {PropertyOwner} from './propertyManager';
import {ServiceCompanySimpleView} from './service-company';
import {ServiceOrderView, ServiceOrderType} from './service-order';

export enum InvoiceStatus {
  PAID = 'PAID',
  NOT_PAID = 'NOT_PAID',
  DRAFT = 'DRAFT',
  EXPIRED = 'EXPIRED',
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

export interface InvoiceItemRecord {
  articleId: string;
  description: string;
  name: string;
  quantity: number;
  unitAmount: AmountRecord;
}

export interface CreateInvoice {
  description: string;
  dueDate: string;
  issuedDate: string;
  items: InvoiceItemRecord[];
  paymentInfo: PaymentInfo;
  paymentTerms: string;
  propertyOwnerId: string;
  serviceCompanyId: string;
  serviceOrderId: string;
  shouldSendOut: boolean;
}

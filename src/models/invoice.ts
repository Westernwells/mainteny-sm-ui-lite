import {Article} from './article';
import {
  Amount,
  AmountRecord,
  Meta,
  PaymentInfo,
  PdfGenerationStatus,
  WithOptional,
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

export enum InvoiceDueType {
  AFTER_EACH_VISIT = 'AFTER_EACH_VISIT',
  HALF_YEARLY = 'HALF_YEARLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
}

export enum InvoiceStatusView {
  PAID = 'Paid',
  NOT_PAID = 'Unpaid',
}

export interface InvoiceItem {
  article: Article;
  data: string;
  description: string;
  id: string;
  invoiceId: string;
  name: string;
  quantity: number;
  unitAmount: Amount;
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
  subject: string;
  type: InvoiceType;
  totalAmount: Amount;
  issuedDate: string;
  dueDate: string;
  status: InvoiceStatus;
  serviceCompany: ServiceCompanySimpleView;
  serviceOrder: ServiceOrderView;
  propertyOwner: PropertyOwner;
  items: InvoiceItem[];
  search: string;
  meta: Meta;
  additionalInfo: InvoiceAdditionalInfo;
  paymentTerms: string;
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

export interface InvoiceItemRecord<T> {
  articleId: string;
  articleUnit: string;
  description: string;
  name: string;
  quantity: number;
  unitAmount: T;
}

export enum InvoiceType {
  FULL = 'FULL',
  PARTIAL = 'PARTIAL',
}

export interface CreateInvoice {
  subject: string;
  description: string;
  dueDate: string;
  issuedDate: string;
  items: WithOptional<InvoiceItemRecord<AmountRecord>, 'articleUnit'>[];
  paymentInfo: PaymentInfo;
  paymentTerms: string;
  propertyOwnerId: string;
  serviceCompanyId: string;
  serviceOrderId: string;
  shouldSendOut: boolean;
  type: InvoiceType | '';
}

export interface UpdateInvoice {
  description: string;
  subject: string;
  dueDate: string;
  issuedDate: string;
  items: WithOptional<InvoiceItemRecord<AmountRecord>, 'articleUnit'>[];
  paymentInfo?: PaymentInfo;
  paymentTerms?: string;
  serviceOrderId: string;
  type: InvoiceType | '';
}

import {Article} from './article';
import {
  Amount,
  AmountRecord,
  Fee,
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

export interface CreateInvoice {
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
}

export interface UpdateInvoice {
  description: string;
  subject: string;
  dueDate: string;
  issuedDate: string;
  items: InvoiceItemRecord<Amount>[];
  paymentInfo?: PaymentInfo;
  paymentTerms?: string;
  serviceOrderId: string;
}

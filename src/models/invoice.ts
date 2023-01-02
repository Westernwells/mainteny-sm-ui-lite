import {Article} from './article';
import {
  Amount,
  AmountRecord,
  Meta,
  Money,
  PaymentInfo,
  PdfGenerationStatus,
  WithOptional,
} from './misc';
import {PropertyOwner} from './propertyManager';
import {QuotationItemRecord} from './quotation';
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
  MONTHLY = 'MONTHLY',
}

export enum InvoiceStatusView {
  PAID = 'Paid',
  NOT_PAID = 'Sent',
  DRAFT = 'Draft',
  EXPIRED = 'Overdue',
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

export enum InvoiceOverdueNoticeStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
}

export interface InvoiceOverdueNoticeAdditionalInfo {
  pdfPath: string;
  pdfGenerationStatus: PdfGenerationStatus;
}

export interface InvoiceOverdueNoticeSimpleView {
  id: string;
  number: string;
  externalId: string;
  subject: string;
  description: string;
  sentDate: string;
  dueDate: string;
  initialAmount: Money;
  handlingFee: Money;
  totalAmount: Money;
  status: InvoiceOverdueNoticeStatus;
  additionalInfo: InvoiceOverdueNoticeAdditionalInfo;
  meta: Meta;
}

export interface InvoiceView {
  id: string;
  number: string;
  externalId: string;
  description: string;
  subject: string;
  type: InvoiceType;
  totalAmount: Amount;
  issuedDate: string;
  dueDate: string;
  status: InvoiceStatus;
  serviceCompany: ServiceCompanySimpleView;
  serviceOrder?: ServiceOrderView;
  propertyOwner: PropertyOwner;
  items: InvoiceItem[];
  search: string;
  meta: Meta;
  additionalInfo: InvoiceAdditionalInfo;
  paymentTerms: string;
  overdueNotices: InvoiceOverdueNoticeSimpleView[];
}

export interface QueryInvoiceParams {
  pageIndex: number;
  pageSize: number;
  query: string;
  status: InvoiceStatus[];
  totalAmountFrom?: number;
  totalAmountTo?: number;
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
  CREDIT_NOTE = 'CREDIT_NOTE',
}

export interface CreateInvoice {
  subject: string;
  description: string;
  dueDate: string;
  issuedDate: string;
  items: QuotationItemRecord[] | InvoiceItemRecord<Amount>[];
  paymentInfo: PaymentInfo;
  paymentTerms: string;
  propertyOwnerId: string;
  serviceCompanyId: string;
  serviceOrderId?: string;
  shouldSendOut: boolean;
  type: InvoiceType;
  includeWorkReport?: boolean;
}

export interface UpdateInvoice {
  description: string;
  subject: string;
  dueDate: string;
  issuedDate: string;
  items: WithOptional<InvoiceItemRecord<AmountRecord>, 'articleUnit'>[];
  paymentInfo?: PaymentInfo;
  paymentTerms?: string;
  serviceOrderId?: string;
  type: InvoiceType;
  includeWorkReport?: boolean;
}

export interface QueryInvoiceCommentsParams {
  pageIndex: number;
  pageSize: number;
}

export interface CreateInvoiceComment {
  content: string;
  subject: string;
}

export interface InvoicePaymentRecord {
  amount: Money;
  paidDate: string;
  markAsPaid: boolean;
}

export interface CreateInvoiceOverdueNoticeRecord {
  externalId: string;
  subject: string;
  description: string;
  dueDate: string;
  initialAmount: Money;
  handlingFee: Money;
}

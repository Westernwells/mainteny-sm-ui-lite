import {ArticleView} from './article';
import {
  Address,
  AddressRecord,
  Amount,
  AmountRecord,
  Meta,
  Money,
  PaymentInfo,
  PdfGenerationStatus,
  WithOptional,
} from './misc';
import {PropertyOwnerSimpleView} from './propertyManager';
import {QuotationItemRecord} from './quotation';
import {ServiceCompanySimpleView} from './service-company';
import {ServiceOrderView, ServiceOrderType} from './service-order';

export enum InvoiceStatus {
  PAID = 'PAID',
  NOT_PAID = 'NOT_PAID',
  DRAFT = 'DRAFT',
  EXPIRED = 'EXPIRED',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
}

export enum InvoiceCycle {
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
  PARTIALLY_PAID = 'Partially Paid',
}

export interface InvoiceItem {
  totalAmount: Amount;
  article: ArticleView;
  data: string;
  description: string;
  id: string;
  invoiceId: string;
  name: string;
  quantity: number;
  unitAmount: Amount;
}

export interface BeneficialDetails {
  name: string;
  address: Address;
}

export interface BeneficialDetailsRecord {
  name: string;
  address: AddressRecord;
}

export interface InvoiceAdditionalInfo {
  dueDate: string;
  pdfGenerationStatus: PdfGenerationStatus;
  pdfPath: string;
  includeWorkReport: boolean;
  includeCheckList?: boolean;
  paymentInfo: PaymentInfo;
  costCenter?: string;
  customerSpecificOrderNumber?: string;
  beneficialDetails?: BeneficialDetails;
  moreInfo?: string;
  billingAddress?: AddressRecord;
  beneficiaryAddress?: AddressRecord;
  alternativeAddress?: AddressRecord;
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
  sentDate: string;
  dueDate: string;
  status: InvoiceStatus;
  serviceOrder?: ServiceOrderView;
  propertyOwner: PropertyOwnerSimpleView;
  items: InvoiceItem[];
  search: string;
  meta: Meta;
  additionalInfo: InvoiceAdditionalInfo;
  paymentTerms: string;
  overdueNotices: InvoiceOverdueNoticeSimpleView[];
  commentCount?: number;
  partialInvoices?: InvoiceItem[];
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
  FINAL = 'FINAL',
  FULL = 'FULL',
  PARTIAL = 'PARTIAL',
  CREDIT_NOTE = 'CREDIT_NOTE',
}

export interface InvoiceFormData {
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
  includeCheckList?: boolean;
  costCenter?: string;
  customerSpecificOrderNumber?: string;
  beneficialName?: string;
  beneficialAddress?: AddressRecord;
  moreInfo?: string;
  billingAddress?: AddressRecord;
  beneficiaryAddress?: AddressRecord;
  alternativeAddress?: AddressRecord;
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
  includeCheckList?: boolean;
  costCenter?: string;
  customerSpecificOrderNumber?: string;
  beneficialDetails?: BeneficialDetailsRecord;
  moreInfo?: string;
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
  costCenter?: string;
  customerSpecificOrderNumber?: string;
  beneficialDetails?: BeneficialDetailsRecord;
  moreInfo?: string;
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

export enum InvoiceActivityType {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  SENT = 'SENT',
  PRINTED = 'PRINTED',
  OVERDUE_NOTICE_SENT = 'OVERDUE_NOTICE_SENT',
  PAID = 'PAID',
  EXPIRED = 'EXPIRED',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  PAYMENT_UPDATED = 'PAYMENT_UPDATED',
  PAYMENT_DELETED = 'PAYMENT_DELETED',
}

export interface InvoiceActivityView {
  id: string;
  type: InvoiceActivityType;
  data: string;
  text: string;
  additionalInfo: string;
  meta: Meta;
}

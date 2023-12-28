import {ArticleType, ArticleView, CostPackage} from './article';
import {
  Address,
  AddressRecord,
  Amount,
  AmountRecord,
  Meta,
  Money,
  PaymentInfo,
  PdfGenerationStatus,
} from './misc';
import {PropertyOwnerSimpleView} from './propertyManager';
import {QuotationItemRecord} from './quotation';
import {ServiceOrderView, ServiceOrderType} from './service-order';

export enum InvoiceStatus {
  PAID = 'PAID',
  NOT_PAID = 'NOT_PAID',
  DRAFT = 'DRAFT',
  EXPIRED = 'EXPIRED',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  CANCELLED = 'CANCELLED',
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
  CANCELLED = 'Cancelled',
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

export interface AlternativeServiceCompanyInfo {
  name?: string;
  address?: AddressRecord;
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
  laborMaterialCosts: {
    LABOR: string;
    MATERIAL: string;
  };
  laborMaterialCostText?: string;
  alternativeServiceCompanyInfo?: AlternativeServiceCompanyInfo;
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
  sentDate?: string;
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
  payments: InvoicePaymentView[];
}

export interface InvoicePaymentView {
  additionalInfo: InvoiceAdditionalInfo;
  amount: Money;
  id: string;
  invoiceId: string;
  meta: Meta;
  paidDate: string;
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

export enum DiscountType {
  AMOUNT = 'AMOUNT',
  PERCENTAGE = 'PERCENTAGE',
  NONE = 'NONE',
}

export enum DiscountTypeOptions {
  AMOUNT = 'Lump-sum',
  PERCENTAGE = 'Percentage',
}

export interface Discount {
  type: DiscountType;
  amount?: Money;
  percentage?: number;
}

export enum PaymentType {
  LUMP_SUM = 'LUMP_SUM',
  PERCENTAGE = 'PERCENTAGE',
  PER_ITEM = 'PER_ITEM',
  NONE = 'NONE',
}

export interface VatAmount {
  vat: number;
  percentageVat: number;
}

export interface AggregatedAmount {
  netAmount?: number;
  grossAmount?: number;
  currency: string;
  vats: VatAmount[];
  vat?: number;
  percentageVat?: number;
  fractionDigits?: number;
}

export interface Payment {
  type: PaymentType;
  amount?: AggregatedAmount;
  percentage?: number;
  description?: string;
}

export enum InvoiceItemPaymentType {
  AMOUNT = 'AMOUNT',
  PERCENTAGE = 'PERCENTAGE',
}

export interface InvoiceItemPaymentRecord {
  type: InvoiceItemPaymentType;
  amount?: Money;
  percentage?: number;
}

export interface ArticleRecord {
  id?: string;
  name?: string;
  externalId?: string;
  type?: ArticleType;
  unit?: string;
  unitSellingAmount?: Amount;
  costPackage?: CostPackage;
}

export interface InvoiceItemRecord<T> {
  article?: ArticleRecord;
  name: string;
  description?: string;
  unitAmount: T;
  quantity: number;
  discount?: Discount;
  payment?: InvoiceItemPaymentRecord;
}

export enum InvoiceType {
  FINAL = 'FINAL',
  FULL = 'FULL',
  PARTIAL = 'PARTIAL',
  CREDIT_NOTE = 'CREDIT_NOTE',
  UPFRONT = 'UPFRONT',
}

export interface InvoiceFormData {
  subject: string;
  description: string;
  dueDate: string;
  sentDate: string;
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
  moreInfo?: string;
  billingAddress?: AddressRecord;
  beneficiaryAddress?: AddressRecord;
  alternativeAddress?: AddressRecord;
  externalId?: string;
  laborMaterialCosts: {
    LABOR: string;
    MATERIAL: string;
  };
  laborMaterialCostText: string;
  unitNumber?: string;
  alternativeServiceCompanyInfo?: AlternativeServiceCompanyInfo;
  discount?: Discount;
  payment?: Payment;
}

export interface CreateInvoice {
  serviceCompanyId: string;
  propertyOwnerId: string;
  serviceOrderId?: string;
  externalId?: string;
  subject?: string;
  description?: string;
  dueDate?: string;
  type?: InvoiceType;
  items: InvoiceItemRecord<Amount>[];
  paymentTerms?: string;
  paymentInfo?: PaymentInfo;
  shouldSendOut?: boolean;
  includeWorkReport?: boolean;
  includeCheckList?: boolean;
  costCenter?: string;
  customerSpecificOrderNumber?: string;
  integration?: {
    xeroEntityId?: string;
  };
  moreInfo?: string;
  billingAddress?: AddressRecord;
  beneficiaryAddress?: AddressRecord;
  alternativeAddress?: AddressRecord;
  laborMaterialCosts?: {
    LABOR?: string;
    MATERIAL?: string;
  };
  laborMaterialCostText?: string;
  alternativeServiceCompanyInfo?: AlternativeServiceCompanyInfo;
  discount?: Discount;
  payment?: Payment;
}

export interface UpdateInvoice {
  serviceOrderId?: string;
  propertyOwnerId?: string;
  externalId?: string;
  subject?: string;
  description?: string;
  dueDate?: string;
  items?: InvoiceItemRecord<AmountRecord>[];
  paymentTerms?: string;
  paymentInfo?: PaymentInfo;
  includeWorkReport?: boolean;
  includeCheckList?: boolean;
  costCenter?: string;
  customerSpecificOrderNumber?: string;
  integration?: {
    xeroEntityId?: string;
  };
  moreInfo?: string;
  billingAddress?: AddressRecord;
  beneficiaryAddress?: AddressRecord;
  alternativeAddress?: AddressRecord;
  laborMaterialCosts?: {
    LABOR?: string;
    MATERIAL?: string;
  };
  laborMaterialCostText?: string;
  alternativeServiceCompanyInfo?: AlternativeServiceCompanyInfo;
  discount?: Discount;
  payment?: Payment;
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
  CANCELLED = 'CANCELLED',
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

export interface MyInvoiceActivityView {
  id: string;
  type: InvoiceActivityType;
  data: string;
  text: string;
  additionalInfo: string;
  meta: Meta;
  overdueNoticeId: string;
  count: number;
}

export interface InvoiceActivityOverdueNoticeSentData {
  email: string;
  overdueNoticeId: string;
}

export const ALL_MANUAL_INVOICE_TYPES = [
  InvoiceType.CREDIT_NOTE,
  InvoiceType.FINAL,
  InvoiceType.FULL,
  InvoiceType.PARTIAL,
];

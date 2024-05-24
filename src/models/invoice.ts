import {ArticleType, ArticleView, CostPackage} from './article';
import {PaymentTermData} from './contract';
import {
  Address,
  AddressRecord,
  Amount,
  AmountRecord,
  EmailRecord,
  Meta,
  Money,
  Order,
  PaymentInfo,
  PdfGenerationStatus,
} from './misc';
import {PropertyOwnerSimpleView} from './propertyManager';
import {ServiceCompanySimpleView} from './service-company';
import {ServiceOrderView, ServiceOrderType} from './service-order';

export enum InvoiceStatus {
  PAID = 'PAID',
  NOT_PAID = 'NOT_PAID',
  DRAFT = 'DRAFT',
  EXPIRED = 'EXPIRED',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  CANCELLED = 'CANCELLED',
  CREDITED = 'CREDITED',
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
  CREDITED = 'Credited',
}

export interface InvoiceItem {
  totalAmount: Amount;
  article?: ArticleView;
  data: string;
  description: string;
  id: string;
  invoiceId: string;
  articleId?: string;
  name: string;
  quantity: number;
  unitAmount: Amount;
  additionalInfo?: {
    discount?: Discount;
    payment?: InvoiceItemPaymentRecord;
  };
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

export interface InvoicePaymentTermRecord {
  id?: string;
  term: string;
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
  discount?: Discount;
  payment?: Payment<AggregatedAmount>;
  deliveryStartDate?: string;
  deliveryEndDate?: string;
  showArticleSection?: boolean;
  paymentTerm?: InvoicePaymentTermRecord & {
    data?: PaymentTermData;
  };
}

export enum InvoiceOverdueNoticeStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
}

export enum InvoiceOrderField {
  CREATED_DATE = 'CREATED_DATE',
  CUSTOMER_NAME = 'CUSTOMER_NAME',
  DUE_DATE = 'DUE_DATE',
  NUMBER = 'NUMBER',
  XERO_LAST_SYNC_TIME = 'XERO_LAST_SYNC_TIME',
  EXTERNAL_ID = 'EXTERNAL_ID',
  PROPERTY_OWNER_NAME = 'PROPERTY_OWNER_NAME',
  SENT_DATE = 'SENT_DATE',
  SERVICE_ORDER_EXTERNAL_ID = 'SERVICE_ORDER_EXTERNAL_ID',
  TYPE = 'TYPE',
  SERVICE_ORDER_TYPE = 'SERVICE_ORDER_TYPE',
  TOTAL_NET_AMOUNT = 'TOTAL_NET_AMOUNT',
  COMMENT_COUNT = 'COMMENT_COUNT',
  STATUS = 'STATUS',
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
  totalAmount: AggregatedAmount;
  sentDate?: string;
  dueDate?: string;
  status: InvoiceStatus;
  serviceOrder?: ServiceOrderView;
  propertyOwner: PropertyOwnerSimpleView;
  serviceCompany: ServiceCompanySimpleView;
  items: InvoiceItem[];
  search: string;
  meta: Meta;
  additionalInfo: InvoiceAdditionalInfo;
  overdueNotices: InvoiceOverdueNoticeSimpleView[];
  commentCount?: number;
  payments: InvoicePaymentView[];
  refInvoiceId?: string;
  paymentTerms?: string;
  discount: Discount;
}

export interface InvoicePaymentAdditionalInfo {
  xero?: {
    xeroEntityId: string;
    lastSyncedTime: string;
  };
  paymentDetails?: AggregatedAmount;
}

export interface InvoicePaymentView {
  additionalInfo: InvoicePaymentAdditionalInfo;
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
  order?: Order;
  orderByField?: InvoiceOrderField;
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

export enum PaymentTypeOptions {
  LUMP_SUM = 'Lump-sum',
  PERCENTAGE = 'Percentage',
  PER_ITEM = 'Per Article',
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

export interface Payment<T = Money> {
  type: PaymentType;
  amount?: T;
  percentage?: number;
  description?: string;
}

export enum InvoiceItemPaymentType {
  AMOUNT = 'AMOUNT',
  PERCENTAGE = 'PERCENTAGE',
}

export interface InvoiceItemPaymentRecord {
  type: InvoiceItemPaymentType;
  amount?: Amount;
  percentage?: number;
}

export interface ArticleRecord {
  id?: string;
  name?: string;
  externalId?: string;
  type?: ArticleType;
  unit?: string;
  unitSellingAmount?: AmountRecord;
  costPackage?: CostPackage;
}

export interface InvoiceItemRecord {
  article?: ArticleRecord;
  name: string;
  description?: string;
  unitAmount: AmountRecord;
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
  AGGREGATE = 'AGGREGATE',
}

export const InvoiceTypeMap = {
  FINAL: 'Final',
  FULL: 'Full',
  PARTIAL: 'Partial',
  CREDIT_NOTE: 'Credit Note',
  UPFRONT: 'Upfront',
  AGGREGATE: 'Contract',
};

export interface InvoiceFormData {
  subject: string;
  description: string;
  dueDate?: Date;
  sentDate?: Date;
  items: InvoiceItemRecord[];
  paymentInfo: PaymentInfo;
  paymentTerm?: InvoicePaymentTermRecord;
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
  laborMaterialCosts?: {
    LABOR: string;
    MATERIAL: string;
  };
  laborMaterialCostText?: string;
  unitNumber?: string;
  alternativeServiceCompanyInfo?: AlternativeServiceCompanyInfo;
  discount?: Discount;
  payment?: Payment;
  deliveryStartDate?: Date;
  deliveryEndDate?: Date;
  showArticleSection?: boolean;
  notes?: CreateInvoiceComment[];
}

export interface CreateInvoice {
  serviceCompanyId: string;
  propertyOwnerId: string;
  serviceOrderId?: string;
  externalId?: string;
  subject?: string;
  description?: string;
  dueDate?: string;
  sentDate?: string;
  type?: InvoiceType;
  items: InvoiceItemRecord[];
  paymentTerm?: InvoicePaymentTermRecord;
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
  deliveryStartDate?: string;
  deliveryEndDate?: string;
  showArticleSection?: boolean;
  refInvoiceId?: string;
  notes?: CreateInvoiceComment[];
}

export interface UpdateInvoice {
  serviceOrderId?: string;
  propertyOwnerId?: string;
  externalId?: string;
  subject?: string;
  description?: string;
  dueDate?: string;
  sentDate?: string;
  items?: InvoiceItemRecord[];
  paymentTerm?: InvoicePaymentTermRecord;
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
  deliveryStartDate?: string;
  deliveryEndDate?: string;
  showArticleSection?: boolean;
}

export interface QueryInvoiceCommentsParams {
  pageIndex: number;
  pageSize: number;
}

export interface CreateInvoiceComment {
  content: string;
  subject: string;
  id?: string;
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
  sentDate: string;
  emailRecord?: EmailRecord;
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
  INVOICE_EMAIL_SENT_FAILED = 'INVOICE_EMAIL_SENT_FAILED',
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
  amount: number;
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

export interface SendInvoiceRecord {
  pdfPath: string;
  externalId: string;
  dueDate: string;
  sentDate: string;
  email: EmailRecord;
}

export interface PrintInvoiceRecord {
  pdfPath: string;
  externalId: string;
  dueDate: string;
  sentDate: string;
}

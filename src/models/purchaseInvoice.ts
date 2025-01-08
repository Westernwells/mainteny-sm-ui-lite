import {FileWithPreview} from 'components/MyDropZone/MyDropzone';
import {AggregatedAmount, Discount, DiscountType, VatAmount} from './invoice';
import {FileResourceRecord} from './media';
import {Meta, Money} from './misc';
import {Order} from './pagination';

export interface PurchaseInvoiceView {
  id: string;
  serviceCompanyId: string;
  externalId: string;
  description: string;
  subject: string;
  status: PurchaseInvoiceStatus;
  totalAmount: AggregatedAmount;
  sentDate?: string;
  dueDate?: string;
  additionalInfo: PurchaseInvoiceAdditionalInfo;
  search: string;
  meta: Meta;
}

export enum PurchaseInvoiceStatus {
  ALL = 'ALL',
  NEW = 'NEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  OVERDUE = 'OVERDUE',
  PAID = 'PAID',
  ARCHIVED = 'ARCHIVED',
}

export enum PurchaseInvoiceStatusView {
  NEW = 'New',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  OVERDUE = 'Overdue',
  PAID = 'Paid',
  ARCHIVED = 'Archived',
}

export const mapPurchaseInvoiceStatus = (
  invoiceStatus: PurchaseInvoiceStatusView,
) => {
  switch (invoiceStatus) {
    case PurchaseInvoiceStatusView.NEW:
      return PurchaseInvoiceStatus.NEW;
    case PurchaseInvoiceStatusView.APPROVED:
      return PurchaseInvoiceStatus.APPROVED;
    case PurchaseInvoiceStatusView.REJECTED:
      return PurchaseInvoiceStatus.REJECTED;
    case PurchaseInvoiceStatusView.OVERDUE:
      return PurchaseInvoiceStatus.OVERDUE;
    case PurchaseInvoiceStatusView.PAID:
      return PurchaseInvoiceStatus.PAID;
    case PurchaseInvoiceStatusView.ARCHIVED:
      return PurchaseInvoiceStatus.ARCHIVED;
    default:
      return PurchaseInvoiceStatus.NEW;
  }
};

export interface PurchaseInvoiceAdditionalInfo {
  supplier: PurchaseInvoiceSupplier;
  serviceOrders: PurchaseInvoiceServiceOrder[];
  discount: {type: DiscountType; amount: Money; percentage?: number};
  documents: FileResourceRecord[];
}

export interface PurchaseInvoiceSupplier {
  id?: string;
  name: string;
  externalId: string;
}

export interface PurchaseInvoiceServiceOrder {
  serviceOrder: IdExternalId;
  netAmount?: number;
}

export interface IdExternalId {
  id: string;
  externalId: string;
}

export interface QueryPurchaseInvoiceParams {
  pageIndex?: number;
  pageSize?: number;
  query?: string;
  status: PurchaseInvoiceStatus[];
  createdDateTimeTo?: string;
  createdDateTimeFrom?: string;
  sentDateFrom?: string;
  sentDateTo?: string;
  order?: Order;
  orderByField?: PurchaseInvoiceOrderField;
  grossAmountMin?: number;
  grossAmountMax?: number;
  serviceOrderId?: string[];
}

export enum PurchaseInvoiceOrderField {
  CREATED_AT = 'CREATED_AT',
  EXTERNAL_ID = 'EXTERNAL_ID',
  SUBJECT = 'SUBJECT',
  SUPPLIER_NAME = 'SUPPLIER_NAME',
  SUPPLIER_EXTERNAL_ID = 'SUPPLIER_EXTERNAL_ID',
  SERVICE_ORDER_EXTERNAL_ID = 'SERVICE_ORDER_EXTERNAL_ID',
  STATUS = 'STATUS',
  TOTAL_AMOUNT_NET = 'TOTAL_AMOUNT_NET',
}

export interface QueryPurchaseInvoiceStatisticsParams {
  createdDateTimeTo?: string | null;
  createdDateTimeFrom?: string | null;
  dueDateFrom?: string | null;
  dueDateTo?: string | null;
  grossAmountFrom?: number;
  grossAmountTo?: number;
  hasComments?: boolean;
  hasDocuments?: boolean;
  netAmountFrom?: number;
  netAmountTo?: number;
  query?: string;
  sentDateFrom?: string;
  sentDateTo?: string;
  status?: PurchaseInvoiceStatus[];
  serviceOrderId?: string[];
}

export interface PurchaseInvoiceStatistics {
  numOfInvoices?: number;
  totalAmounts: Record<string, number>;
  totalPendingAmounts: Record<string, number>;
  numOfInvoicesPerStatus: Record<string, number>;
}

export interface PurchaseInvoiceServiceOrderRecord {
  serviceOrderId: string;
  netAmount?: number;
}

export interface CreatePurchaseInvoiceRecord {
  serviceCompanyId: string;
  externalId: string;
  subject: string;
  description: string;
  supplier: PurchaseInvoiceSupplier | null;
  dueDate: string;
  sentDate: string;
  currency: string;
  serviceOrders: PurchaseInvoiceServiceOrderRecord[];
  netAmount?: number;
  vatAmounts: VatAmount[];
  discount: Discount;
  status: PurchaseInvoiceStatus;
  documents: FileResourceRecord[];
}

export type PurchaseInvoiceTableRow = {
  purchaseInvoiceData: PurchaseInvoiceView;
  id: string;
  externalId: string;
  subject: string;
  supplierName: string;
  supplierExternalId: string;
  supplierId: string;
  sentDate: string;
  status: PurchaseInvoiceStatus;
  amount: string;
  hasAttachments: boolean;
  serviceOrders: PurchaseInvoiceServiceOrder[];
};

export const PurchaseInvoiceFilterToStatusMap = new Map<
  PurchaseInvoiceStatus,
  PurchaseInvoiceStatus[]
>([
  [PurchaseInvoiceStatus.APPROVED, [PurchaseInvoiceStatus.APPROVED]],
  [PurchaseInvoiceStatus.ARCHIVED, [PurchaseInvoiceStatus.ARCHIVED]],
  [PurchaseInvoiceStatus.NEW, [PurchaseInvoiceStatus.NEW]],
  [PurchaseInvoiceStatus.OVERDUE, [PurchaseInvoiceStatus.OVERDUE]],
  [PurchaseInvoiceStatus.PAID, [PurchaseInvoiceStatus.PAID]],
  [PurchaseInvoiceStatus.REJECTED, [PurchaseInvoiceStatus.REJECTED]],
  [
    PurchaseInvoiceStatus.ALL,
    [
      PurchaseInvoiceStatus.APPROVED,
      PurchaseInvoiceStatus.ARCHIVED,
      PurchaseInvoiceStatus.NEW,
      PurchaseInvoiceStatus.OVERDUE,
      PurchaseInvoiceStatus.PAID,
      PurchaseInvoiceStatus.REJECTED,
    ],
  ],
]);

export interface UpdatePurchaseInvoiceRecord {
  externalId: string;
  subject?: string;
  description?: string;
  supplier?: PurchaseInvoiceSupplier | null;
  dueDate?: string;
  sentDate?: string;
  currency?: string;
  serviceOrders?: PurchaseInvoiceServiceOrderRecord[];
  netAmount?: number;
  vats?: VatAmount[];
  discount: Discount;
  status?: PurchaseInvoiceStatus;
  documents?: FileWithPreview[] | FileResourceRecord[];
}

export type PurchaseInvoiceFilterForm = {
  number?: string;
  subject?: string;
  supplierName?: string;
  supplierId?: string;
  sentDateFrom?: string | null;
  sentDateTo?: string | null;
  dueDateFrom?: string | null;
  dueDateTo?: string | null;
  orderNumber?: string;
  purchaseInvoiceStatus: PurchaseInvoiceStatus[];
  netAmountMin?: number;
  netAmountMax?: number;
  hasAttachments?: boolean;
  hasNotes?: boolean;
};

export type PurchaseInvoiceSearchParameters = {
  search?: string;
  supplierName?: string;
  supplierId?: string;
  purchaseInvoiceNumber?: string;
  subject?: string;
};

import {
  PurchaseInvoiceSearchParameters,
  PurchaseInvoiceStatus,
  PurchaseInvoiceTableRow,
  PurchaseInvoiceView,
} from 'models/purchaseInvoice';
import {formatCurrency} from './currency';

export const aggregatePurchaseInvoiceRow = (
  purchaseInvoices: PurchaseInvoiceView[],
): PurchaseInvoiceTableRow[] =>
  purchaseInvoices.map((purchaseInvoice) => ({
    purchaseInvoiceData: purchaseInvoice,
    id: purchaseInvoice.id,
    externalId: purchaseInvoice.externalId,
    subject: purchaseInvoice.subject,
    supplierName: purchaseInvoice.additionalInfo.supplier.name,
    supplierExternalId:
      purchaseInvoice.additionalInfo.supplier.externalId || '-',
    supplierId: purchaseInvoice.additionalInfo.supplier.id || '-',
    sentDate: purchaseInvoice.sentDate || '-',
    status: purchaseInvoice.status,
    amount:
      formatCurrency(
        purchaseInvoice.totalAmount.netAmount! /
          10 ** purchaseInvoice.totalAmount.fractionDigits!,
      ) ?? '-',
    hasAttachments: !!purchaseInvoice.additionalInfo.documents.length,
    serviceOrders: purchaseInvoice.additionalInfo.serviceOrders,
  }));

export const getPurchaseInvoiceStatusColor = (
  status: PurchaseInvoiceStatus,
) => {
  switch (status) {
    case PurchaseInvoiceStatus.OVERDUE:
      return 'error';
    case PurchaseInvoiceStatus.PAID:
      return 'darkSuccess';
    case PurchaseInvoiceStatus.ARCHIVED:
      return 'action.active';
    case PurchaseInvoiceStatus.NEW:
      return 'primary.light';
    case PurchaseInvoiceStatus.APPROVED:
      return 'primary.dark';
    case PurchaseInvoiceStatus.REJECTED:
      return 'warning';
    default:
      return 'default';
  }
};

export const purchaseInvoiceStatusToString = (
  status: PurchaseInvoiceStatus,
) => {
  switch (status) {
    case PurchaseInvoiceStatus.OVERDUE:
      return 'Overdue';
    case PurchaseInvoiceStatus.APPROVED:
      return 'Approved';
    case PurchaseInvoiceStatus.ARCHIVED:
      return 'Archived';
    case PurchaseInvoiceStatus.NEW:
      return 'New';
    case PurchaseInvoiceStatus.PAID:
      return 'Paid';
    case PurchaseInvoiceStatus.REJECTED:
      return 'Not approved';
    default:
      return '';
  }
};

export const createPurchaseInvoiceSearchQuery = ({
  search,
  supplierId,
  supplierName,
  subject,
  purchaseInvoiceNumber,
}: PurchaseInvoiceSearchParameters) => {
  const elements = [
    search && search,
    supplierId && `[sup:externalid:*${supplierId}*]`,
    supplierName && `[sup:name:*${supplierName}*]`,
    subject && `[subject:*${subject}*]`,
    purchaseInvoiceNumber && `[externalid:*${purchaseInvoiceNumber}*]`,
  ];
  return elements.length ? elements.join(' ') : '';
};

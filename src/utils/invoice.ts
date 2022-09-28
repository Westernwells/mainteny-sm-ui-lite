import {
  InvoiceItemRecord,
  InvoiceStatus,
  InvoiceStatusView,
} from 'models/invoice';
import {Amount} from 'models/misc';
import {QuotationItemRecord} from 'models/quotation';

export const getTotalFromArticles = (
  items: QuotationItemRecord[] | InvoiceItemRecord<Amount>[],
): number =>
  items
    .map(
      (item) =>
        item.quantity *
        (item.unitAmount.netAmount / 10 ** item.unitAmount.fractionDigits!),
    )
    .reduce((prevValue, currentValue) => prevValue + currentValue, 0);

export const getTotalWithVatFromArticles = (
  items: QuotationItemRecord[] | InvoiceItemRecord<Amount>[],
): number =>
  items
    .map(
      (item) =>
        item.quantity *
        (item.unitAmount.vat / 10 ** item.unitAmount.fractionDigits!),
    )
    .reduce((prevValue, currentValue) => prevValue + currentValue, 0);

export const mapInvoiceStatus = (invoiceStatus: InvoiceStatusView) => {
  switch (invoiceStatus) {
    case InvoiceStatusView.PAID:
      return InvoiceStatus.PAID;
    case InvoiceStatusView.NOT_PAID:
      return InvoiceStatus.NOT_PAID;
    case InvoiceStatusView.DRAFT:
      return InvoiceStatus.DRAFT;
    case InvoiceStatusView.EXPIRED:
      return InvoiceStatus.EXPIRED;
    default:
      return undefined;
  }
};

import {DiscountType} from 'models/invoice';
import {
  QuotationActivityType,
  QuotationFormData,
  QuotationItemRecord,
} from 'models/quotation';
import {applyDiscount} from 'pages/InvoiceDetails/utils';
import {Currencies} from './currency';

export const getQuotationActivityTitle = (
  type: QuotationActivityType,
): string => {
  switch (type) {
    case QuotationActivityType.CREATED:
      return 'Quotation created';
    case QuotationActivityType.UPDATED:
      return 'Quotation updated';
    case QuotationActivityType.SENT:
      return 'Quotation sent';
    case QuotationActivityType.ACCEPTED:
      return 'Quotation accepted';
    case QuotationActivityType.REJECTED:
      return 'Quotation rejected';
    case QuotationActivityType.SERVICE_ORDER_ADDED:
      return 'Service Job added';
    case QuotationActivityType.SERVICE_ORDER_REMOVED:
      return 'Service Job removed';
    case QuotationActivityType.PRINTED:
      return 'Quotation printed';
    default:
      return '';
  }
};

export const calculateQuotationTotalWithPerItemDiscount = (
  invoice: QuotationFormData,
) => {
  const sum = invoice.items
    .map((item: QuotationItemRecord) =>
      applyDiscount({
        actualValue:
          (item.unitAmount.netAmount /
            10 ** Currencies[item.unitAmount.currency]) *
          item.quantity,
        ...(item.discount?.type === DiscountType.AMOUNT
          ? {amount: item.discount?.amount?.value ?? 0}
          : {percentage: item.discount?.percentage ?? 0}),
      }),
    )
    .reduce((prevValue, currentValue) => prevValue + currentValue, 0);

  return sum;
};

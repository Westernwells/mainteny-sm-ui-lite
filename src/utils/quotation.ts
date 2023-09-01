import {QuotationActivityType} from 'models/quotation';

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
    default:
      return '';
  }
};

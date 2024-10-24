import {DiscountType} from 'models/invoice';
import {
  QuotationActivityType,
  QuotationActivityView,
  QuotationItemRecord,
} from 'models/quotation';
import {applyDiscount} from 'pages/InvoiceDetails/utils';
import {TFunction} from 'i18next';
import {Currencies} from './currency';

export const getQuotationActivityTitle = (
  activity: QuotationActivityView,
  t: TFunction,
): string => {
  switch (activity.type) {
    case QuotationActivityType.CREATED:
      return activity?.meta.creator
        ? t('Quotation created by {{name}}', {
            name: `${activity?.meta.creator?.firstName} ${activity?.meta.creator?.lastName}`,
          })
        : t('Quotation created by System');
    case QuotationActivityType.UPDATED:
      return activity?.meta.creator
        ? t('Quotation updated by {{name}}', {
            name: `${activity?.meta.creator?.firstName} ${activity?.meta.creator?.lastName}`,
          })
        : t('Quotation updated by System');
    case QuotationActivityType.SENT:
      return t('Quotation sent');
    case QuotationActivityType.ACCEPTED:
      return t('Quotation accepted');
    case QuotationActivityType.REJECTED:
      return t('Quotation rejected');
    case QuotationActivityType.SERVICE_ORDER_ADDED:
      return t('Service Job added');
    case QuotationActivityType.SERVICE_ORDER_REMOVED:
      return t('Service Job removed');
    case QuotationActivityType.PRINTED:
      return t('Quotation printed');
    default:
      return '';
  }
};

export const calculateQuotationTotalWithPerItemDiscount = (
  quotationItems: QuotationItemRecord[],
) => {
  const sum = quotationItems
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

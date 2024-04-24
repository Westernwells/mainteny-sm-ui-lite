import {ArticleView} from 'models/article';
import {
  ArticleRecord,
  CreateInvoice,
  Discount,
  DiscountType,
  InvoiceFormData,
  InvoiceItemPaymentType,
  InvoiceItemRecord,
  PaymentType,
  UpdateInvoice,
} from 'models/invoice';
import {getItemRecord} from 'utils/article-utils';
import {Currencies, moneyRecordForBackend} from 'utils/currency';
import {dateToString, fixRounding} from 'utils/utils';

export const formatInvoiceRecord = (
  value: InvoiceFormData,
): CreateInvoice | UpdateInvoice => ({
  ...value,
  subject: value.subject,
  description: value.description,
  dueDate: value.dueDate ? dateToString(value.dueDate) : '',
  sentDate: value.sentDate ? dateToString(value.sentDate) : '',
  type: value.type,
  items: value.items.map((item) => {
    const {article, ...rest} = item;
    const modifiedArticle = {...article};
    const unitSellingAmount = modifiedArticle?.unitSellingAmount;
    const unitAmount = item?.unitAmount;
    const isPreDefinedArticle =
      modifiedArticle?.id && modifiedArticle?.id?.length > 8;
    if (!isPreDefinedArticle) {
      delete modifiedArticle?.id;
    }

    const articleToSend = {
      ...(isPreDefinedArticle && {id: modifiedArticle?.id}),
      name: article?.name,
      type: article?.type,
      unit: article?.unit,
      costPackage: article?.costPackage,
      ...(isPreDefinedArticle &&
        article?.externalId && {externalId: article?.externalId}),
      unitSellingAmount: {
        netAmount: unitSellingAmount?.netAmount,
        percentageVat: unitSellingAmount?.percentageVat,
        currency: unitSellingAmount?.currency,
      },
    } as ArticleRecord;

    return {
      ...rest,
      article: articleToSend,
      unitAmount: {
        netAmount: unitAmount?.netAmount,
        percentageVat: unitAmount?.percentageVat,
        currency: unitAmount?.currency,
      },
      discount: rest.discount
        ? {
            ...rest.discount,
            amount:
              rest.discount.type === 'AMOUNT'
                ? {
                    ...rest.discount.amount,
                    currency: rest.discount.amount?.currency!,
                    value:
                      (rest.discount.amount?.value ?? 0) *
                      10 ** (rest.discount.amount?.fractionDigits ?? 2),
                  }
                : undefined,
          }
        : undefined,
      payment: rest.payment
        ? rest.payment
        : value.payment?.type === PaymentType.PER_ITEM
        ? {type: InvoiceItemPaymentType.PERCENTAGE, percentage: 0}
        : undefined,
    };
  }),
  paymentTerms: value.paymentTerms,
  propertyOwnerId: value.propertyOwnerId,
  serviceCompanyId: value.serviceCompanyId,
  serviceOrderId: value.serviceOrderId,
  paymentInfo: value.paymentInfo,
  shouldSendOut: value.shouldSendOut,
  includeWorkReport: value.includeWorkReport,
  includeCheckList: value.includeCheckList,
  costCenter: value.costCenter,
  customerSpecificOrderNumber: value.customerSpecificOrderNumber,
  moreInfo: value.moreInfo,
  billingAddress: value.billingAddress,
  beneficiaryAddress: value.beneficiaryAddress,
  alternativeAddress: value.alternativeAddress,
  externalId: value.externalId,
  laborMaterialCosts: value.laborMaterialCosts,
  laborMaterialCostText: value.laborMaterialCostText,
  deliveryStartDate: value.deliveryStartDate
    ? dateToString(value.deliveryStartDate)
    : '',
  deliveryEndDate: value.deliveryEndDate
    ? dateToString(value.deliveryEndDate)
    : '',
  ...(value.discount && {
    discount: {
      ...value.discount,
      amount:
        value.discount?.type === 'AMOUNT'
          ? {
              ...value.discount?.amount,
              currency: value.discount?.amount?.currency!,
              value:
                (value.discount?.amount?.value ?? 0) *
                10 ** (value.discount?.amount?.fractionDigits ?? 2),
            }
          : undefined,
    },
  }),
  ...(value.payment && {
    payment: {
      ...value.payment,
      amount:
        value.payment?.type === PaymentType.LUMP_SUM
          ? moneyRecordForBackend(value.payment.amount)
          : undefined,
    },
  }),
  showArticleSection: value.showArticleSection,
});

export const applyDiscount = ({
  actualValue,
  percentage,
  amount,
}: {
  actualValue: number;
  percentage?: number;
  amount?: number;
}) => {
  if (!percentage && !amount) {
    return actualValue;
  }

  const discountAmount =
    amount || (percentage ? (actualValue * percentage) / 100 : 0);
  const discountedPrice = actualValue - discountAmount;

  return fixRounding(discountedPrice, 2);
};

export const getAggregatedItemsVats = (items: InvoiceItemRecord[]) =>
  items.reduce((acc, item) => {
    const {percentageVat} = item.unitAmount;

    const vat =
      (item.unitAmount.netAmount /
        10 ** Currencies[item.unitAmount.currency]!) *
      (percentageVat / 100) *
      item.quantity;

    const foundPercentageVat = acc.find(
      (i) => i.percentageVat === percentageVat,
    );

    if (foundPercentageVat) {
      foundPercentageVat.vat += vat;
    } else {
      acc.push({percentageVat, vat});
    }

    return acc;
  }, [] as {percentageVat: number; vat: number}[]);

export const applyPerItemDiscountOnItems = (arr: InvoiceItemRecord[]) =>
  arr.map((item) => {
    if (!item.discount) {
      return item;
    }

    return {
      ...item,
      unitAmount: {
        ...item.unitAmount,
        netAmount: applyDiscount({
          actualValue: item.unitAmount.netAmount,
          ...(item.discount?.type === DiscountType.AMOUNT
            ? {
                amount:
                  (item.discount?.amount?.value ?? 0) *
                    10 ** (item.discount?.amount?.fractionDigits ?? 2) ?? 0,
              }
            : {percentage: item.discount?.percentage ?? 0}),
        }),
      },
    };
  });

export const applyGlobalDiscountOnItems = (
  arr: InvoiceItemRecord[],
  globalDiscount?: Discount,
) => {
  if (!globalDiscount) {
    return arr;
  }

  if (globalDiscount.type === DiscountType.PERCENTAGE) {
    return arr.map((item) => ({
      ...item,
      unitAmount: {
        ...item.unitAmount,
        netAmount: applyDiscount({
          actualValue: item.unitAmount.netAmount,
          percentage: globalDiscount.percentage,
        }),
      },
    }));
  }

  const total = arr
    .map((item) => item.unitAmount.netAmount * item.quantity)
    .reduce((prevValue, currentValue) => prevValue + currentValue, 0);

  const globalDiscountAmount =
    (globalDiscount.amount?.value ?? 0) *
    10 ** (globalDiscount.amount?.fractionDigits ?? 2);

  return arr.map((item) => {
    const portion =
      item.unitAmount.netAmount === total
        ? 1
        : item.unitAmount.netAmount / total;
    const discount = globalDiscountAmount * portion;
    return {
      ...item,
      unitAmount: {
        ...item.unitAmount,
        netAmount: applyDiscount({
          actualValue: item.unitAmount.netAmount,
          amount: discount,
        }),
      },
    };
  });
};

export const getAggregatedPartialPaymentsVats = (
  items: InvoiceItemRecord[],
  totalAmountExclVat: number,
) => {
  const total = items
    .map((item) => item.unitAmount.netAmount * item.quantity)
    .reduce((prevValue, currentValue) => prevValue + currentValue, 0);

  return items.reduce((acc, item) => {
    const {percentageVat} = item.unitAmount;
    const totalNetAmount = item.unitAmount.netAmount * item.quantity;
    const portion = totalNetAmount === total ? 1 : totalNetAmount / total;
    const vat = totalAmountExclVat * (percentageVat / 100) * portion;

    const foundPercentageVat = acc.find(
      (i) => i.percentageVat === percentageVat,
    );

    if (foundPercentageVat) {
      foundPercentageVat.vat += vat;
    } else {
      acc.push({percentageVat, vat});
    }

    return acc;
  }, [] as {percentageVat: number; vat: number}[]);
};

export const articleViewToInvoiceItemRecord = (
  article: ArticleView,
): InvoiceItemRecord => {
  const record: InvoiceItemRecord = {
    article,
    name: article.name,
    description: article.description,
    quantity: 1,
    unitAmount: article.unitSellingAmount,
  };
  return getItemRecord(record, record.unitAmount.percentageVat);
};

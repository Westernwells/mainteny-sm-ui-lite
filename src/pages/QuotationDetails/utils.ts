import BigNumber from 'bignumber.js';
import {ArticleView} from 'models/article';
import {DiscountType, Discount, ArticleRecord} from 'models/invoice';
import {
  CreateQuotation,
  QuotationFormData,
  QuotationItemRecord,
  UpdateQuotation,
} from 'models/quotation';
import {Currencies} from 'utils/currency';
import {dateToString} from 'utils/utils';

export const formatQuotationRecord = (
  value: QuotationFormData,
): UpdateQuotation | CreateQuotation => ({
  ...value,
  subject: value.subject,
  description: value.description,
  items: value.items.map((item) => {
    const {article, ...rest} = item;
    const modifiedArticle: ArticleView | ArticleRecord = {...article};
    const {id, ...articleWithoutId} = modifiedArticle;
    const unitSellingAmount = modifiedArticle?.unitSellingAmount;

    const isPreDefinedArticle =
      modifiedArticle.id && modifiedArticle.id.length > 8;

    const articleToSend = {
      ...(!isPreDefinedArticle ? articleWithoutId : {id}),
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
    };
  }),
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
  serviceCompanyId: value.serviceCompanyId,
  paymentTerms: value.paymentTerms,
  moreInfo: value.moreInfo,
  billingAddress: value.billingAddress,
  beneficiaryAddress: value.beneficiaryAddress,
  alternativeAddress: value.alternativeAddress,
  externalId: value.externalId,
  notes: value.notes,
  sentDate: value.sentDate ? dateToString(value.sentDate) : '',
  expiryDate: value.expiryDate ? dateToString(value.expiryDate) : '',
  elevatorId: value.elevatorId ?? null,
});

export const applyQuotationDiscount = ({
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

  return discountedPrice;
};

export const getQuotationAggregatedItemsVats = (items: QuotationItemRecord[]) =>
  items.reduce((acc, item) => {
    const {percentageVat} = item.unitAmount;

    const vat =
      ((item.unitAmount.netAmount ?? 0) /
        10 ** Currencies[item.unitAmount.currency]) *
      ((percentageVat ?? 0) / 100) *
      item.quantity;

    const foundPercentageVat = acc.find(
      (i) => i.percentageVat === percentageVat,
    );

    if (foundPercentageVat) {
      foundPercentageVat.vat += vat;
    } else {
      acc.push({percentageVat: percentageVat ?? 0, vat});
    }

    return acc;
  }, [] as {percentageVat: number; vat: number}[]);

export const applyPerItemDiscountOnQuotationItems = (
  arr: QuotationItemRecord[],
) =>
  arr.map((item) => {
    if (!item.discount) {
      return item;
    }

    return {
      ...item,
      unitAmount: {
        ...item.unitAmount,
        netAmount: applyQuotationDiscount({
          actualValue: item.unitAmount.netAmount ?? 0,
          ...(item.discount?.type === DiscountType.AMOUNT
            ? {
                amount:
                  (item.discount?.amount?.value ?? 0) *
                    10 ** (item.discount?.amount?.fractionDigits ?? 2) || 0,
              }
            : {percentage: item.discount?.percentage ?? 0}),
        }),
      },
    };
  });

export const applyGlobalDiscountOnQuotationItems = (
  arr: QuotationItemRecord[],
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
        netAmount: applyQuotationDiscount({
          actualValue: item.unitAmount.netAmount ?? 0,
          percentage: globalDiscount.percentage,
        }),
      },
    }));
  }

  const total = arr
    .map((item) => (item.unitAmount.netAmount ?? 0) * item.quantity)
    .reduce((prevValue, currentValue) => prevValue + currentValue, 0);

  const globalDiscountAmount =
    (globalDiscount.amount?.value ?? 0) *
    10 ** (globalDiscount.amount?.fractionDigits ?? 2);

  return arr.map((item) => {
    const portion =
      item.unitAmount.netAmount === total
        ? 1.0
        : new BigNumber(item.unitAmount.netAmount ?? 0)
            .dividedBy(total)
            .toNumber();
    const discount = new BigNumber(globalDiscountAmount).times(portion);
    const netAfterGlobalDiscount = new BigNumber(
      item.unitAmount.netAmount ?? 0,
    ).minus(discount);
    return {
      ...item,
      unitAmount: {
        ...item.unitAmount,
        netAmount: netAfterGlobalDiscount.toNumber(),
      },
    };
  });
};

export const calculateQuotationTotalAmountInclVats = ({
  subtotalExclVatAfterDiscount,
  percentageVats,
}: {
  subtotalExclVatAfterDiscount: number;
  percentageVats: {percentageVat: number; vat: number}[];
}) => {
  let totalAmountInclVats = subtotalExclVatAfterDiscount;

  percentageVats.forEach((v) => {
    totalAmountInclVats += v.vat;
  });

  return totalAmountInclVats;
};

export const getDiscoutObj = (discount?: Discount, isGlobalDiscount = false) =>
  discount
    ? {
        ...discount,
        ...(!isGlobalDiscount && {
          // per item or article discount can be either percentage or amount
          // but global discount can be either percentage or amount or none
          // so we should not set type manually to percentage if we are creating discount object for global discount
          type:
            discount?.type === DiscountType.NONE ||
            discount.type === DiscountType.PERCENTAGE
              ? DiscountType.PERCENTAGE
              : discount?.type,
        }),
        amount: discount?.amount
          ? {
              ...discount?.amount,
              value:
                (discount?.amount?.value ?? 0) /
                10 ** (discount.amount.fractionDigits ?? 2),
            }
          : undefined,
        percentage:
          discount?.type === DiscountType.NONE ||
          discount.type === DiscountType.PERCENTAGE
            ? discount?.percentage || 0
            : undefined,
      }
    : undefined;

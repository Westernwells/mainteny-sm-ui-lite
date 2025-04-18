import BigNumber from 'bignumber.js';
import {ArticleType} from 'models/article';
import {DiscountType, Discount} from 'models/invoice';
import {Currency} from 'models/misc';
import {
  ArticleInfoRecord,
  CreateQuotationRecord,
  EditableQuotationItem,
  QuotationFormData,
  QuotationItemRecord,
  UpdateQuotation,
} from 'models/quotation';
import {VatView} from 'models/vat';
import {Currencies} from 'utils/currency';
import {dateToString} from 'utils/utils';

export const formatQuotationItems = (
  items: EditableQuotationItem[],
): QuotationItemRecord[] =>
  items.map((item) => {
    const {article, ...rest} = item;

    const formattedArticle: ArticleInfoRecord = {
      id: article?.id && article.id.length < 8 ? undefined : article?.id,
      name: article?.name || '',
      externalId: article?.externalId || '',
      type: article?.type || ArticleType.OTHER,
      unit: article?.unit || '',
      unitPurchaseAmount: article?.unitPurchaseAmount || undefined,
      unitSellingAmount: article?.unitSellingAmount || undefined,
      costPackage: article?.costPackage || undefined,
    };

    const subItems =
      rest?.subItems?.map((subItem) => ({
        article: {
          id: subItem?.article?.id || undefined,
          name: subItem?.article?.name || '',
          externalId: subItem?.article?.externalId || '',
          type: (subItem?.article?.type as ArticleType) || '',
          unit: subItem?.article?.unit || '',
          unitPurchaseAmount: subItem?.article?.unitPurchaseAmount || undefined,
          unitSellingAmount: subItem?.article?.unitSellingAmount || undefined,
          costPackage: subItem?.article?.costPackage || undefined,
        },
        name: subItem?.name,
        unitPurchaseAmount: subItem?.unitPurchaseAmount || undefined,
        unitAmount: subItem?.unitAmount || undefined,
        quantity:
          typeof subItem?.quantity === 'string'
            ? parseFloat(subItem?.quantity)
            : subItem?.quantity ?? 0,
        description: subItem?.description || '',
        userSeqNumber: subItem.userSeqNumber || '',
      })) || [];

    const subItemsConfig = {
      priceVisible: rest.subItemsConfig?.priceVisible || false,
      subItemsVisible: rest.subItemsConfig?.subItemsVisible || false,
    };

    const isPreDefinedArticle =
      formattedArticle.id && formattedArticle.id.length > 8;

    const articleToSend: ArticleInfoRecord = isPreDefinedArticle
      ? {
          id: formattedArticle.id,
          externalId: formattedArticle.externalId,
          name: formattedArticle.name,
          type: formattedArticle.type,
          unit: formattedArticle.unit,
          costPackage: formattedArticle.costPackage,
          unitSellingAmount: formattedArticle.unitSellingAmount,
          unitPurchaseAmount: formattedArticle.unitPurchaseAmount,
        }
      : {
          name: formattedArticle.name,
          type: formattedArticle.type,
          unit: formattedArticle.unit,
          costPackage: formattedArticle.costPackage,
          unitSellingAmount: formattedArticle.unitSellingAmount,
          unitPurchaseAmount: formattedArticle.unitPurchaseAmount,
        };

    return {
      ...rest,
      id: undefined,
      article: articleToSend,
      name: rest.name || '',
      unitPurchaseAmount: rest.unitPurchaseAmount || undefined,
      unitAmount: rest.unitAmount || undefined,
      quantity: rest.quantity || 0,
      description: rest.description || '',
      userSeqNumber: rest.userSeqNumber || '',
      subItems,
      subItemsConfig,
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
  });

export const formatQuotationRecord = (
  value: QuotationFormData,
  currentCurrency: Currency,
  taxRates?: VatView[],
): CreateQuotationRecord | UpdateQuotation => ({
  ...value,
  subject: value?.subject || '',
  description: value?.description || '',
  sentDate: value.sentDate ? dateToString(value.sentDate) : '',
  expiryDate: value.expiryDate ? dateToString(value.expiryDate) : '',
  items: value.items.map((item, index) => {
    const {
      article,
      unitAmount,
      discount,
      subItems,
      subItemsConfig,
      unitPurchaseAmount,
      ...rest
    } = item;
    const vatRate = taxRates?.find(
      (r) =>
        r.id === unitAmount?.vatId ||
        r.percentage === unitAmount?.percentageVat,
    );

    const formattedUnitAmount = {
      netAmount: unitAmount?.netAmount ?? 0,
      percentageVat: unitAmount?.percentageVat ?? vatRate?.percentage ?? 0,
      currency: unitAmount?.currency ?? currentCurrency.code,
      vatId: unitAmount?.vatId || vatRate?.id || '',
      vatName: unitAmount?.vatName || vatRate?.name || '',
    };

    const formattedDiscount = discount
      ? {
          ...discount,
          type:
            discount.type === DiscountType.NONE
              ? DiscountType.PERCENTAGE
              : discount.type,
          amount:
            discount.type === DiscountType.AMOUNT && discount.amount
              ? {
                  ...discount.amount,
                  currency: discount.amount.currency,
                  value:
                    (discount.amount.value ?? 0) *
                    10 ** (discount.amount.fractionDigits ?? 2),
                }
              : undefined,
          percentage:
            discount.type === DiscountType.PERCENTAGE ||
            discount.type === DiscountType.NONE
              ? discount.percentage ?? 0
              : undefined,
        }
      : undefined;

    const formattedArticle: ArticleInfoRecord = {
      ...(article?.id && article.id.length > 8 ? {id: article.id} : {}),
      name: article?.name,
      externalId: article?.externalId,
      type: article?.type,
      unit: article?.unit,
      costPackage: article?.costPackage,
      unitSellingAmount: {
        netAmount: article?.unitSellingAmount?.netAmount ?? 0,
        percentageVat: article?.unitSellingAmount?.percentageVat ?? 0,
        currency: article?.unitSellingAmount?.currency ?? currentCurrency.code,
        vatId: article?.unitSellingAmount?.vatId || '',
        vatName: article?.unitSellingAmount?.vatName || '',
      },
      ...(article?.unitPurchaseAmount && {
        unitPurchaseAmount: {
          netAmount: article.unitPurchaseAmount.netAmount ?? 0,
          percentageVat: article.unitPurchaseAmount.percentageVat ?? 0,
          vatId: article.unitPurchaseAmount.vatId || '',
          vatName: article.unitPurchaseAmount.vatName || '',
          currency: article.unitPurchaseAmount.currency ?? currentCurrency.code,
        },
      }),
    };

    const baseItem = {
      ...rest,
      id: undefined,
      userSeqNumber: rest.userSeqNumber ?? `${index + 1}`,
      article: formattedArticle,
      unitAmount: formattedUnitAmount,
      unitPurchaseAmount: {
        ...unitPurchaseAmount,
        vatId: formattedUnitAmount.vatId,
        vatName: formattedUnitAmount.vatName,
        percentageVat: formattedUnitAmount.percentageVat,
        currency: formattedUnitAmount.currency,
      },
      discount: formattedDiscount,
    };

    if (article?.type === ArticleType.MIX && subItems?.length) {
      return {
        ...baseItem,
        subItems: subItems.map((sub) => {
          const formattedSubUnitAmount = {
            netAmount: sub.unitAmount?.netAmount ?? 0,
            percentageVat:
              sub.unitAmount?.percentageVat ?? vatRate?.percentage ?? 0,
            currency: sub.unitAmount?.currency,
            vatId: sub.unitAmount?.vatId,
            vatName: sub.unitAmount?.vatName,
          };

          const formattedSubPurchaseAmount = {
            netAmount: sub.unitPurchaseAmount?.netAmount ?? 0,
            percentageVat: sub.unitPurchaseAmount?.percentageVat ?? 0,
            currency:
              sub.unitPurchaseAmount?.currency ?? sub.unitAmount?.currency,
            vatId: sub.unitPurchaseAmount?.vatId || sub.unitAmount?.vatId,
            vatName: sub.unitPurchaseAmount?.vatName || sub.unitAmount?.vatName,
          };

          return {
            ...(sub.id && sub.id.length > 8 ? {id: sub.id} : undefined),
            name: sub.name,
            quantity: sub.quantity,
            unitAmount: formattedSubUnitAmount,
            unitPurchaseAmount: formattedSubPurchaseAmount,
            description: sub.description,
            userSeqNumber: sub.userSeqNumber,
            article: sub.article
              ? {
                  ...(sub.article.id && sub.article.id.length > 8
                    ? {id: sub.article.id}
                    : undefined),
                  name: sub.article.name,
                  externalId: sub.article.externalId,
                  type: sub.article.type,
                  unit: sub.article.unit,
                  costPackage: sub.article.costPackage,
                  unitSellingAmount: {
                    netAmount: sub.article.unitSellingAmount?.netAmount ?? 0,
                    percentageVat:
                      sub.article.unitSellingAmount?.percentageVat ?? 0,
                    currency:
                      sub.article.unitSellingAmount?.currency ??
                      currentCurrency.code,
                    vatId: sub.article.unitSellingAmount?.vatId || '',
                    vatName: sub.article.unitSellingAmount?.vatName || '',
                  },
                  unitPurchaseAmount: {
                    netAmount: sub.article.unitPurchaseAmount?.netAmount ?? 0,
                    percentageVat:
                      sub.article.unitPurchaseAmount?.percentageVat ?? 0,
                    currency:
                      sub.article.unitPurchaseAmount?.currency ??
                      currentCurrency.code,
                    vatId: sub.article.unitPurchaseAmount?.vatId || '',
                    vatName: sub.article.unitPurchaseAmount?.vatName || '',
                  },
                }
              : undefined,
          };
        }),
        subItemsConfig,
      };
    }
    return baseItem;
  }),
  serviceCompanyId: value.serviceCompanyId,
  moreInfo: value.moreInfo,
  billingAddress: value.billingAddress,
  beneficiaryAddress: value.beneficiaryAddress,
  alternativeAddress: value.alternativeAddress,
  externalId: value?.externalId || '',
  notes: value.notes,
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
    const {percentageVat} = item.unitAmount!;

    const vat =
      ((item.unitAmount?.netAmount ?? 0) /
        10 ** Currencies[item.unitAmount!.currency]) *
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
          actualValue: item.unitAmount!.netAmount ?? 0,
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
          actualValue: item.unitAmount?.netAmount ?? 0,
          percentage: globalDiscount.percentage,
        }),
      },
    }));
  }

  const total = arr
    .map((item) => (item.unitAmount?.netAmount ?? 0) * item.quantity)
    .reduce((prevValue, currentValue) => prevValue + currentValue, 0);

  const globalDiscountAmount =
    (globalDiscount.amount?.value ?? 0) *
    10 ** (globalDiscount.amount?.fractionDigits ?? 2);

  return arr.map((item) => {
    const portion =
      item.unitAmount?.netAmount === total
        ? 1.0
        : new BigNumber(item.unitAmount?.netAmount ?? 0)
            .dividedBy(total)
            .toNumber();
    const discount = new BigNumber(globalDiscountAmount).times(portion);
    const netAfterGlobalDiscount = new BigNumber(
      item.unitAmount?.netAmount ?? 0,
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

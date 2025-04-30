import BigNumber from 'bignumber.js';
import {ArticleType, ArticleView} from 'models/article';
import {
  ArticleRecord,
  CreateInvoice,
  Discount,
  DiscountType,
  InvoiceFormData,
  InvoiceItemPaymentType,
  InvoiceItemRecord,
  InvoiceType,
  InvoiceView,
  PaymentType,
  UpdateInvoice,
  InvoiceSubItemRecord,
} from 'models/invoice';
import {Currency} from 'models/misc';
import {ArticleInfoRecord} from 'models/quotation';
import {VatView} from 'models/vat';
import {getItemRecord} from 'utils/article-utils';
import {
  Currencies,
  aggregatedAmountToMoney,
  moneyRecordForBackend,
  moneyRecordForLumpSum,
} from 'utils/currency';
import {invoiceItemToInvoiceItemRecord} from 'utils/invoice';
import {
  dateToString,
  fixRounding,
  removeUndefinedAndEmptyValues,
} from 'utils/utils';

export const formatInvoiceRecord = (
  value: InvoiceFormData,
  currentCurrency: Currency,
  taxRates?: VatView[],
): CreateInvoice | UpdateInvoice => ({
  ...value,
  subject: value.subject,
  description: value.description,
  dueDate: value.dueDate ? dateToString(value.dueDate) : '',
  sentDate: value.sentDate ? dateToString(value.sentDate) : '',
  type: value.type,
  items: value.items.map((item, index) => {
    const {
      article,
      unitAmount,
      discount,
      payment,
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
          currency:
            article.unitPurchaseAmount.currency ?? currentCurrency.code!,
        },
      }),
    };

    const baseItem = {
      ...rest,
      id: undefined,
      margin: undefined,
      userSeqNumber: rest.userSeqNumber ?? `${index + 1}`,
      article: formattedArticle,
      unitAmount: formattedUnitAmount,
      unitPurchaseAmount: {
        ...unitPurchaseAmount,
        vatId: formattedUnitAmount.vatId,
        vatName: formattedUnitAmount.vatName,
        percentageVat: formattedUnitAmount.percentageVat,
        currency: formattedUnitAmount.currency || currentCurrency.code,
      },
      discount: formattedDiscount,
      payment:
        payment ??
        (value.payment?.type === PaymentType.PER_ITEM
          ? {type: InvoiceItemPaymentType.PERCENTAGE, percentage: 0}
          : undefined),
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

  paymentTerm: value.paymentTerm,
  propertyOwnerId: value.propertyOwnerId,
  serviceCompanyId: value.serviceCompanyId,
  serviceOrderId: value.serviceOrderId || null,
  paymentInfo: value.paymentInfo,
  shouldSendOut: value.shouldSendOut,
  includeWorkReport: value.includeWorkReport,
  includeCheckList: value.includeCheckList,
  costCenter: value.costCenter,
  purchaseOrderNumber: value.purchaseOrderNumber,
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
        value.discount?.type === DiscountType.AMOUNT
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
  elevatorExternalId: value.elevatorExternalId,
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
    const percentageVat = item.unitAmount.percentageVat ?? 0;

    const vat = new BigNumber(item.unitAmount.netAmount ?? 0)
      .dividedBy(new BigNumber(10).pow(Currencies[item.unitAmount.currency]!))
      .multipliedBy(new BigNumber(percentageVat ?? 0).dividedBy(100))
      .multipliedBy(item.quantity)
      .decimalPlaces(2);

    const foundPercentageVat = acc.find(
      (i) => i.percentageVat === percentageVat,
    );

    if (foundPercentageVat) {
      foundPercentageVat.vat = new BigNumber(foundPercentageVat.vat)
        .plus(vat)
        .toNumber();
    } else {
      acc.push({percentageVat: percentageVat ?? 0, vat: vat.toNumber()});
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
          actualValue: item.unitAmount.netAmount ?? 0,
          ...(item.discount?.type === DiscountType.AMOUNT
            ? {
                amount:
                  (item.discount?.amount?.value ?? 0) *
                  10 ** (item.discount?.amount?.fractionDigits ?? 2),
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

const getDiscountedAmount = (item: InvoiceItemRecord) => {
  const baseAmount = (item.unitAmount.netAmount ?? 0) * item.quantity;
  const {discount} = item;
  const discountParams =
    discount?.type === DiscountType.AMOUNT
      ? {amount: discount.amount?.value ?? 0}
      : {percentage: discount?.percentage ?? 0};
  return applyDiscount({actualValue: baseAmount, ...discountParams});
};

export const getAggregatedPartialPaymentsVats = (
  items: InvoiceItemRecord[],
  totalAmountExclVat: number,
) => {
  const total = items.reduce((sum, item) => sum + getDiscountedAmount(item), 0);

  return items.reduce((acc, item) => {
    const {percentageVat} = item.unitAmount;
    const discountedAmount = getDiscountedAmount(item);
    const portion = discountedAmount === total ? 1 : discountedAmount / total;
    const vat = totalAmountExclVat * ((percentageVat ?? 0) / 100) * portion;

    const existing = acc.find((i) => i.percentageVat === percentageVat);
    if (existing) {
      existing.vat += vat;
      return acc;
    }
    return [...acc, {percentageVat: percentageVat ?? 0, vat}];
  }, [] as {percentageVat: number; vat: number}[]);
};

export const articleViewToInvoiceItemRecord = (
  article: ArticleView,
  unitAmountAddtionalValues?: {
    percentageVat: number;
    vatId: string;
    vatName: string;
  },
): InvoiceItemRecord => {
  const record: InvoiceItemRecord = {
    id: article.id,
    article,
    name: article.name,
    description: article.description,
    quantity: 1,
    unitAmount: {
      ...article.unitSellingAmount,
      ...unitAmountAddtionalValues,
    },
  };
  return getItemRecord(record, record.unitAmount.percentageVat ?? 0);
};

export const formatInvoiceViewToUpdateInvoice = (
  invoiceView: InvoiceView,
  currentCurrency: Currency,
  taxRates?: VatView[],
  subItemsMap: Record<string, InvoiceSubItemRecord[]> = {},
): UpdateInvoice => {
  const {
    externalId,
    description,
    subject,
    sentDate,
    dueDate,
    serviceOrder,
    propertyOwner,
    additionalInfo,
    items,
    serviceCompany,
    type,
  } = invoiceView;

  const {payment, discount, elevatorExternalId} = additionalInfo || {};

  const updateInvoice: Record<string, any> = {
    serviceOrderId: serviceOrder?.id,
    propertyOwnerId: propertyOwner?.id,
    externalId,
    type,
    subject,
    description,
    dueDate,
    sentDate,
    items: items
      .map((item) =>
        invoiceItemToInvoiceItemRecord(
          item,
          type,
          currentCurrency,
          taxRates,
          subItemsMap,
        ),
      )
      .map((item) => {
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
            : payment?.type === PaymentType.PER_ITEM
            ? {type: InvoiceItemPaymentType.PERCENTAGE, percentage: 0}
            : undefined,
        };
      }),
    ...(discount && {
      discount: {
        ...discount,
        amount:
          discount?.type === 'AMOUNT'
            ? {
                ...discount?.amount,
                currency: discount?.amount?.currency!,
                value: discount?.amount?.value ?? 0,
              }
            : undefined,
      },
    }),
    ...(payment && {
      payment: {
        ...payment,
        amount:
          payment?.type === PaymentType.LUMP_SUM
            ? moneyRecordForLumpSum(aggregatedAmountToMoney(payment?.amount))
            : undefined,
      },
    }),
    paymentTerm: additionalInfo?.paymentTerm,
    paymentInfo: additionalInfo?.paymentInfo,
    includeWorkReport: additionalInfo?.includeWorkReport,
    includeCheckList: additionalInfo?.includeCheckList,
    costCenter: additionalInfo?.costCenter,
    purchaseOrderNumber: additionalInfo?.purchaseOrderNumber,
    moreInfo: additionalInfo?.moreInfo,
    billingAddress: additionalInfo?.billingAddress,
    beneficiaryAddress: additionalInfo?.beneficiaryAddress,
    alternativeAddress: additionalInfo?.alternativeAddress,
    laborMaterialCostText: additionalInfo?.laborMaterialCostText,
    deliveryStartDate: additionalInfo?.deliveryStartDate,
    deliveryEndDate: additionalInfo?.deliveryEndDate,
    showArticleSection: additionalInfo?.showArticleSection,
    alternativeServiceCompanyInfo: additionalInfo.alternativeServiceCompanyInfo,
    serviceCompanyId: serviceCompany.id,
    elevatorExternalId,
  };

  return removeUndefinedAndEmptyValues(updateInvoice) as UpdateInvoice;
};

export const stripHtmlTags = (html: string): string => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;

  function getText(node: Node): string {
    let text = '';
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent || '';
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const {childNodes} = node;
      for (let i = 0; i < childNodes.length; i += 1) {
        const childText = getText(childNodes[i]);
        if (childText.length > 0) {
          text += `${childText} `;
        }
      }
    }
    return text.trim(); // Trim leading and trailing spaces
  }

  const textContent = getText(tmp);

  // Replace consecutive spaces with a single space
  return textContent.replace(/\s+/g, ' ').trim();
};

export const correctCreditNoteInvoicesPercentages = (
  invoices: InvoiceView[],
): InvoiceView[] =>
  invoices.map((i) => {
    if (i.type === InvoiceType.CREDIT_NOTE) {
      // Find the referenced invoice
      const refInvoice = invoices?.find(
        (j) => i.additionalInfo.refInvoiceId === j.id,
      );

      if (!refInvoice) {
        return i;
      }

      const originalAmount = refInvoice.totalAmount.netAmount || 0;
      const creditAmount = Math.abs(i.totalAmount.netAmount || 0);

      // Calculate the proportion of the credit note relative to the original invoice
      const proportion = originalAmount > 0 ? creditAmount / originalAmount : 0;

      // Negate the proportion of the original payment percentage
      const originalPaymentPercentage =
        refInvoice.additionalInfo?.payment?.percentage || 0;
      const negatedPercentage = -(originalPaymentPercentage * proportion);

      return {
        ...i,
        additionalInfo: {
          ...i.additionalInfo,
          payment: {
            ...(i.additionalInfo?.payment || {}),
            type: i.additionalInfo?.payment?.type || PaymentType.NONE,
            percentage: negatedPercentage,
          },
        },
      };
    }
    return i;
  });

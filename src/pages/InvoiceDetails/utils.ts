import BigNumber from 'bignumber.js';
import {ArticleView} from 'models/article';
import {
  ArticleRecord,
  CreateInvoice,
  Discount,
  DiscountType,
  InvoiceFormData,
  InvoiceItem,
  InvoiceItemPaymentType,
  InvoiceItemRecord,
  InvoiceType,
  InvoiceView,
  PaymentType,
  UpdateInvoice,
} from 'models/invoice';
import {getItemRecord} from 'utils/article-utils';
import {
  Currencies,
  aggregatedAmountToMoney,
  moneyRecordForBackend,
  moneyRecordForLumpSum,
} from 'utils/currency';
import {
  dateToString,
  fixRounding,
  removeUndefinedAndEmptyValues,
} from 'utils/utils';

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
      discount: rest.discount
        ? {
            ...rest.discount,
            type:
              rest.discount?.type === DiscountType.NONE ||
              rest.discount.type === DiscountType.PERCENTAGE
                ? DiscountType.PERCENTAGE
                : rest.discount?.type,
            amount:
              rest.discount.type === DiscountType.AMOUNT && rest.discount.amount
                ? {
                    ...rest.discount.amount,
                    currency: rest.discount.amount?.currency!,
                    value:
                      (rest.discount.amount?.value ?? 0) *
                      10 ** (rest.discount.amount?.fractionDigits ?? 2),
                  }
                : undefined,
            percentage:
              rest.discount.type === DiscountType.NONE ||
              rest.discount.type === DiscountType.PERCENTAGE
                ? rest.discount.percentage || 0
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
    const {percentageVat} = item.unitAmount;

    const vat = new BigNumber(item.unitAmount.netAmount)
      .dividedBy(new BigNumber(10).pow(Currencies[item.unitAmount.currency]!))
      .multipliedBy(new BigNumber(percentageVat).dividedBy(100))
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
      acc.push({percentageVat, vat: vat.toNumber()});
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
        ? 1.0
        : new BigNumber(item.unitAmount.netAmount).dividedBy(total).toNumber();
    const discount = new BigNumber(globalDiscountAmount).times(portion);
    const netAfterGlobalDiscount = new BigNumber(
      item.unitAmount.netAmount,
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
  const baseAmount = item.unitAmount.netAmount * item.quantity;
  const discount = item.additionalInfo?.discount || item.discount;
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
    const vat = totalAmountExclVat * (percentageVat / 100) * portion;

    const existing = acc.find((i) => i.percentageVat === percentageVat);
    if (existing) {
      existing.vat += vat;
      return acc;
    }
    return [...acc, {percentageVat, vat}];
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

export const invoiceItemToInvoiceItemRecord = (
  invoiceItem: InvoiceItem,
  invoiceType: InvoiceType,
): InvoiceItemRecord => {
  const record: InvoiceItemRecord = {
    article: invoiceItem.article,
    name: invoiceItem.name,
    description: invoiceItem.description,
    quantity: invoiceItem.quantity,
    unitAmount:
      invoiceType === InvoiceType.CREDIT_NOTE
        ? {
            ...invoiceItem.unitAmount,
            grossAmount: -Math.abs(invoiceItem.unitAmount.grossAmount),
            netAmount: -Math.abs(invoiceItem.unitAmount.netAmount),
          }
        : invoiceItem.unitAmount,
    discount: invoiceItem.additionalInfo?.discount
      ? {
          ...invoiceItem.additionalInfo?.discount,
          type:
            invoiceItem.additionalInfo?.discount?.type === DiscountType.NONE
              ? DiscountType.PERCENTAGE
              : invoiceItem.additionalInfo?.discount?.type,
          amount: invoiceItem.additionalInfo?.discount?.amount
            ? {
                ...invoiceItem.additionalInfo?.discount?.amount,
                value:
                  (invoiceItem.additionalInfo?.discount?.amount?.value ?? 0) /
                  10 **
                    (invoiceItem.additionalInfo.discount.amount
                      .fractionDigits ?? 2),
              }
            : undefined,
        }
      : undefined,
    payment: invoiceItem.additionalInfo?.payment,
  };
  return getItemRecord(record, record.unitAmount.percentageVat);
};

export const formatInvoiceViewToUpdateInvoice = (
  invoiceView: InvoiceView,
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
      .map((item) => invoiceItemToInvoiceItemRecord(item, type))
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

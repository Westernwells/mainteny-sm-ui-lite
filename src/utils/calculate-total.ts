import {applyDiscount} from 'pages/InvoiceDetails/utils';
import {ArticleType} from 'models/article';
import {
  DiscountType,
  InvoiceFormData,
  InvoiceItemRecord,
  InvoiceView,
} from 'models/invoice';
import {Amount} from 'models/misc';
import {ServiceOrderArticleView} from 'models/service-order';

export const calculateTotal = (arr: InvoiceItemRecord<Amount>[]) => {
  const sum = 0;

  return arr
    .map(
      (item) =>
        item.quantity *
        (item.unitAmount.netAmount / 10 ** item.unitAmount.fractionDigits!),
    )
    .reduce((prevValue, currentValue) => prevValue + currentValue, sum);
};

export const calculateTotalWithPerItemDiscount = (invoice: InvoiceFormData) => {
  const sum = invoice.items
    .map((item: InvoiceItemRecord<Amount>) =>
      applyDiscount({
        actualValue:
          (item.unitAmount.netAmount / 10 ** item.unitAmount.fractionDigits!) *
          item.quantity,
        ...(item.discount?.type === DiscountType.AMOUNT
          ? {amount: item.discount?.amount?.value ?? 0}
          : {percentage: item.discount?.percentage ?? 0}),
      }),
    )
    .reduce((prevValue, currentValue) => prevValue + currentValue, 0);

  return sum;
};

export const calculateTotalAmountInclVats = ({
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

export const calculateCostPackage = (arr: InvoiceItemRecord<Amount>[]) => {
  let laborCost = 0;
  let materialCost = 0;

  arr.forEach((item) => {
    if (item.article?.type !== ArticleType.PACKAGE) {
      const cost =
        (item.quantity * (item.unitAmount?.netAmount ?? 0)) /
        10 ** (item.unitAmount?.fractionDigits ?? 0);
      if (item.article?.type === ArticleType.LABOR) {
        laborCost += cost;
      } else {
        materialCost += cost;
      }
    } else {
      laborCost +=
        (item.quantity * (item.article?.costPackage?.labor?.value ?? 0)) /
        10 ** (item.article?.costPackage?.labor?.fractionDigits ?? 0);
      materialCost +=
        (item.quantity * (item.article?.costPackage?.material?.value ?? 0)) /
        10 ** (item.article?.costPackage?.material?.fractionDigits ?? 0);
    }
  });

  return {
    laborCost,
    materialCost,
  };
};

export const calculateInvoiceTotal = (arr: InvoiceView[]) => {
  const sum = 0;

  return arr
    .map(
      (item) =>
        (item.totalAmount?.netAmount ?? 0) /
        10 ** item.totalAmount.fractionDigits!,
    )
    .reduce((prevValue, currentValue) => prevValue + currentValue, sum);
};

export const calculateGrossInvoiceTotal = (arr: InvoiceView[]) => {
  const sum = 0;

  return arr
    ?.map(
      (item) =>
        (item.totalAmount?.grossAmount ?? 0) /
        10 ** item.totalAmount.fractionDigits!,
    )
    .reduce((prevValue, currentValue) => prevValue + currentValue, sum);
};

export const calculateOrderArticlesTotal = (arr: ServiceOrderArticleView[]) => {
  const sum = 0;

  return arr
    ?.map(
      (item) =>
        (item.unitAmount.netAmount * item.quantity) /
        10 ** item.unitAmount.fractionDigits!,
    )
    .reduce((prevValue, currentValue) => prevValue + currentValue, sum);
};

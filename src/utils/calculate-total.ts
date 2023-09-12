import {ArticleType} from 'models/article';
import {InvoiceItemRecord} from 'models/invoice';
import {Amount} from 'models/misc';

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

export const calculateCostPackage = (arr: InvoiceItemRecord<Amount>[]) => {
  let laborCost = 0;
  let materialCost = 0;

  arr.forEach((item) => {
    if (item.type !== ArticleType.PACKAGE) {
      const cost =
        (item.quantity * (item.unitAmount?.netAmount ?? 0)) /
        10 ** (item.unitAmount?.fractionDigits ?? 0);
      if (item.type === ArticleType.LABOR) {
        laborCost += cost;
      } else {
        materialCost += cost;
      }
    } else {
      laborCost +=
        (item.quantity * (item.costPackage?.labor?.value ?? 0)) /
        10 ** (item.costPackage?.labor?.fractionDigits ?? 0);
      materialCost +=
        (item.quantity * (item.costPackage?.material?.value ?? 0)) /
        10 ** (item.costPackage?.material?.fractionDigits ?? 0);
    }
  });

  return {
    laborCost,
    materialCost,
  };
};

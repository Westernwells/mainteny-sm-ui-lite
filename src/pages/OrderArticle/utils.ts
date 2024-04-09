import {ArticleOrderItemView, ArticleOrderItemRecord} from 'models/article';
import {Currencies} from 'utils/currency';

export const convertToArticleOrderItemRecord = (
  items: ArticleOrderItemView[],
): ArticleOrderItemRecord[] =>
  items.map((item) => ({
    articleId: item.article.id,
    articleName: item.articleName,
    supplierArticleNumber: item.supplierArticleNumber,
    quantity: item.quantity,
    unit: item.unit,
    description: item.description,
    unitSellingAmount: item.article.unitSellingAmount,
  }));

export const calculateTotal = (
  arr: ArticleOrderItemRecord[],
  currencyCode?: string,
) => {
  const sum = 0;

  return arr
    .map(
      (arrayItem) =>
        arrayItem.quantity *
        (arrayItem.unitSellingAmount.netAmount /
          10 ** Currencies[arrayItem.unitSellingAmount.currency] ??
          currencyCode),
    )
    .reduce((prevValue, currentValue) => prevValue + currentValue, sum);
};

export const calculateTotalVAT = (items: any[]) => {
  const vatMap = new Map();
  items.forEach((item) => {
    const {percentageVat, netAmount, fractionDigits} = item.unitSellingAmount;
    const vat =
      ((percentageVat / 100) * (netAmount * item.quantity)) /
      10 ** (fractionDigits || 0);
    if (vatMap.has(percentageVat)) {
      vatMap.set(percentageVat, vatMap.get(percentageVat) + vat);
    } else {
      vatMap.set(percentageVat, vat);
    }
  });
  return vatMap;
};

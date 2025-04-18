import {ArticleType} from 'models/article';
import {InvoiceItemRecord} from 'models/invoice';
import {Currency} from 'models/misc';
import {useMemo} from 'react';
import {centsToMoney} from 'utils/currency';

type CostPackageKey = 'labor' | 'material';

const getPackageAmount = (
  item: InvoiceItemRecord,
  packageKey: CostPackageKey,
  netAmount: number,
  currencyCode: string,
): number => {
  const percentageKey =
    packageKey === 'labor' ? 'laborPercentage' : 'materialPercentage';
  const packageValue =
    netAmount * (item.article?.costPackage?.[percentageKey] ?? 0);
  return centsToMoney(currencyCode, packageValue);
};

const getNetAmount = (item: InvoiceItemRecord, currencyCode: string): number =>
  centsToMoney(currencyCode, item?.payment?.amount?.netAmount ?? 0);

export const calculateLaborMaterialCost = (
  articleItems: InvoiceItemRecord[],
  articleType: ArticleType,
  currencyCode: string,
): number =>
  articleItems?.reduce((itemTotal, item) => {
    if (item.article?.type === articleType) {
      return itemTotal + getNetAmount(item, currencyCode);
    }

    if (item.article?.type === ArticleType.PACKAGE) {
      const packageKey: CostPackageKey =
        articleType.toLowerCase() as CostPackageKey;
      const netAmount = getNetAmount(item, currencyCode);
      return (
        itemTotal + getPackageAmount(item, packageKey, netAmount, currencyCode)
      );
    }

    return itemTotal;
  }, 0);

const useCalculateLaborMaterialCost = (
  articleItems: InvoiceItemRecord[],
  articleType: ArticleType,
  currentCurrency?: Currency,
): number =>
  useMemo(
    () =>
      calculateLaborMaterialCost(
        articleItems,
        articleType,
        currentCurrency?.code ?? '',
      ),
    [articleItems, articleType, currentCurrency],
  );

export default useCalculateLaborMaterialCost;

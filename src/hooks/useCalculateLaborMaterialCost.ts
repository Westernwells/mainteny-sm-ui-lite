import {ArticleType} from 'models/article';
import {InvoiceItemRecord} from 'models/invoice';
import {Currency} from 'models/misc';
import {useMemo} from 'react';
import {centsToMoney} from 'utils/currency';

const useCalculateLaborMaterialCost = (
  articleItems: InvoiceItemRecord[],
  articleType: ArticleType,
  currentCurrency?: Currency,
): number => {
  type CostPackageKey = 'labor' | 'material';

  const getNetAmount = (item: InvoiceItemRecord): number =>
    centsToMoney(
      currentCurrency?.code!,
      item?.additionalInfo?.payment?.amount?.netAmount ?? 0,
    );

  const getPackageAmount = (
    item: InvoiceItemRecord,
    packageKey: CostPackageKey,
    netAmount: number,
  ): number => {
    const percentageKey =
      packageKey === 'labor' ? 'laborPercentage' : 'materialPercentage';
    const packageValue =
      netAmount * (item.article?.costPackage?.[percentageKey] ?? 0);
    return centsToMoney(currentCurrency?.code!, packageValue);
  };

  return useMemo(
    () =>
      articleItems?.reduce((itemTotal, item) => {
        if (item.article?.type === articleType) {
          return itemTotal + getNetAmount(item);
        }

        if (item.article?.type === ArticleType.PACKAGE) {
          const packageKey: CostPackageKey =
            articleType.toLowerCase() as CostPackageKey;
          const netAmount = getNetAmount(item);
          return itemTotal + getPackageAmount(item, packageKey, netAmount);
        }

        return itemTotal;
      }, 0),
    [articleItems, articleType, currentCurrency],
  );
};

export default useCalculateLaborMaterialCost;

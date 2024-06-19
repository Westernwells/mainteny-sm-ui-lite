import {ArticleType} from 'models/article';
import {InvoiceItemRecord} from 'models/invoice';
import {Currency} from 'models/misc';
import {useMemo} from 'react';
import {centsToMoney} from 'utils/currency';

const useCalculateLaborMaterialCost = (
  articleItems: InvoiceItemRecord[],
  type: ArticleType,
  currentCurrency?: Currency,
): number => {
  type CostPackageKey = 'labor' | 'material';

  return useMemo(
    () =>
      articleItems?.reduce((itemTotal, item) => {
        if (item.article?.type === type) {
          // For LABOR and MATERIAL types, use unitAmount netAmount
          const netAmount = centsToMoney(
            currentCurrency?.code!,
            item?.unitAmount?.netAmount ?? 0,
          );
          return itemTotal + netAmount;
        }
        if (item.article?.type === ArticleType.PACKAGE) {
          // For PACKAGE type, extract labor or material value from costPackage
          const packageKey: CostPackageKey =
            type.toLowerCase() as CostPackageKey;
          const packageValue =
            item.article?.costPackage?.[packageKey]?.value ?? 0;
          const packageAmount = centsToMoney(
            currentCurrency?.code!,
            packageValue,
          );
          return itemTotal + packageAmount;
        }
        return itemTotal;
      }, 0),
    [articleItems, type, currentCurrency],
  );
};

export default useCalculateLaborMaterialCost;

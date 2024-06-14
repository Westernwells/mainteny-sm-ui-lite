import {ArticleType} from 'models/article';
import {InvoiceItemRecord} from 'models/invoice';
import {Currency} from 'models/misc';
import {useMemo} from 'react';
import {centsToMoney} from 'utils/currency';

const useCalculateLaborMaterialCost = (
  articleItems: InvoiceItemRecord[],
  type: ArticleType,
  currentCurrency?: Currency,
): number =>
  useMemo(
    () =>
      articleItems
        ?.filter((item) => item.article?.type === type)
        ?.reduce((itemTotal, item) => {
          const netAmount = centsToMoney(
            currentCurrency?.code!,
            item?.unitAmount?.netAmount ?? 0,
          );

          return itemTotal + netAmount;
        }, 0),
    [articleItems, type, currentCurrency],
  );

export default useCalculateLaborMaterialCost;

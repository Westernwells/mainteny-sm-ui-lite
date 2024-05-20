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
          const netAmount = item?.unitAmount?.netAmount ?? 0;
          const quantity = item?.quantity ?? 1;
          const itemDiscountValue = item?.discount?.amount?.value ?? 0;
          const netTotal = netAmount * quantity;

          return (
            itemTotal +
            centsToMoney(currentCurrency?.code!, netTotal - itemDiscountValue)
          );
        }, 0),
    [articleItems, type, currentCurrency],
  );

export default useCalculateLaborMaterialCost;

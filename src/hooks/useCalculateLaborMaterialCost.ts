import {ArticleType} from 'models/article';
import {
  EditableInvoiceItem,
  InvoiceAmountDetail,
  InvoiceItemRecord,
} from 'models/invoice';
import {Currency} from 'models/misc';
import {useMemo} from 'react';
import {centsToMoney} from 'utils/currency';
import {calculateLaborMaterialTotals} from 'utils/invoice';

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
  invoiceItems: EditableInvoiceItem[],
  invoiceAmountDetail?: InvoiceAmountDetail,
  currentCurrency?: Currency,
) =>
  useMemo(() => {
    if (!invoiceAmountDetail) {
      return {labor: 0, material: 0};
    }

    const {laborNet, materialNet} = calculateLaborMaterialTotals(
      invoiceItems,
      invoiceAmountDetail.items,
    );

    const currency = currentCurrency?.code!;

    return {
      labor: centsToMoney(currency, laborNet),
      material: centsToMoney(currency, materialNet),
    };
  }, [invoiceItems, invoiceAmountDetail]);

export default useCalculateLaborMaterialCost;

import * as Yup from 'yup';
import {AnyObject} from 'yup/lib/types';
import {TestContextExtended} from 'models/articleForm';
import {ArticleType} from 'models/article';
import {QuotationItemRecord} from 'models/quotation';
import {InvoiceItemRecord} from 'models/invoice';
import {Amount} from 'models/misc';

export const handleCostPackageValidation = (
  value: number | undefined,
  context: AnyObject,
) => {
  const {from} = context as Yup.TestContext & TestContextExtended;
  const main = from[2];
  if (!value && main.value.type === ArticleType.PACKAGE) {
    return false;
  }
  if (
    value &&
    main.value.unitSellingAmount &&
    main.value.type === ArticleType.PACKAGE
  ) {
    return (
      (main.value.costPackage?.labor?.value ?? 0) +
        (main.value.costPackage?.material?.value ?? 0) ===
      Number(main.value.unitSellingAmount)
    );
  }
  return true;
};

export const getItemRecord = (
  record: QuotationItemRecord | InvoiceItemRecord<Amount>,
  percentageVat: number,
) => {
  const {netAmount} = record.unitAmount;
  const vat =
    (percentageVat * netAmount) / 10 ** record.unitAmount.fractionDigits;
  return {
    ...record,
    unitAmount: {
      ...record.unitAmount,
      netAmount,
      percentageVat,
      vat,
      grossAmount: netAmount + vat,
    },
  };
};

export const getArticleTypeText = (type: ArticleType): string => {
  switch (type) {
    case ArticleType.LABOR:
      return 'Labor';
    case ArticleType.MATERIAL:
      return 'Material';
    case ArticleType.PACKAGE:
      return 'Package';
    default:
      return '';
  }
};

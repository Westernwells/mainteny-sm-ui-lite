import * as Yup from 'yup';
import {AnyObject} from 'yup/lib/types';
import {TestContextExtended} from 'models/articleForm';
import {ArticleType} from 'models/article';

export const handleCostPackageValidation = (
  value: number | undefined,
  context: AnyObject,
) => {
  const {from} = context as Yup.TestContext & TestContextExtended;
  const main = from[2];
  if (
    value &&
    main.value.unitSellingAmount &&
    main.value.type === ArticleType.PACKAGE
  ) {
    return (
      (main.value.costPackage?.labor?.value ?? 0) +
        (main.value.costPackage?.material?.value ?? 0) ===
      main.value.unitSellingAmount
    );
  }
  return true;
};

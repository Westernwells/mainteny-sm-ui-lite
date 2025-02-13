import {DiscountType, InvoiceItemView} from 'models/invoice';
import {QuotationItemView} from 'models/quotation';
import {ServiceOrderArticleView} from 'models/service-order';

export const allItemsHaveZeroDiscount = (articleItems?: any) =>
  articleItems?.every((item: any) => {
    const discount = item?.additionalInfo?.discount;
    return (
      discount?.amount?.value === 0 ||
      discount?.percentage === 0 ||
      discount?.type === DiscountType.NONE ||
      !discount
    );
  });

export const shouldDisplayDiscountDash = (
  articleOrderItem:
    | QuotationItemView
    | ServiceOrderArticleView
    | InvoiceItemView,
): string => {
  if (!articleOrderItem || !articleOrderItem.additionalInfo) return '';

  const {additionalInfo} = articleOrderItem;
  const {discount} = additionalInfo;

  if (!discount) return '';
  if (discount.type === DiscountType.NONE) return '';
  if (
    discount.type === DiscountType.PERCENTAGE &&
    (discount.percentage ?? 0) > 0
  )
    return '-';
  if (discount.amount?.value && discount.amount.value > 0) return '-';

  return '';
};

import {
  DiscountType,
  EditableInvoiceItem,
  InvoiceItemView,
} from 'models/invoice';
import {EditableQuotationItem, QuotationItemView} from 'models/quotation';
import {ServiceOrderArticleView} from 'models/service-order';

export const allItemsHaveZeroDiscount = (
  articleItems?: (
    | EditableInvoiceItem
    | EditableQuotationItem
    | QuotationItemView
    | InvoiceItemView
  )[],
) =>
  articleItems?.every(
    (
      item:
        | EditableInvoiceItem
        | EditableQuotationItem
        | QuotationItemView
        | InvoiceItemView,
    ) => {
      const discount =
        (item as QuotationItemView | InvoiceItemView)?.additionalInfo
          ?.discount ||
        (item as EditableInvoiceItem | EditableQuotationItem)?.discount;
      return (
        !discount ||
        discount.type === DiscountType.NONE ||
        (discount.type === DiscountType.PERCENTAGE &&
          discount.percentage === 0) ||
        (discount.type === DiscountType.AMOUNT && discount.amount?.value === 0)
      );
    },
  );

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

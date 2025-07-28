import {DiscountType, Discount} from 'models/invoice';
import {Currency} from 'models/misc';

export function calculateSwitchedDiscount(
  newType: DiscountType,
  oldDiscount: Discount,
  baseAmount: number,
  currentCurrency: Currency,
): Discount {
  const oldAmt = oldDiscount.amount?.value ?? 0;
  const oldPct = oldDiscount.percentage ?? 0;

  if (newType === DiscountType.AMOUNT) {
    const calcAmt = Number(((oldPct / 100) * baseAmount).toFixed(2));
    return {
      type: DiscountType.AMOUNT,
      amount: {
        value: calcAmt,
        currency: currentCurrency.code,
        fractionDigits: currentCurrency.fractionDigits,
      },
      percentage: oldPct,
    };
  }

  if (newType === DiscountType.PERCENTAGE) {
    const calcPct =
      baseAmount > 0 ? Number(((oldAmt / baseAmount) * 100).toFixed(2)) : 0;
    return {
      type: DiscountType.PERCENTAGE,
      amount: {
        value: oldAmt,
        currency: currentCurrency.code,
        fractionDigits: currentCurrency.fractionDigits,
      },
      percentage: calcPct,
    };
  }

  return {
    type: DiscountType.NONE,
  };
}

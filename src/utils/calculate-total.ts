import {InvoiceItemRecord} from 'models/invoice';
import {Amount} from 'models/misc';

export const calculateTotal = (arr: InvoiceItemRecord<Amount>[]) => {
  const sum = 0;

  return arr
    .map(
      (item) =>
        item.quantity *
        (item.unitAmount.netAmount / 10 ** item.unitAmount.fractionDigits!),
    )
    .reduce((prevValue, currentValue) => prevValue + currentValue, sum);
};

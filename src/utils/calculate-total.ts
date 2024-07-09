import BigNumber from 'bignumber.js';
import {
  applyDiscount,
  applyGlobalDiscountOnItems,
  applyPerItemDiscountOnItems,
  getAggregatedItemsVats,
} from 'pages/InvoiceDetails/utils';
import {
  Discount,
  DiscountType,
  InvoiceFormData,
  InvoiceItemRecord,
  InvoiceView,
} from 'models/invoice';
import {Currency} from 'models/misc';
import {ServiceOrderArticleView} from 'models/service-order';
import {
  Currencies,
  formatCurrency,
  getCurrencyFractionDigits,
} from './currency';
import {fixRounding} from './utils';

const PERCENTAGE_FACTOR = 100;

export const calculateTotal = (arr: InvoiceItemRecord[]) => {
  const sum = 0;

  return arr
    .map(
      (item) =>
        item.quantity *
        (item.unitAmount.netAmount /
          10 ** Currencies[item.unitAmount.currency]),
    )
    .reduce((prevValue, currentValue) => prevValue + currentValue, sum);
};

export const calculateTotalWithPerItemDiscount = (
  invoiceItems: InvoiceItemRecord[],
) => {
  const sum = invoiceItems
    ?.map((item: InvoiceItemRecord) =>
      applyDiscount({
        actualValue:
          (item.unitAmount.netAmount /
            10 ** Currencies[item.unitAmount.currency]) *
          item.quantity,
        ...(item.discount?.type === DiscountType.AMOUNT
          ? {amount: item.discount?.amount?.value ?? 0}
          : {percentage: item.discount?.percentage ?? 0}),
      }),
    )
    .reduce((prevValue, currentValue) => prevValue + currentValue, 0);

  return sum;
};

export const calculateTotalAmountInclVats = ({
  subtotalExclVatAfterDiscount,
  percentageVats,
}: {
  subtotalExclVatAfterDiscount: number;
  percentageVats: {percentageVat: number; vat: number}[];
}) => {
  let totalAmountInclVats = subtotalExclVatAfterDiscount;

  percentageVats.forEach((v) => {
    totalAmountInclVats += v.vat;
  });

  return totalAmountInclVats;
};

export const calculateInvoiceTotal = (arr: InvoiceView[]) => {
  const sum = 0;

  return arr
    .map(
      (item) =>
        (item.totalAmount?.netAmount ?? 0) /
        10 ** item.totalAmount.fractionDigits!,
    )
    .reduce((prevValue, currentValue) => prevValue + currentValue, sum);
};

export const calculateGrossInvoiceTotal = (arr: InvoiceView[]) => {
  const sum = 0;

  return arr
    ?.map(
      (item) =>
        (item.totalAmount?.grossAmount ?? 0) /
        10 ** item.totalAmount.fractionDigits!,
    )
    .reduce((prevValue, currentValue) => prevValue + currentValue, sum);
};

export const calculateOrderArticlesTotal = (arr: ServiceOrderArticleView[]) => {
  const sum = 0;

  return arr
    ?.map(
      (item) =>
        (item.unitAmount.netAmount * item.quantity) /
        10 ** item.unitAmount.fractionDigits!,
    )
    .reduce((prevValue, currentValue) => prevValue + currentValue, sum);
};

export const calculateArticleTotalWithVatFormatted = (
  invoice: InvoiceFormData,
  currentCurrency: Currency,
) => {
  const subtotalExclVat = calculateTotalWithPerItemDiscount(invoice.items);
  const subtotalExclVatAfterDiscount = applyDiscount({
    actualValue: subtotalExclVat,
    ...(invoice.discount?.type === DiscountType.AMOUNT
      ? {amount: invoice.discount?.amount?.value ?? 0}
      : {percentage: invoice.discount?.percentage ?? 0}),
  });

  const itemsAfterPerItemDiscount = applyPerItemDiscountOnItems(invoice.items);

  const itemsAfterGlobalDiscount = applyGlobalDiscountOnItems(
    itemsAfterPerItemDiscount,
    invoice.discount,
  );

  const allItemsHasSameVAT = itemsAfterGlobalDiscount.every(
    (item) =>
      item.unitAmount.percentageVat ===
      invoice.items[0].unitAmount.percentageVat,
  );

  const percentageVats = itemsAfterGlobalDiscount.length
    ? allItemsHasSameVAT
      ? [
          {
            percentageVat: itemsAfterGlobalDiscount[0].unitAmount.percentageVat,
            vat:
              subtotalExclVatAfterDiscount *
              (itemsAfterGlobalDiscount[0].unitAmount.percentageVat /
                PERCENTAGE_FACTOR),
          },
        ]
      : getAggregatedItemsVats(itemsAfterGlobalDiscount)
    : [];

  const totalAmountInclVats = calculateTotalAmountInclVats({
    subtotalExclVatAfterDiscount,
    percentageVats,
  });

  return formatCurrency(fixRounding(totalAmountInclVats, 2), {
    currency: currentCurrency.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    roundingMode: 'floor',
  });
};

export const calculateSameVatTotals = (items: InvoiceItemRecord[]) => {
  let total = new BigNumber(0);
  let totalVAT = new BigNumber(0);

  items.forEach((item) => {
    const unitNetAmount = new BigNumber(item.unitAmount.netAmount)
      .dividedBy(new BigNumber(10).pow(Currencies[item.unitAmount.currency]))
      .multipliedBy(item.quantity)
      .decimalPlaces(2);

    const vatPercentage = new BigNumber(item.unitAmount.percentageVat);

    const itemTotal = new BigNumber(unitNetAmount)
      .multipliedBy(
        new BigNumber(1).plus(vatPercentage.dividedBy(PERCENTAGE_FACTOR)),
      )
      .decimalPlaces(2);

    total = total.plus(itemTotal);

    const vatAmount = new BigNumber(vatPercentage)
      .dividedBy(PERCENTAGE_FACTOR)
      .multipliedBy(unitNetAmount)
      .decimalPlaces(2);

    totalVAT = totalVAT.plus(vatAmount);
  });

  return {
    total: total.toNumber(),
    totalVAT: totalVAT.toNumber(),
  };
};

export const convertCentsToMoney = (
  currencyCode: string,
  cents: number = 0,
) => {
  const fractionDigits = getCurrencyFractionDigits(currencyCode);
  return new BigNumber(cents)
    .dividedBy(new BigNumber(10).pow(fractionDigits))
    .decimalPlaces(2)
    .toNumber();
};

export const convertCentsToActualAmount = (items: InvoiceItemRecord[]) =>
  items.map((item) => {
    const {unitAmount} = item;
    return {
      ...item,
      unitAmount: {
        ...unitAmount,
        netAmount: convertCentsToMoney(
          unitAmount.currency,
          unitAmount.netAmount,
        ),
      },
    };
  });

export const applyPerItemDiscount = (items: InvoiceItemRecord[]) =>
  items.map((item) => {
    if (
      !item.discount ||
      (!item.discount.amount && !item.discount.percentage)
    ) {
      return item;
    }

    const {
      discount,
      unitAmount: {netAmount},
    } = item;

    const discountAmount =
      discount.type === DiscountType.AMOUNT && discount.amount?.value
        ? discount.amount.value
        : discount.type === DiscountType.PERCENTAGE && discount.percentage
        ? netAmount * (discount.percentage / PERCENTAGE_FACTOR)
        : 0;
    const discountedPrice = new BigNumber(netAmount).minus(discountAmount);

    return {
      ...item,
      unitAmount: {...item.unitAmount, netAmount: discountedPrice.toNumber()},
    };
  });

export const sumArticlesAmount = (items: InvoiceItemRecord[]) =>
  fixRounding(
    items.reduce(
      (prevValue, currentValue) =>
        prevValue + currentValue.unitAmount.netAmount * currentValue.quantity,
      0,
    ),
    2,
  );

export const calculateGlobalDiscountAmount = (
  amountBeforeGlobalDiscount: number,
  globalDiscount?: Discount,
) =>
  globalDiscount?.type === DiscountType.AMOUNT && globalDiscount.amount?.value
    ? new BigNumber(globalDiscount.amount.value)
    : globalDiscount?.type === DiscountType.PERCENTAGE &&
      globalDiscount?.percentage
    ? new BigNumber(amountBeforeGlobalDiscount)
        .multipliedBy(globalDiscount.percentage)
        .dividedBy(100)
    : new BigNumber(0);

export const applyGlobalDiscount = (
  items: InvoiceItemRecord[],
  globalDiscountAmount: BigNumber,
  amountBeforeGlobalDiscount: number,
) =>
  items.map((item) => {
    if (!globalDiscountAmount.toNumber()) {
      return item;
    }

    const portion = new BigNumber(item.unitAmount.netAmount).isEqualTo(
      amountBeforeGlobalDiscount,
    )
      ? new BigNumber(1.0)
      : item.unitAmount.netAmount / amountBeforeGlobalDiscount;
    const discount = globalDiscountAmount.multipliedBy(portion);
    const netAfterGlobalDiscount = new BigNumber(
      item.unitAmount.netAmount,
    ).minus(discount);
    return {
      ...item,
      unitAmount: {
        ...item.unitAmount,
        netAmount: netAfterGlobalDiscount.toNumber(),
      },
    };
  });

export const calculateVAT = (items: InvoiceItemRecord[]) =>
  items.reduce((acc, item) => {
    const {percentageVat} = item.unitAmount;

    const vat = new BigNumber(item.unitAmount.netAmount)
      .multipliedBy(percentageVat / PERCENTAGE_FACTOR)
      .multipliedBy(item.quantity)
      .decimalPlaces(2);

    const foundPercentageVat = acc.find(
      (i) => i.percentageVat === percentageVat,
    );

    if (foundPercentageVat) {
      foundPercentageVat.vat = new BigNumber(foundPercentageVat.vat)
        .plus(vat)
        .toNumber();
    } else {
      acc.push({percentageVat, vat: vat.toNumber()});
    }

    return acc;
  }, [] as {percentageVat: number; vat: number}[]);

export const calculateTotalVAT = (
  vats: {percentageVat: number; vat: number}[],
) =>
  vats.reduce(
    (prevValue, currentValue) =>
      new BigNumber(prevValue).plus(currentValue.vat).toNumber(),
    0,
  );

export const calculateInvoiceAmount = ({
  items,
  globalDiscount,
}: {
  items: InvoiceItemRecord[];
  globalDiscount?: Discount;
}) => {
  const itemsConvertedFromCentsToActualAmount =
    convertCentsToActualAmount(items);
  const itemsAfterPerItemDiscount = applyPerItemDiscount(
    itemsConvertedFromCentsToActualAmount,
  );
  const amountBeforeGlobalDiscount = sumArticlesAmount(
    itemsAfterPerItemDiscount,
  );
  const globalDiscountAmount = calculateGlobalDiscountAmount(
    amountBeforeGlobalDiscount,
    globalDiscount,
  );
  const itemsAfterGlobalDiscount = applyGlobalDiscount(
    itemsAfterPerItemDiscount,
    globalDiscountAmount,
    amountBeforeGlobalDiscount,
  );
  const amountAfterGlobalDiscount = sumArticlesAmount(itemsAfterGlobalDiscount);
  const vats = calculateVAT(itemsAfterGlobalDiscount);
  const totalVAT = calculateTotalVAT(vats);
  const amountAfterGlobalDiscountWithVAT = new BigNumber(
    amountAfterGlobalDiscount,
  )
    .plus(totalVAT)
    .toNumber();

  return {
    amountBeforeGlobalDiscount,
    amountAfterGlobalDiscount,
    vats,
    amountAfterGlobalDiscountWithVAT,
  };
};

export const getArticlesTotalAmountInclVats = (
  invoice: InvoiceFormData | InvoiceView,
) => {
  const itemsAfterPerItemDiscount = applyPerItemDiscountOnItems(invoice.items);
  const itemsAfterGlobalDiscount = applyGlobalDiscountOnItems(
    itemsAfterPerItemDiscount,
    invoice.discount,
  );
  const {total} = calculateSameVatTotals(itemsAfterGlobalDiscount);
  return total;
};

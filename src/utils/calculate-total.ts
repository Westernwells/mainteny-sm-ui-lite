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
    ?.map(
      (item) =>
        item.quantity *
        ((item.unitAmount.netAmount ?? 0) /
          10 ** Currencies[item.unitAmount.currency]),
    )
    ?.reduce((prevValue, currentValue) => prevValue + currentValue, sum);
};

export const calculateTotalWithPerItemDiscount = (
  invoiceItems: InvoiceItemRecord[],
) => {
  const sum = invoiceItems
    ?.map((item: InvoiceItemRecord) =>
      applyDiscount({
        actualValue:
          ((item.unitAmount.netAmount ?? 0) /
            10 ** Currencies[item.unitAmount.currency]) *
          item.quantity,
        ...(item.discount?.type === DiscountType.AMOUNT
          ? {amount: item.discount?.amount?.value ?? 0}
          : {percentage: item.discount?.percentage ?? 0}),
      }),
    )
    ?.reduce((prevValue, currentValue) => prevValue + currentValue, 0);

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
    ?.map(
      (item) =>
        (item.totalAmount?.netAmount ?? 0) /
        10 ** item.totalAmount.fractionDigits!,
    )
    ?.reduce((prevValue, currentValue) => prevValue + currentValue, sum);
};

export const calculateGrossInvoiceTotal = (arr: InvoiceView[]) => {
  const sum = 0;

  return arr
    ?.map(
      (item) =>
        (item.totalAmount?.grossAmount ?? 0) /
        10 ** item.totalAmount.fractionDigits!,
    )
    ?.reduce((prevValue, currentValue) => prevValue + currentValue, sum);
};

export const calculateOrderArticlesTotal = (arr: ServiceOrderArticleView[]) => {
  const sum = 0;

  return arr
    ?.map(
      (item) =>
        ((item.unitAmount.netAmount ?? 0) * item.quantity) /
        10 ** item.unitAmount.fractionDigits!,
    )
    ?.reduce((prevValue, currentValue) => prevValue + currentValue, sum);
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
            percentageVat:
              itemsAfterGlobalDiscount[0].unitAmount.percentageVat ?? 0,
            vat:
              subtotalExclVatAfterDiscount *
              ((itemsAfterGlobalDiscount[0].unitAmount.percentageVat ?? 0) /
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
    const unitNetAmount = new BigNumber(item.unitAmount.netAmount ?? 0)
      .dividedBy(new BigNumber(10).pow(Currencies[item.unitAmount.currency]))
      .multipliedBy(item.quantity)
      .decimalPlaces(2);

    const vatPercentage = new BigNumber(item.unitAmount.percentageVat ?? 0);

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

export const convertCentsToActualAmount = (
  items: {
    unitAmount: {netAmount?: number; currency: string};
    quantity: number;
    discount?: Discount;
  }[],
) =>
  items?.map((item) => {
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

export const getItemTotalAfterPerItemDiscount = ({
  item,
  precision = 2,
}: {
  item: {
    unitAmount: {netAmount?: number};
    quantity: number;
    discount?: Discount;
  };
  precision?: number;
}) => {
  const total = new BigNumber(item?.unitAmount?.netAmount ?? 0)
    .multipliedBy(item?.quantity)
    .decimalPlaces(2);

  if (
    !item?.discount ||
    (!item?.discount?.amount?.value && !item?.discount.percentage)
  ) {
    return fixRounding(total.toNumber(), precision);
  }

  const {discount} = item;

  const discountAmount =
    discount?.type === DiscountType.AMOUNT && discount.amount?.value
      ? discount?.amount.value
      : discount?.type === DiscountType.PERCENTAGE && discount.percentage
      ? total.multipliedBy(discount.percentage / PERCENTAGE_FACTOR).toNumber()
      : 0;

  return fixRounding(total.minus(discountAmount).toNumber(), precision);
};

export const applyPerItemDiscount = (
  items: {
    unitAmount: {netAmount?: number; currency: string};
    quantity: number;
    discount?: Discount;
  }[],
) =>
  items?.map((item) => ({
    ...item,
    total: getItemTotalAfterPerItemDiscount({item}),
  }));

export const sumArticlesAmount = (
  items: {
    unitAmount: {netAmount?: number; currency: string};
    quantity: number;
    discount?: Discount;
    total: number;
  }[],
) =>
  fixRounding(
    items
      ?.reduce(
        (prevValue, currentValue) => prevValue.plus(currentValue.total),
        new BigNumber(0),
      )
      .toNumber(),
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
  items: {
    unitAmount: {netAmount?: number; currency: string};
    quantity: number;
    discount?: Discount;
    total: number;
  }[],
  globalDiscountAmount: BigNumber,
  amountBeforeGlobalDiscount: number,
) =>
  items?.map((item) => {
    if (!globalDiscountAmount.toNumber()) {
      return item;
    }

    const portion = new BigNumber(item.total).isEqualTo(
      amountBeforeGlobalDiscount,
    )
      ? new BigNumber(1.0)
      : item.total / amountBeforeGlobalDiscount;
    const discount = globalDiscountAmount.multipliedBy(portion);
    const totalAfterGlobalDiscount = new BigNumber(item.total).minus(discount);
    return {
      ...item,
      total: totalAfterGlobalDiscount.toNumber(),
    };
  });

export const calculateVAT = (
  items: {
    unitAmount: {netAmount?: number; currency: string; percentageVat?: number};
    quantity: number;
    discount?: Discount;
    total: number;
  }[],
) =>
  items?.reduce((acc, item) => {
    const {percentageVat = 0} = item.unitAmount;

    const vat = new BigNumber(item.total)
      .multipliedBy((percentageVat ?? 0) / PERCENTAGE_FACTOR)
      .decimalPlaces(2);

    const foundPercentageVat = acc.find(
      (i) => i.percentageVat === percentageVat,
    );

    if (foundPercentageVat) {
      foundPercentageVat.vat = new BigNumber(foundPercentageVat.vat)
        .plus(vat)
        .toNumber();
    } else {
      acc.push({percentageVat: percentageVat ?? 0, vat: vat.toNumber()});
    }

    return acc;
  }, [] as {percentageVat: number; vat: number}[]);

export const calculateTotalVAT = (
  vats: {percentageVat: number; vat: number}[],
) =>
  vats?.reduce(
    (prevValue, currentValue) =>
      new BigNumber(prevValue).plus(currentValue.vat).toNumber(),
    0,
  );

export const calculateArticlesAmount = ({
  items,
  globalDiscount,
}: {
  items: {
    unitAmount?: {netAmount?: number; currency: string; percentageVat?: number};
    quantity: number;
    discount?: Discount;
  }[];
  globalDiscount?: Discount;
}) => {
  const validItems = items
    .filter((item) => item.unitAmount !== undefined)
    .map((item) => ({
      ...item,
      unitAmount: item.unitAmount!,
    }));

  const itemsConvertedFromCentsToActualAmount =
    convertCentsToActualAmount(validItems);
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

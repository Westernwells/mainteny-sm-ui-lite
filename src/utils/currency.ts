import Dinero, {Currency} from 'dinero.js';
import {Amount, AmountRecord, StringMap} from '../models/misc';

export const formatCurrency = (
  amount: number,
  options?: Intl.NumberFormatOptions,
) =>
  amount.toLocaleString('en-US', {
    style: 'currency',
    currencyDisplay: 'narrowSymbol',
    useGrouping: true,
    currency: 'EUR',
    ...options,
  });

function formatAmount(amount?: Amount, value?: number): string {
  if (!amount) {
    return '';
  }

  return Dinero({
    amount: value,
    currency: amount.currency as Currency,
    precision: amount.fractionDigits,
  }).toFormat();
}
// display the amount from backend
export function netAmount(amount?: Amount): string {
  return formatAmount(amount, amount?.netAmount);
}

export function grossAmount(amount?: Amount): string {
  return formatAmount(amount, amount?.grossAmount);
}

export function vatAmount(amount?: Amount): string {
  return formatAmount(amount, amount?.vat);
}

// define all the supported currencies, { currencyCode: fractionDigits}
// better use dropdown list for currency in form
export const Currencies: StringMap<number> = {
  EUR: 2,
  USD: 2,
};

export function getCurrencyFractionDigits(currency: string) {
  const digits = Currencies[currency];
  if (digits === undefined) {
    console.log(`currency [${currency}] is not defined`);
    return 2;
  }
  return digits;
}

export function currencyFactor(money: {
  currency: string;
  fractionDigits?: number;
}): number {
  let {fractionDigits} = money;

  if (fractionDigits === undefined) {
    fractionDigits = getCurrencyFractionDigits(money.currency);
  }
  return 10 ** fractionDigits;
}

// compose the amount for backend
export function amountRecordForBackend(amount: AmountRecord): AmountRecord {
  const factor = currencyFactor(amount);
  return {
    netAmount: Math.round(amount.netAmount * factor),
    currency: amount.currency,
    percentageVat: amount.percentageVat,
  };
}

// transform the amount from backend to frontend for calculation (e.g. amount value in editing form)
export function amountForView(amount: Amount): Amount {
  const factor = currencyFactor(amount);
  return {
    netAmount: amount.netAmount / factor,
    grossAmount: amount.grossAmount / factor,
    vat: amount.vat / factor,
    currency: amount.currency,
    percentageVat: amount.percentageVat,
    fractionDigits: amount.fractionDigits,
  };
}

// TODO:  use the  implementation from Dapeng when it is merged
export const formatToDp = (num: number, precision: number) =>
  num.toFixed(precision);

export const getCurrencySymbol: {[key: string]: string} = {
  USD: '$',
  EUR: '€',
  CNY: '¥',
  JPY: '¥',
};

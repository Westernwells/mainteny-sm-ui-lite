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

export const roundCurrency = (value: number, precision?: number) =>
  Math.round(value * 10 ** (precision || 0)) / 10 ** (precision || 0);

// TODO:  use the  implementation from Dapeng when it is merged
export const formatToDp = (num: number, precision: number) =>
  num.toFixed(precision);

export const getCurrencySymbol: {[key: string]: string} = {
  USD: '$',
  EUR: '€',
  CNY: '¥',
  JPY: '¥',
};

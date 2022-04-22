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

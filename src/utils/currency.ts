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

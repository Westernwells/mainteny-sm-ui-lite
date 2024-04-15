import Dinero, {Currency} from 'dinero.js';
import i18n from 'i18n';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {AggregatedAmount} from 'models/invoice';
import {
  Amount,
  AmountRecord,
  StringMap,
  Currency as CurrencyModalType,
  Money,
} from '../models/misc';

export const formatCurrency = (
  amount: number,
  options?: Intl.NumberFormatOptions & {
    roundingMode?: 'floor' | 'ceil' | 'trunc' | undefined;
    excludeCurrencySymbol?: boolean;
    currencySymbol?: string;
  },
) => {
  const selectedLang = i18n.resolvedLanguage;
  const formattedAmount = amount.toLocaleString(
    selectedLang === 'de' || selectedLang === 'sr' ? 'de-DE' : 'en-US',
    {
      style: 'currency',
      currencyDisplay: 'narrowSymbol',
      useGrouping: true,
      ...options,
      currency: options?.currency ?? 'EUR',
    },
  );

  if (options?.excludeCurrencySymbol) {
    return formattedAmount.replace(options?.currencySymbol!, '').trim();
  }

  return formattedAmount.replace(/\s/g, '');
};

function formatAmount(amount?: Amount, value?: number): string {
  if (!amount || (!value && typeof value !== 'number')) {
    return '';
  }

  return Dinero({
    amount: value,
    currency: amount.currency as Currency,
    precision: amount.fractionDigits,
  }).toFormat();
}
// display the amount from backend
export function formatNetAmount(amount?: Amount): string {
  return formatAmount(amount, amount?.netAmount);
}

export function aggregatedAmountToAmount(
  aggregatedAmount?: AggregatedAmount,
): Amount {
  return {
    currency: aggregatedAmount?.currency ?? 'EUR',
    fractionDigits: aggregatedAmount?.fractionDigits ?? 2,
    grossAmount: aggregatedAmount?.grossAmount ?? 0,
    netAmount: aggregatedAmount?.netAmount ?? 0,
    percentageVat: aggregatedAmount?.percentageVat ?? 0,
    vat: aggregatedAmount?.vat ?? 0,
  };
}

export function aggregatedAmountToMoney(
  aggregatedAmount?: AggregatedAmount,
): Money {
  return {
    value: aggregatedAmount?.netAmount ?? 0,
    currency: aggregatedAmount?.currency ?? 'EUR',
    fractionDigits: aggregatedAmount?.fractionDigits ?? 2,
  };
}

export function formatGrossAmount(amount?: AggregatedAmount): string {
  return formatAmount(aggregatedAmountToAmount(amount), amount?.grossAmount);
}

export function formatVatAmount(amount?: Amount): string {
  return formatAmount(amount, amount?.vat);
}

export function multipleAmount(amount: Amount, quantity: number): Amount {
  return {
    currency: amount.currency,
    fractionDigits: amount.fractionDigits,
    grossAmount: amount.grossAmount * quantity,
    netAmount: amount.netAmount * quantity,
    percentageVat: amount.percentageVat,
    vat: amount.vat * quantity,
  };
}

// define all the supported currencies, { currencyCode: fractionDigits}
// better use dropdown list for currency in form
export const Currencies: StringMap<number> = {
  EUR: 2,
  USD: 2,
  GBP: 2,
  JPY: 0,
  CHF: 2,
  RUB: 2,
  DKK: 2,
  NGN: 2,
  GEL: 2,
  MXN: 2,
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

export function makeAmountRecord(
  netAmount: number,
  currency: string,
  percentageVat: number,
): AmountRecord {
  return {
    netAmount,
    currency,
    percentageVat,
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

export const getCurrencySymbol: {[key: string]: string} = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CNY: '¥',
  JPY: '¥',
  BAM: 'KM',
  CHF: '₣',
  RUB: '₽',
  DKK: 'kr.',
  NGN: '₦',
  GEL: '₾',
  MXN: '$',
};

export const useCurrentCurrency = (): CurrencyModalType => {
  const {user} = useUserSession();

  return (
    user?.userAccount?.serviceCompany?.settings?.currencies?.[0] ?? {
      code: 'EUR',
      fractionDigits: 2,
      symbol: '€',
    }
  );
};

export const moneyRecordForBackend = (money?: Money) => ({
  fractionDigits: money?.fractionDigits ?? 2,
  currency: money?.currency ?? 'EUR',
  value: (money?.value ?? 0) * 10 ** (money?.fractionDigits ?? 2),
});

/**
 * @param currencyCode The currency code as a string (e.g. 'EUR', 'USD')
 * @param amount The money amount as a number.
 * @returns The money amount in cents.
 */
export const moneyToCents = (currencyCode: string, amount: number = 0) => {
  const fractionDigits = getCurrencyFractionDigits(currencyCode);

  return Math.round(amount * 10 ** fractionDigits);
};

/**
 * @param currencyCode The currency code as a string (e.g. 'EUR', 'USD').
 * @param amount The money amount as a number.
 * @returns The money amount.
 */
export const centsToMoney = (currencyCode: string, cents: number = 0) => {
  const fractionDigits = getCurrencyFractionDigits(currencyCode);
  return cents / 10 ** fractionDigits;
};

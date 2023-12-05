import Dinero, {Currency} from 'dinero.js';
import i18n from 'i18n';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {
  Amount,
  AmountRecord,
  StringMap,
  Currency as CurrencyModalType,
} from '../models/misc';

export const formatCurrency = (
  amount: number,
  options?: Intl.NumberFormatOptions & {
    roundingMode?: 'floor' | 'ceil' | 'trunc' | undefined;
  },
) => {
  const selectedLang = i18n.resolvedLanguage;
  return amount.toLocaleString(
    selectedLang === 'de' || selectedLang === 'sr' ? 'de-DE' : 'en-US',
    {
      style: 'currency',
      currencyDisplay: 'narrowSymbol',
      useGrouping: true,
      ...options,
      currency: options?.currency ?? 'EUR',
    },
  );
};

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
export function formatNetAmount(amount?: Amount): string {
  return formatAmount(amount, amount?.netAmount);
}

export function formatGrossAmount(amount?: Amount): string {
  return formatAmount(amount, amount?.grossAmount);
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

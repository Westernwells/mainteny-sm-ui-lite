import {
  differenceInDays,
  endOfDay,
  isBefore,
  startOfDay,
  subMonths,
} from 'date-fns';
import {ContractTypes, ContractView} from 'models/contract';
import {toDate} from 'utils/datetime';

export const costRangeConvertor = (
  selectedItems: string[],
  currencySymbol: string,
) => {
  const range: number[][] = [];
  selectedItems.forEach((item) => {
    switch (item) {
      case `0 - ${currencySymbol}500`:
        range.push([0, 50000]);
        break;

      case `${currencySymbol}500 - ${currencySymbol}1,000`:
        range.push([50000, 100000]);
        break;

      case `> ${currencySymbol}1,000`:
        range.push([100000, 9999999]);
        break;

      default:
        break;
    }
  });
  return range;
};

export const rangeConvertorInverse = (
  selectedItems: number[][],
  currencySymbol: string,
) => {
  const range: string[] = [];
  selectedItems.forEach((item) => {
    switch (true) {
      case item[0] === 0 && item[1] === 50000:
        range.push(`0 - ${currencySymbol}500`);
        break;

      case item[0] === 50000 && item[1] === 100000:
        range.push(`${currencySymbol}500 - ${currencySymbol}1,000`);
        break;

      case item[0] === 100000 && item[1] === 9999999:
        range.push(`> ${currencySymbol}1,000`);
        break;

      default:
        break;
    }
  });
  return range;
};

export const getStartEndPrice = (price: number[][]) => {
  const numbers =
    price.length &&
    price?.reduce<number[]>((acc, item) => [...acc, ...item], []);

  const newPrice = numbers && numbers.length ? numbers : [-9999999, 9999999];

  return [
    Math.min(...(newPrice as number[])),
    Math.max(...(newPrice as number[])),
  ];
};

export const contractTypeMap = {
  [ContractTypes.SERVICE]: 'Maintenance',
  [ContractTypes.NON_SERVICE]: 'Non maintenance',
};

export const invoiceCycle: {[key: string]: string} = {
  '0': 'After each visit',
  '1': '1 month',
  '2': '2 months',
  '3': '3 months',
  '4': '4 months',
  '6': '6 months',
  '12': '12 months',
};

export const calculateRenewDays = (contractDetails: ContractView) => {
  const noticePeriodInMonths =
    contractDetails.additionalInfo.noticePeriodInMonth || 0;
  const contractEndTime = endOfDay(toDate(contractDetails?.end));
  const today = startOfDay(new Date());

  if (
    contractDetails.additionalInfo.autoRenewalCancelled ||
    !isBefore(today, contractEndTime)
  ) {
    return 0;
  }

  const contractEndTimeWithoutNotice = subMonths(
    contractEndTime,
    noticePeriodInMonths,
  );

  return differenceInDays(contractEndTimeWithoutNotice, today);
};

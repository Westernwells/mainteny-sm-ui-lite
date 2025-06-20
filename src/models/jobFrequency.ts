import {ContractTimeUnit} from './contract';

export type MonthFrequency = {
  month: string;
  isSelected: boolean;
  number: number;
};

export const MONTH_NUMBER_TO_NAME: {[key: number]: string} = {
  1: 'January',
  2: 'February',
  3: 'March',
  4: 'April',
  5: 'May',
  6: 'June',
  7: 'July',
  8: 'August',
  9: 'September',
  10: 'October',
  11: 'November',
  12: 'December',
};

export const DEFAULT_MONTH_FREQUENCY_DATA: MonthFrequency[] = [
  {month: 'January', isSelected: false, number: 1},
  {month: 'February', isSelected: false, number: 2},
  {month: 'March', isSelected: false, number: 3},
  {month: 'April', isSelected: false, number: 4},
  {month: 'May', isSelected: false, number: 5},
  {month: 'June', isSelected: false, number: 6},
  {month: 'July', isSelected: false, number: 7},
  {month: 'August', isSelected: false, number: 8},
  {month: 'September', isSelected: false, number: 9},
  {month: 'October', isSelected: false, number: 10},
  {month: 'November', isSelected: false, number: 11},
  {month: 'December', isSelected: false, number: 12},
];

export enum JOB_CYCLE_TYPE {
  FIXED = 'FIXED',
  BY_MONTHS = 'BY_MONTHS',
}

export enum FIXED_CYCLE_TYPE {
  OneWeek = '1_week',
  TwoWeeks = '2_weeks',
  ThreeWeeks = '3_weeks',
  OneYear = '1_year',
  TwoYears = '2_years',
  ThreeYears = '3_years',
}

export type CycleOption = {
  label: string;
  value: FIXED_CYCLE_TYPE;
};

export const CYCLE_OPTIONS: CycleOption[] = [
  {label: 'Every 1 week', value: FIXED_CYCLE_TYPE.OneWeek},
  {label: 'Every 2 weeks', value: FIXED_CYCLE_TYPE.TwoWeeks},
  {label: 'Every 3 weeks', value: FIXED_CYCLE_TYPE.ThreeWeeks},
  {label: 'Every 1 year', value: FIXED_CYCLE_TYPE.OneYear},
  {label: 'Every 2 years', value: FIXED_CYCLE_TYPE.TwoYears},
  {label: 'Every 3 years', value: FIXED_CYCLE_TYPE.ThreeYears},
];

const CYCLE_TO_UNIT_ARRAY: (FIXED_CYCLE_TYPE | ContractTimeUnit)[][] = [
  [FIXED_CYCLE_TYPE.OneWeek, ContractTimeUnit.WEEKLY],
  [FIXED_CYCLE_TYPE.TwoWeeks, ContractTimeUnit.BIWEEKLY],
  [FIXED_CYCLE_TYPE.ThreeWeeks, ContractTimeUnit.TRIWEEKLY],
  [FIXED_CYCLE_TYPE.OneYear, ContractTimeUnit.ANNUALLY],
  [FIXED_CYCLE_TYPE.TwoYears, ContractTimeUnit.BIENNIALLY],
  [FIXED_CYCLE_TYPE.ThreeYears, ContractTimeUnit.TRIENNIALLY],
];

export const CYCLE_TYPE_TO_LABEL_MAP = new Map<FIXED_CYCLE_TYPE, string>(
  CYCLE_OPTIONS.map((object) => {
    const [label, value] = Object.values(object);
    return [value, label]; // reverse the object keys
  }) as Iterable<readonly [FIXED_CYCLE_TYPE, string]>,
);

// All cycle options that can be mapped to a time unit status
export const CYCLE_OPTION_TO_UNIT_TIME_MAP = new Map<
  FIXED_CYCLE_TYPE,
  ContractTimeUnit
>(
  CYCLE_TO_UNIT_ARRAY as Iterable<
    readonly [FIXED_CYCLE_TYPE, ContractTimeUnit]
  >, // type casting is needed to remove the error when array is passed as variable
);

// All time unit status that can be mapped to a cycle option
export const UNIT_TYPE_TO_CYCLE_MAP = new Map<
  ContractTimeUnit,
  FIXED_CYCLE_TYPE
>(
  CYCLE_TO_UNIT_ARRAY.map((el) => el.reverse()) as Iterable<
    readonly [ContractTimeUnit, FIXED_CYCLE_TYPE]
  >, // type casting is needed to remove the error when array is passed as variable
);

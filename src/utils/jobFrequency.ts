import {t} from 'i18next';
import {
  CYCLE_TYPE_TO_LABEL_MAP,
  UNIT_TYPE_TO_CYCLE_MAP,
} from 'models/jobFrequency';
import {ContractComponentElevator, ContractTimeUnit} from 'models/contract';
import {monthNames} from './elevator-utils';

export const displayMonths = (timeNumbers?: number[]) => {
  if (!Array.isArray(timeNumbers) || timeNumbers.length === 0) return '-';
  return timeNumbers
    .sort((a, b) => a - b)
    .map((unit) => t(monthNames[unit - 1]))
    .join(', ');
};

export const getFrequencyDisplay = (
  elevator?: ContractComponentElevator,
): string => {
  if (!elevator) return '-';

  const elevatorOrder = elevator.orderGenerationJob;
  const {timeUnit, timeNumbers} = elevatorOrder || {};
  const cycleType = timeUnit && UNIT_TYPE_TO_CYCLE_MAP.get(timeUnit);

  // map monthly basis
  if (!cycleType || timeUnit === ContractTimeUnit.MONTHLY) {
    return displayMonths(timeNumbers);
  }
  const label = CYCLE_TYPE_TO_LABEL_MAP.get(cycleType);
  return label ? t(label) : '-';
};

import {StatusColorVariants} from './status';

export enum AvailabilityType {
  SICK_LEAVE = 'Sick',
  HOLIDAY = 'Holiday',
  AVAILABLE = 'Available',
}

export const AVAILABILITY_TYPE_TO_CHIP_COLOR = new Map<
  AvailabilityType,
  StatusColorVariants
>([
  [AvailabilityType.AVAILABLE, StatusColorVariants.GREEN],
  [AvailabilityType.HOLIDAY, StatusColorVariants.RED],
  [AvailabilityType.SICK_LEAVE, StatusColorVariants.RED],
]);

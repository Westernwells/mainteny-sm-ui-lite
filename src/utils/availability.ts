import {TechnicianEventType} from '../models/technician';
import {
  AVAILABILITY_TYPE_TO_CHIP_COLOR,
  AvailabilityType,
} from '../models/availability';

export const getAvailabilityTypeFromTechnicianEventType = (
  value: TechnicianEventType,
) => {
  if (value === TechnicianEventType.SICK_LEAVE)
    return AvailabilityType.SICK_LEAVE;
  if (value === TechnicianEventType.HOLIDAY) return AvailabilityType.HOLIDAY;
  return AvailabilityType.AVAILABLE;
};

export const getAvailabilityChipColor = (availability: string) => ({
  bgColor: AVAILABILITY_TYPE_TO_CHIP_COLOR.get(
    availability as AvailabilityType,
  ),
});

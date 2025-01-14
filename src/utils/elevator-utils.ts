import {
  DISTANCE_FILTER,
  DaysTimeRange,
  ElevatorAssignmentSimpleView,
  ElevatorStatus,
  ElevatorTimeRuleType,
  ElevatorTimeRuleView,
  ElevatorView,
  SearchParameters,
  UnitAppointment,
  UnitAppointmentView,
  UnitDistanceQuery,
  UnitTableRow,
} from 'models/elevator';
import {
  AppointmentFormModel,
  PriorityTechnicianFormModel,
} from 'models/unitForm';
import {
  ContractComponentElevator,
  ContractElevatorView,
  ContractTimeUnit,
  JobTimeUnit,
  TimeUnitYearView,
} from 'models/contract';
import {InspectionCycle} from 'models/misc';
import {t} from 'i18next';
import {mapDaysOfWeekOptions} from 'pages/UnitDetails/Tabs/OverviewTab/AppointmentPreference/EditAppointmentForm';
import {formatDate} from 'utils/datetime';
import capitalize from 'lodash/capitalize';
import {getAddressString} from 'utils/address';

export const monthNames = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const convertTechnicianArrayToWeights = (
  inputArray: PriorityTechnicianFormModel[],
): {[key: string]: string | number} =>
  inputArray
    .map((item) => ({...item, priority: Number(item.priority)}))
    .reduce((result, item) => {
      const key = `${item.technicianId}`;
      result[key] = item.priority;
      return result;
    }, {} as {} as {[key: string]: string | number});

export const mapAppointment = (unitAppointment: UnitAppointmentView) => {
  switch (unitAppointment) {
    case UnitAppointmentView.YES:
      return UnitAppointment.YES;
    case UnitAppointmentView.NO:
      return UnitAppointment.NO;
    default:
      return UnitAppointment.YES;
  }
};

export const getFrequency = (elevator: ContractElevatorView) => {
  const {contracts, id} = elevator;
  const foundElevator = contracts
    ?.flatMap(
      (contract) =>
        contract?.components?.flatMap(
          (component) => component?.additionalInfo?.elevators || [],
        ) ?? [],
    )
    .find((e) => id === e.elevatorId);

  if (foundElevator) {
    const {invoiceJob} = foundElevator;
    switch (invoiceJob?.timeUnit) {
      case ContractTimeUnit.WEEKLY:
        return TimeUnitYearView.WEEKLY;
      case ContractTimeUnit.BIWEEKLY:
        return TimeUnitYearView.BIWEEKLY;
      case ContractTimeUnit.MONTHLY:
        return (
          invoiceJob?.timeNumbers &&
          Array.from(invoiceJob?.timeNumbers)
            .sort((a, b) => a - b)
            .map((month) => monthNames[month - 1])
            .join(', ')
        );
      case ContractTimeUnit.ANNUALLY:
        return TimeUnitYearView.ANNUALLY;
      case ContractTimeUnit.BIENNIALLY:
        return TimeUnitYearView.BIENNIALLY;
      case ContractTimeUnit.TRIENNIALLY:
        return TimeUnitYearView.TRIENNIALLY;
      case ContractTimeUnit.QUADRENNIALLY:
        return TimeUnitYearView.QUADRENNIALLY;
      case ContractTimeUnit.NONE:
        return '-';
      default:
        return '-';
    }
  }

  return '-';
};

export const getListViewFrequency = (
  key: 'orderGenerationJob' | 'invoiceJob',
  elevators?: ContractComponentElevator[],
): string => {
  const frequencySet = new Set<string>();
  const monthlyUnits = new Set<number>();
  let isAutoJobCycle = false;

  elevators?.forEach((elevator) => {
    if (elevator[key]) {
      const timeUnit = elevator[key] ? elevator[key]?.timeUnit : null;
      switch (timeUnit) {
        case ContractTimeUnit.MONTHLY:
          elevator[key]?.timeNumbers?.forEach((month) =>
            monthlyUnits.add(month),
          );
          break;
        case ContractTimeUnit.NONE:
          if (key === 'invoiceJob') {
            isAutoJobCycle = true;
          }
          break;
        case ContractTimeUnit.WEEKLY:
        case ContractTimeUnit.BIWEEKLY:
        case ContractTimeUnit.TRIWEEKLY:
        case ContractTimeUnit.ANNUALLY:
        case ContractTimeUnit.BIENNIALLY:
        case ContractTimeUnit.TRIENNIALLY:
        case ContractTimeUnit.QUADRENNIALLY:
          frequencySet.add(t(TimeUnitYearView[timeUnit]));
          break;
        default:
          return '-';
      }
    }
  });

  Array.from(monthlyUnits)
    .sort((a, b) => a - b)
    .forEach((unit) => frequencySet.add(monthNames[unit - 1]));

  if (isAutoJobCycle) {
    return key === 'invoiceJob' ? t('After job') : '-';
  }

  return frequencySet.size
    ? Array.from(frequencySet)
        .map((item) => t(item))
        .join(', ')
    : '-';
};

export const getViewFrequency = (job?: JobTimeUnit): string => {
  const frequencySet = new Set<string>();
  const monthlyUnits = new Set<number>();

  switch (job?.timeUnit) {
    case ContractTimeUnit.MONTHLY:
      job?.timeNumbers?.forEach((month) => monthlyUnits.add(month));
      break;
    case ContractTimeUnit.NONE:
      return t('After job');
    case ContractTimeUnit.WEEKLY:
    case ContractTimeUnit.BIWEEKLY:
    case ContractTimeUnit.ANNUALLY:
    case ContractTimeUnit.BIENNIALLY:
    case ContractTimeUnit.TRIENNIALLY:
    case ContractTimeUnit.QUADRENNIALLY:
      frequencySet.add(TimeUnitYearView[job.timeUnit]);
      break;
    default:
      return '-';
  }

  Array.from(monthlyUnits)
    .sort((a, b) => a - b)
    .forEach((unit) => frequencySet.add(monthNames[unit - 1]));

  return frequencySet.size ? Array.from(frequencySet).join(', ') : '-';
};

export const inspectionCycleLabels = {
  [InspectionCycle.NONE]: 'No inspection',
  [InspectionCycle.MONTHLY]: 'Every month',
  [InspectionCycle.BIMONTHLY]: 'Every 2 months',
  [InspectionCycle.QUARTERLY]: 'Every 3 months',
  [InspectionCycle.QUADRIMESTERLY]: 'Every 4 months',
  [InspectionCycle.HALF_YEARLY]: 'Every 6 months',
  [InspectionCycle.YEARLY]: 'Every year',
  [InspectionCycle.BIENNIALLY]: 'Every 2 years',
  [InspectionCycle.TRIENNIALLY]: 'Every 3 years',
};

export const mapFormDataToElevatorUpdateRequest = (
  data: AppointmentFormModel,
  elevatorId: string,
  propertyOwnerId?: string,
) => ({
  body: {
    propertyOwnerId,
    timeRule: {
      daysTimeRange: [
        {
          daysOfWeek: data.appointmentDaysOfWeek.map((val: string) =>
            mapDaysOfWeekOptions[
              val as keyof typeof mapDaysOfWeekOptions
            ].toUpperCase(),
          ),
          timeRange:
            data.openingHour || data.closingHour
              ? {
                  start: data.openingHour || '',
                  end: data.closingHour || '',
                }
              : undefined,
        },
      ],
    },
    customerAppointment: {
      shouldNotifyCustomer: data.shouldNotifyCustomer,
      appointmentNotificationDue: data.appointmentNotificationDue,
      requiresAppointment: data.requiresAppointment,
      contactPersonId: data.contactPersonId,
      description: data.description,
    },
  },
  elevatorId,
});

export const sortTechniciansByPriority = (
  a: ElevatorAssignmentSimpleView,
  b: ElevatorAssignmentSimpleView,
) => {
  if (a.weight && b.weight && a.weight !== b.weight) {
    return a.weight - b.weight;
  }
  return a.technician.userAccount.firstName.localeCompare(
    b.technician.userAccount.firstName,
  );
};

const getPriorityTechnician = (assignments: ElevatorAssignmentSimpleView[]) =>
  assignments
    .sort(sortTechniciansByPriority)
    .map((assignment) => assignment.technician);

export const aggregateUnitRow = (units: ElevatorView[]): UnitTableRow[] =>
  units.map((unit) => ({
    data: unit,
    id: unit.id,
    number: unit.externalId,
    address: getAddressString(unit.address),
    fullAddress: unit.address.fullName ?? '-',
    building: unit.additionalInfo.buildingLocation,
    propertyOwner:
      unit.propertyOwner.meta?.state === 'ACTIVE'
        ? unit.propertyOwner
        : undefined,
    lastMaintenance: unit.additionalInfo.lastInspectionDate
      ? formatDate(unit.additionalInfo.lastInspectionDate)
      : undefined,
    nextInspection: unit.additionalInfo.nextInspectionDate
      ? formatDate(unit.additionalInfo.nextInspectionDate)
      : undefined,
    engineers: unit.assignments.length
      ? getPriorityTechnician(unit.assignments)
      : [],
    status: unit.status,
    hasContract: unit.contracts.length > 0 || false,
  }));

export const createSearchQuery = ({search, address}: SearchParameters) => {
  const elements: string[] = [];
  if (search) elements.push(search);
  if (address) elements.push(`[address:*${address}*]`);

  return elements.length ? elements.join(' ') : undefined;
};

export const getStatusString = (status: ElevatorStatus) =>
  status && capitalize(status).replace(/_/g, ' ');

const OPTION_TO_REST_DISTANCE_VALUES: Record<
  DISTANCE_FILTER,
  UnitDistanceQuery
> = {
  [DISTANCE_FILTER.FIVE]: {
    distanceStart: 5,
    distanceEnd: 10,
  },
  [DISTANCE_FILTER.TEN]: {
    distanceStart: 10,
    distanceEnd: 20,
  },
  [DISTANCE_FILTER.TWENTY]: {
    distanceStart: 20,
  },
};

export const getDistanceFromOption = (distance: DISTANCE_FILTER) =>
  OPTION_TO_REST_DISTANCE_VALUES[distance];

export const parseTimeRulesData = (timeRules: ElevatorTimeRuleView[]) => {
  const daysOfWeekAndTimeRangeTimeRule = timeRules?.find(
    (timeRule) =>
      timeRule.type === ElevatorTimeRuleType.DAYS_OF_WEEK_AND_TIME_RANGE,
  );
  if (!daysOfWeekAndTimeRangeTimeRule) return null;

  const parsedData = (
    JSON.parse(daysOfWeekAndTimeRangeTimeRule.data) as DaysTimeRange[]
  )[0];

  return parsedData;
};

export const removeSecondsFromTimeString = (time: string) =>
  time.slice(0, time.lastIndexOf(':'));

export const formatOpeningHours = (
  timeRange: {start: string; end: string} | undefined,
): string =>
  timeRange
    ? `${removeSecondsFromTimeString(
        timeRange.start,
      )} - ${removeSecondsFromTimeString(timeRange.end)}`
    : '-';

export const formatDaysOfWeek = (daysOfWeek: string[] | undefined): string =>
  daysOfWeek
    ? daysOfWeek
        .map((day) => `${day[0].toUpperCase()}${day.slice(1).toLowerCase()}`)
        .map((formattedDay) => t(formattedDay))
        .join(', ')
    : '-';

import {UnitAppointment, UnitAppointmentView} from 'models/elevator';
import {
  AppointmentFormModel,
  PriorityTechnicianFormModel,
} from 'models/unitForm';
import {
  ContractComponentElevator,
  ContractElevatorView,
  JobTimeUnit,
  ContractTimeUnit,
  TimeUnitYearView,
} from 'models/contract';
import {InspectionCycle} from 'models/misc';
import {t} from 'i18next';
import {mapDaysOfWeekOptions} from 'pages/UnitDetails/Tabs/OverviewTab/AppointmentPreference/EditAppointmentForm';

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
    },
  },
  elevatorId,
});

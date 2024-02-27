import {
  ElevatorStatus,
  UnitAppointment,
  UnitAppointmentView,
} from 'models/elevator';
import {PriorityTechnicianFormModel} from 'models/unitForm';
import {
  ContractElevatorView,
  TimeUnit,
  TimeUnitYearView,
} from 'models/contract';

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

export const getElevatorStatusChipColor = (status: ElevatorStatus) => {
  switch (status) {
    case ElevatorStatus.RUNNING:
      return 'success';
    case ElevatorStatus.BROKEN:
      return 'error';
    case ElevatorStatus.STOPPED:
      return 'warning';
    default:
      return 'default';
  }
};

export const convertTechnicianArrayToWeights = (
  inputArray: PriorityTechnicianFormModel[],
): {[key: string]: string | number} =>
  inputArray
    .map((item) => ({...item, priority: Number(item.priority)}))
    .reduce((result, item) => {
      const key = `${item.technicianId}`;
      const value = item.priority;
      result[key] = value;
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
          (component) => component.additionalInfo.elevators ?? [],
        ) ?? [],
    )
    .find((e) => id === e.elevatorId);

  if (foundElevator) {
    const {invoiceJob} = foundElevator;
    switch (invoiceJob.timeUnit) {
      case TimeUnit.WEEKLY:
      case TimeUnit.BIWEEKLY:
        return invoiceJob.timeNumbers
          .map((day) => weekDays[day - 1])
          .join(', ');
      case TimeUnit.MONTHLY:
        return invoiceJob.timeNumbers
          .map((month) => monthNames[month - 1])
          .join(', ');
      case TimeUnit.ANNUALLY:
        return TimeUnitYearView.ANNUALLY;
      case TimeUnit.BIENNIALLY:
        return TimeUnitYearView.BIENNIALLY;
      case TimeUnit.TRIENNIALLY:
        return TimeUnitYearView.TRIENNIALLY;
      case TimeUnit.QUADRENNIALLY:
        return TimeUnitYearView.QUADRENNIALLY;
      case TimeUnit.NONE:
        return '-';
      default:
        return '-';
    }
  }

  return '-';
};

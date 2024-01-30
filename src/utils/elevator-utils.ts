import {ElevatorStatus} from 'models/elevator';
import {PriorityTechnicianFormModel} from 'models/unitForm';

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

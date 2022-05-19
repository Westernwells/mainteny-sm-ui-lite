import {ElevatorStatus} from 'models/elevator';

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

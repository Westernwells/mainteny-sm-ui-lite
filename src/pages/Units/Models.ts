import {ElevatorView} from '../../models/elevator';
import {getDateObject} from '../../utils/datetime';

export interface DataGridElevatorView extends ElevatorView {
  showAddress: boolean;
}

// TODO: this is the mocked call to get date in the future
export function calculateNextVisitDate(time: string): Date {
  return getDateObject(time);
}

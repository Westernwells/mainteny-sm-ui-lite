import {addDays, setHours, setMinutes} from 'date-fns';
import {ElevatorView} from '../../models/elevator';
import {ServiceOrder, ServiceOrderView} from '../../models/service-order';
import {Address} from '../../models/misc';
import {getDateObject} from '../../utils/datetime';

export interface ElevatorOrderPair {
  elevator: ElevatorView;
  serviceOrder?: ServiceOrderView;
}

export interface ElevatorsByAddress {
  elevators: ElevatorOrderPair[];
  address: Address;
}

// TODO: this is the mocked call to get date in the future
export function calculateNextVisitDate(
  serviceOrder: ServiceOrder | ServiceOrderView,
): Date {
  const schedule = getDateObject(serviceOrder.schedules[0].startTime);
  const startDateTime = setMinutes(
    setHours(new Date(), schedule.getHours()),
    schedule.getMinutes(),
  );
  return addDays(startDateTime, schedule.getDate());
}

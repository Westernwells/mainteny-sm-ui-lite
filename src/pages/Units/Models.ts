import {ElevatorView} from '../../models/elevator';
import {ServiceOrderView} from '../../models/service-order';
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

export interface ElevatorByAddr {
  [key: string]: ElevatorView[];
}

// TODO: this is the mocked call to get date in the future
export function calculateNextVisitDate(time: string): Date {
  return getDateObject(time);
}

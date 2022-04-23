import {useCallback} from 'react';
import {useQuery, UseQueryOptions} from 'react-query';
import * as _ from 'lodash';
import {AxiosResponse} from 'axios';
import {axiosClient, paramsSerializer} from 'utils/axios-utils';
import {
  addDays,
  endOfMonth,
  startOfMonth,
  endOfWeek,
  startOfDay,
  getWeek,
  getMonth,
} from 'date-fns';
import {queryKeys} from 'reactQuery/constants';
import {ServiceCompanyTimeUnit} from 'models/service-company';
import {toDate, toRestDate} from 'utils/datetime';
import {
  ServiceOrderOrderField,
  ServiceOrderReport,
  ServiceOrderScheduleParams,
  ServiceOrderView,
} from '../../models/service-order';
import {Order, Resource, RestError} from '../../models/misc';
import {
  ElevatorAvailability,
  ElevatorAvailabilityParams,
  ElevatorView,
} from '../../models/elevator';
import {ElevatorOrderPair, ElevatorsByAddress} from '../../pages/Units/Models';
import {useUserSession} from './useUserSession';

interface ServiceOrderReportPayload {
  serviceOrderId: string | string[];
}

export const fetchServiceOrders = async (
  params: any,
): Promise<Resource<ServiceOrderView>> => {
  const response: AxiosResponse<Resource<ServiceOrderView>> =
    await axiosClient.get(`/api/serviceOrders`, {
      params,
      paramsSerializer,
    });
  return response.data;
};

export const fetchServiceOrderReport = async (
  params: ServiceOrderReportPayload,
) => {
  const response = await axiosClient.get<ServiceOrderReport[]>(
    `/api/serviceOrders/reports`,
    {
      params,
      paramsSerializer,
    },
  );
  return response.data;
};

export const fetchElevatorAvailability = async (
  params: ElevatorAvailabilityParams,
) => {
  const response = await axiosClient.get<ElevatorAvailability>(
    `/api/availabilities/elevators`,
    {
      params,
      paramsSerializer,
    },
  );
  return response.data;
};

const filterByNextVisit = (
  serviceOrderViewRes: Resource<ServiceOrderView>,
  nextVisit: string[],
) => {
  let mergedResult = [] as ServiceOrderView[];
  let key: number | string;

  const monthIndex = getMonth(new Date());

  const serviceOrderViewMap = _.groupBy(
    serviceOrderViewRes.data,
    (serviceOrder) => {
      const theDate = toDate(serviceOrder.schedules[0].startTime);

      const month = getMonth(theDate);
      if (month === monthIndex) {
        return getWeek(theDate);
      }

      if (month === monthIndex + 1) {
        return 'nextMonth';
      }
      return null;
    },
  );

  nextVisit
    .map((item) => {
      switch (item) {
        case 'This week': // TODO: create an enum
          key = getWeek(new Date());
          break;
        case 'Next week':
          key = getWeek(addDays(startOfDay(endOfWeek(new Date())), 1));
          break;
        case 'Next month':
          key = 'nextMonth';
          break;
        default:
          break;
      }

      return serviceOrderViewMap[key];
    })
    .filter((item) => item)
    .forEach((item) => {
      const diff = _.differenceBy(mergedResult, item, 'id');
      mergedResult = [...diff, ...item];
    });

  return mergedResult;
};

const inRange = (value: number, range: number[][]) => {
  let result: boolean = false;
  range.forEach((item) => {
    if (value > item[0] && value <= item[1]) {
      result = true;
    }
  });
  return result;
};

const filterServiceOrder = (
  serviceOrderViewRes: Resource<ServiceOrderView>,
  filter: {nextVisit: string[]},
) => {
  let result = {...serviceOrderViewRes};

  if (filter.nextVisit.length) {
    const nextVisitFilter = filterByNextVisit(
      serviceOrderViewRes,
      filter.nextVisit,
    );
    result = {...result, data: nextVisitFilter, total: nextVisitFilter.length};
  }
  return result;
};

const groupElevatorByAddressList = (
  serviceOrderView: ServiceOrderView[],
  elevatorRes?: Resource<ElevatorView>,
  elevatorAvailability?: ElevatorAvailability,
) => {
  const serviceOrderMap = _.groupBy(
    serviceOrderView,
    (order: ServiceOrderView) => order.elevator.id,
  );

  const elevatorWithOrders = elevatorRes!.data.map((elevator) => {
    const orders = serviceOrderMap[elevator.id];
    const availability = elevatorAvailability![elevator.id];
    const elevatorWithOrder: ElevatorOrderPair = {
      elevator: {
        ...elevator,
        availability: Object.values(availability)[0],
      },
      serviceOrder: orders && orders[0],
    };
    return elevatorWithOrder;
  });

  const elevatorByAddressList: ElevatorsByAddress[] = _.values(
    _.groupBy(elevatorWithOrders, (record) => record.elevator.address.id),
  ).map((elevators) => ({
    elevators,
    address: elevators[0].elevator.address,
  }));

  return elevatorByAddressList;
};

export const useFetchElevatorAvailability = (elevatorIds: string[]) => {
  const params = {
    elevatorId: elevatorIds,
    start: toRestDate(startOfMonth(new Date())),
    end: toRestDate(endOfMonth(new Date())),
    timeUnit: ServiceCompanyTimeUnit.MONTHLY,
  };
  return useQuery(
    [queryKeys.fetchElevatorAvailability, params],
    () => fetchElevatorAvailability(params),
    {
      enabled: !!elevatorIds.length,
    },
  );
};

export function useServiceOrderReport(params: ServiceOrderReportPayload) {
  return useQuery<ServiceOrderReport[], RestError>(
    [queryKeys.fetchServiceOrderReport, params],
    () => fetchServiceOrderReport(params as ServiceOrderReportPayload),
    {enabled: !!params.serviceOrderId || !!params.serviceOrderId.length},
  );
}

export function useServiceOrders(params: any) {
  const {user} = useUserSession();
  return useQuery<Resource<ServiceOrderView>, RestError>(
    [queryKeys.fetchServiceOrders, params, user!.userAccount.serviceCompany.id],
    () =>
      fetchServiceOrders({
        ...params,
        serviceCompanyId: user!.userAccount.serviceCompany.id,
        orderBy: ServiceOrderOrderField.CREATED_TIME,
        order: Order.DESC,
      }),
    {enabled: !!user && !!params.elevatorIds},
  );
}

// TODO: currently not in uae, we migght have to remove
// if we realise we'll never need it again
export function useFetchServiceOrdersByElevators(
  elevatorRes: Resource<ElevatorView>,
  filter: {nextVisit: string[]; availabilityRange: number[][]},
  options?: UseQueryOptions<any, any, any>,
) {
  const {user} = useUserSession();
  const elevatorIds = elevatorRes?.data.map((elevator) => elevator.id);
  const {data: availability} = useFetchElevatorAvailability(elevatorIds);
  const start = startOfDay(new Date()).toISOString();
  const end = startOfDay(addDays(new Date(), 30)).toISOString();
  return useQuery<Resource<ServiceOrderView>, RestError, ElevatorsByAddress[]>(
    [
      queryKeys.fetchServiceOrders,
      elevatorIds,
      user!.userAccount.serviceCompany.id,
    ],
    () =>
      fetchServiceOrders({
        start,
        end,
        pageSize: 500,
        pageIndex: 0,
        elevatorIds,
        query: '',
        serviceCompanyId: user!.userAccount.serviceCompany.id,
        status: [],
        orderBy: ServiceOrderOrderField.CREATED_TIME,
        order: Order.DESC,
      }),
    {
      enabled: !!user && !!availability,
      ...options,
      select: useCallback(
        // TODO: refactor into a function
        (serviceOrderView: Resource<ServiceOrderView>) => {
          const filterResult = filterServiceOrder(serviceOrderView, filter);
          let response = groupElevatorByAddressList(
            filterResult.data,
            elevatorRes,
            availability,
          );
          if (filter.nextVisit.length) {
            response = response
              .filter(
                (item) => item.elevators.filter((x) => x.serviceOrder).length,
              )
              .map((item) => ({
                ...item,
                elevators: item.elevators.filter((x) => x.serviceOrder),
              }));
          }
          if (filter.availabilityRange.length) {
            response = response
              .map((item) => ({
                ...item,
                elevators: item.elevators.filter((x) =>
                  inRange(x.elevator.availability, filter.availabilityRange),
                ),
              }))
              .filter((item) => item.elevators.length !== 0);
          }
          return response;
        },

        [availability, user, filter],
      ),
    },
  );
}

export const queryServiceOrderSchedules = async (
  params: ServiceOrderScheduleParams,
) => {
  const response = await axiosClient.get<Resource<ServiceOrderView>>(
    `/api/serviceOrders/schedule/orders`,
    {
      params,
      paramsSerializer,
    },
  );
  return response.data;
};

export const useQueryServiceOrderSchedules = (
  params: ServiceOrderScheduleParams,
  options?: any,
) => {
  const {user} = useUserSession();
  return useQuery(
    [queryKeys.fetchServiceOrders, params, user!.userAccount.serviceCompany.id],
    () =>
      queryServiceOrderSchedules({
        ...params,
        serviceCompanyId: user!.userAccount.serviceCompany.id,
      }),
    {enabled: !!user && !!params.technicianIds?.length, ...options},
  );
};

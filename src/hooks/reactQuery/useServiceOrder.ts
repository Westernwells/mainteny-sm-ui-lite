import {useCallback} from 'react';
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from 'react-query';
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
import {useSnackbar} from 'notistack';
import {
  AssignmentBasedOrderBody,
  UpdateServiceOrderBody,
  RedispatchParams,
  ServiceOrderActivityView,
  ServiceOrderOrderField,
  ServiceOrderQueryParams,
  ServiceOrderScheduleParams,
  ServiceOrderView,
  CreateScheduledServiceOrderBody,
  CreateNonScheduledServiceOrderBody,
  ServiceOrderReportView,
  ServiceOrderItemRecord,
} from '../../models/service-order';
import {Order, Resource, RestError, StringValue} from '../../models/misc';
import {
  ElevatorAvailability,
  ElevatorAvailabilityParams,
  ElevatorOrderPair,
  ElevatorsByAddress,
  ElevatorView,
} from '../../models/elevator';
import {useUserSession} from './useUserSession';

interface ServiceOrderReportPayload {
  serviceOrderId: string | string[];
}

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

export const fetchServiceOrderReport = async (
  params: ServiceOrderReportPayload,
) => {
  const response = await axiosClient.get<ServiceOrderReportView[]>(
    `/api/serviceOrders/reports`,
    {
      params,
      paramsSerializer,
    },
  );
  return response.data;
};

export function useServiceOrderReport(
  params: ServiceOrderReportPayload,
  options?: UseQueryOptions<any, any, any>,
) {
  return useQuery<ServiceOrderReportView[]>(
    [queryKeys.fetchServiceOrderReport, params],
    () => fetchServiceOrderReport(params as ServiceOrderReportPayload),
    {
      enabled: !!params.serviceOrderId || !!params.serviceOrderId.length,
      ...options,
    },
  );
}

export const queryServiceOrders = async (
  params: ServiceOrderQueryParams,
): Promise<Resource<ServiceOrderView>> => {
  const response: AxiosResponse<Resource<ServiceOrderView>> =
    await axiosClient.get(`/api/serviceOrders`, {
      params,
      paramsSerializer,
    });
  return response.data;
};

export function useServiceOrders(
  params: ServiceOrderQueryParams,
  options?: UseQueryOptions<any, any, any>,
) {
  const {user} = useUserSession();
  return useQuery<
    Resource<ServiceOrderView>,
    RestError,
    Resource<ServiceOrderView>
  >(
    [queryKeys.queryServiceOrders, params, user?.userAccount.serviceCompany.id],
    () =>
      queryServiceOrders({
        ...params,
        serviceCompanyId: user!.userAccount.serviceCompany.id,
        orderBy: ServiceOrderOrderField.CREATED_TIME,
        order: Order.DESC,
      }),
    {enabled: !!user, ...options},
  );
}

// TODO: currently not in uae, we migght have to remove
// if we realise we'll never need it again
export function useFetchServiceOrdersByElevators(
  elevatorRes: Resource<ElevatorView>,
  filter: {nextVisit: string[]; availabilityRange: number[][]},
  options?: UseQueryOptions<
    Resource<ServiceOrderView>,
    RestError,
    ElevatorsByAddress[]
  >,
) {
  const {user} = useUserSession();
  const elevatorIds = elevatorRes?.data.map((elevator) => elevator.id);
  const {data: availability} = useFetchElevatorAvailability(elevatorIds);
  const start = startOfDay(new Date()).toISOString();
  const end = startOfDay(addDays(new Date(), 30)).toISOString();
  return useQuery<Resource<ServiceOrderView>, RestError, ElevatorsByAddress[]>(
    [
      queryKeys.queryServiceOrders,
      elevatorIds,
      user?.userAccount.serviceCompany.id,
    ],
    () =>
      queryServiceOrders({
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

export const useQueryServiceOrderScheduled = (
  params: ServiceOrderScheduleParams,
  options?: UseQueryOptions<any, any, any>,
) => {
  const {user} = useUserSession();

  return useQuery<Resource<ServiceOrderView>>(
    [queryKeys.querySeviceOrders, params, user?.userAccount.serviceCompany.id],
    () =>
      queryServiceOrderSchedules({
        ...params,
        serviceCompanyId: user!.userAccount.serviceCompany.id,
      }),
    {enabled: !!user, ...options},
  );
};

export const getServiceOrderDetails = async (
  serviceOrderId: string,
): Promise<ServiceOrderView> => {
  const response: AxiosResponse<ServiceOrderView> = await axiosClient.get(
    `/api/serviceOrders/${serviceOrderId}`,
  );
  return response.data;
};

// it is okay to use pass any,information is for react-query & not us.Passing correct types makes simple function gigantic
export function useServiceOrderDetails(
  serviceOrderId?: string,
  options?: UseQueryOptions<any, any, any>,
) {
  return useQuery<ServiceOrderView, RestError, ServiceOrderView>(
    [queryKeys.getServiceOrderDetails, serviceOrderId],
    () => getServiceOrderDetails(serviceOrderId!),
    {enabled: !!serviceOrderId, ...options},
  );
}

const getServiceOrderActivities = async (serviceOrderId: string) => {
  const response: AxiosResponse<ServiceOrderActivityView[]> =
    await axiosClient.get(`/api/serviceOrders/${serviceOrderId}/activities`);
  return response.data;
};

export function useServiceOrderActivities(
  serviceOrderId?: string,
  options?: UseQueryOptions<any, any, any>,
) {
  return useQuery<
    ServiceOrderActivityView[],
    RestError,
    ServiceOrderActivityView[]
  >(
    [queryKeys.serviceOrderActivity, serviceOrderId],
    () => getServiceOrderActivities(serviceOrderId!),
    {enabled: !!serviceOrderId, ...options},
  );
}

const cancelServiceOrders = async (serviceOrderId: string) => {
  await axiosClient.put<StringValue>(
    `/api/serviceOrders/${serviceOrderId}/cancel`,
  );
};

export const useCancelServiceOrders = () => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar} = useSnackbar();
  return useMutation(
    (serviceOrderId: string) => cancelServiceOrders(serviceOrderId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([queryKeys.getServiceOrderDetails]);
        queryClient.invalidateQueries([queryKeys.serviceOrderActivity]);
        enqueueSnackbar('Service order cancelled', {
          variant: 'success',
        });
      },
      onError: (err) => {
        console.log(err);
        enqueueSnackbar('Some error occurred, please try again.', {
          variant: 'error',
        });
      },
    },
  );
};

const unschedulerServiceOrder = async (serviceOrderId: string) => {
  await axiosClient.put<StringValue>(
    `/api/serviceOrders/${serviceOrderId}/unschedule`,
  );
};

export const useUnscheduleServiceOrders = () => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar} = useSnackbar();
  return useMutation(
    (serviceOrderId: string) => unschedulerServiceOrder(serviceOrderId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([queryKeys.getServiceOrderDetails]);
        queryClient.invalidateQueries([queryKeys.serviceOrderActivity]);
        enqueueSnackbar('Service order unscheduled', {
          variant: 'success',
        });
      },
      onError: (err) => {
        console.log(err);
        enqueueSnackbar('Some error occurred, please try again.', {
          variant: 'error',
        });
      },
    },
  );
};

const redispatchServiceOrders = async (
  technicianId: string,
  serviceOrderId: string,
) => {
  await axiosClient.post<StringValue>(
    `/api/dispatch/technicians/${technicianId}/serviceOrders/redispatch`,
    {},
    {
      params: {serviceOrderId},
      paramsSerializer,
    },
  );
};

export const useRedispatchServiceOrders = (successMsg: string) => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar} = useSnackbar();
  return useMutation(
    ({technicianId, serviceOrderId}: RedispatchParams) =>
      redispatchServiceOrders(technicianId, serviceOrderId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([queryKeys.getServiceOrderDetails]);
        queryClient.invalidateQueries([queryKeys.serviceOrderActivity]);
        queryClient.invalidateQueries([queryKeys.queryServiceOrders]);
        enqueueSnackbar(successMsg, {
          variant: 'success',
        });
      },
      onError: (err) => {
        console.log(err);
        enqueueSnackbar('Some error occurred, please try again.', {
          variant: 'error',
        });
      },
    },
  );
};

const updateServiceOrder = async (
  body: UpdateServiceOrderBody,
  serviceOrderId: string,
) => {
  await axiosClient.put<StringValue>(
    `/api/serviceOrders/${serviceOrderId}/jobSchedule`,
    {...body},
  );
};

export const useUpdateServiceOrder = (successMsg: string) => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar} = useSnackbar();
  return useMutation(
    ({
      body,
      serviceOrderId,
    }: {
      body: UpdateServiceOrderBody;
      serviceOrderId: string;
    }) => updateServiceOrder(body, serviceOrderId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([queryKeys.getServiceOrderDetails]);
        queryClient.invalidateQueries([queryKeys.serviceOrderActivity]);
        queryClient.invalidateQueries([queryKeys.queryServiceOrders]);
        enqueueSnackbar(successMsg, {
          variant: 'success',
        });
      },
      onError: (err) => {
        console.log(err);
        enqueueSnackbar('Some error occurred, please try again.', {
          variant: 'error',
        });
      },
    },
  );
};

const createAssignmentBasedOrder = async (body: AssignmentBasedOrderBody) => {
  await axiosClient.post<StringValue>('/api/serviceOrders/assignmentBased', {
    ...body,
  });
};

export const useAssignmentBasedOrder = (successMsg: string) => {
  const {enqueueSnackbar} = useSnackbar();
  return useMutation(
    (body: AssignmentBasedOrderBody) => createAssignmentBasedOrder(body),
    {
      onSuccess: () => {
        enqueueSnackbar(successMsg, {
          variant: 'success',
        });
      },
      onError: (err) => {
        console.log(err);
        enqueueSnackbar('Some error occurred, please try again.', {
          variant: 'error',
        });
      },
    },
  );
};

const createScheduledServiceOrder = async (
  body: CreateScheduledServiceOrderBody,
) => {
  await axiosClient.post<StringValue>('/api/serviceOrders/scheduled', {
    ...body,
  });
};

export const useCreateScheduledServiceOrder = (successMsg: string) => {
  const {enqueueSnackbar} = useSnackbar();
  return useMutation(
    (body: CreateScheduledServiceOrderBody) =>
      createScheduledServiceOrder(body),
    {
      onSuccess: () => {
        enqueueSnackbar(successMsg, {
          variant: 'success',
        });
      },
      onError: (err) => {
        console.log(err);
        enqueueSnackbar('Some error occurred, please try again.', {
          variant: 'error',
        });
      },
    },
  );
};

const createNonScheduledServiceOrder = async (
  body: CreateNonScheduledServiceOrderBody,
) => {
  await axiosClient.post<StringValue>('/api/serviceOrders/nonscheduled', {
    ...body,
  });
};

export const useCreateNonScheduledServiceOrder = (successMsg: string) => {
  const {enqueueSnackbar} = useSnackbar();
  return useMutation(
    (body: CreateNonScheduledServiceOrderBody) =>
      createNonScheduledServiceOrder(body),
    {
      onSuccess: () => {
        enqueueSnackbar(successMsg, {
          variant: 'success',
        });
      },
      onError: (err) => {
        console.log(err);
        enqueueSnackbar('Some error occurred, please try again.', {
          variant: 'error',
        });
      },
    },
  );
};

export const putServiceOrderArticles = async (
  body: ServiceOrderItemRecord[],
  id: string,
) => {
  await axiosClient.put(`api/serviceOrders/${id}/articles`, body);
};

export const useUpdateServiceOrderArticles = () => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar} = useSnackbar();

  return useMutation(
    ({data, orderId}: {data: ServiceOrderItemRecord[]; orderId: string}) =>
      putServiceOrderArticles(data, orderId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([queryKeys.fetchServiceOrderReport]);
        queryClient.invalidateQueries([queryKeys.fetchServiceOrderArticles]);
        queryClient.invalidateQueries([queryKeys.getServiceOrderDetails]);
        enqueueSnackbar(`Work report updated successfully!`, {
          variant: 'success',
        });
      },
      onError: (err) => {
        console.log(err);
        enqueueSnackbar('Some error occurred, please try again!', {
          variant: 'error',
        });
      },
    },
  );
};

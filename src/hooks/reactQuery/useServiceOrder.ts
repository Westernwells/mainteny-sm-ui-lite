import {useCallback, useContext} from 'react';
import {
  useInfiniteQuery,
  UseInfiniteQueryOptions,
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
  endOfWeek,
  getMonth,
  getWeek,
  startOfDay,
  startOfMonth,
} from 'date-fns';
import {queryKeys} from 'reactQuery/constants';
import {ServiceCompanyTimeUnit} from 'models/service-company';
import {toDate, toRestDate} from 'utils/datetime';
import {useSnackbar} from 'hooks/useSnackbar';
import {CheckList, SendServiceOrderCheckListRecord} from 'models/checklist';
import {LanguageContext} from 'context/LanguageProvider';
import {languageContextMap} from 'utils/utils';
import {ServiceOrderArticleRecord} from 'models/article';
import {
  AssignmentBasedOrderBody,
  CreateServiceOrderComment,
  QueryServiceOrderCommentsParams,
  ServiceOrderActivityView,
  ServiceOrderOrderField,
  ServiceOrderQueryParams,
  ServiceOrderScheduleParams,
  ServiceOrderView,
  UpdateServiceOrderBody,
  AppointmentConfirmationRequiredOrdersQueryParams,
  ServiceOrderArticleView,
  ServiceOrderConfirmationPublishBody,
  CreateServiceOrderRecord,
  SendServiceOrderReportRecord,
  ServiceOrderPaymentStatus,
  ServiceOrderPaymentWithIndicationStatus,
  UpdateServiceOrderScheduleBody,
  CompleteServiceOrder,
} from 'models/service-order';
import {Resource, RestError, StringValue} from 'models/misc';
import {
  ElevatorAvailability,
  ElevatorAvailabilityParams,
  ElevatorOrderPair,
  ElevatorsByAddress,
  ElevatorView,
} from 'models/elevator';
import {Comment} from 'models/comment';
import {useUserSession} from './useUserSession';
import {useServiceOrderCommentMutation} from './useServiceOrderCommentMutation';
import {Order} from '../../models/pagination';

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

export const queryPropertyOwnerServiceOrders = async (
  params: ServiceOrderQueryParams,
  propertyOwnerId: string,
): Promise<Resource<ServiceOrderView>> => {
  const response: AxiosResponse<Resource<ServiceOrderView>> =
    await axiosClient.get(
      `/api/propertyOwners/${propertyOwnerId}/serviceOrders`,
      {
        params,
        paramsSerializer,
      },
    );
  return response.data;
};

export const queryServiceOrders = async (
  params: ServiceOrderQueryParams,
): Promise<Resource<ServiceOrderView>> => {
  // Add all autogenerated payment statuses if autogenerated is selected
  const paymentStatus = params.paymentStatus?.includes(
    ServiceOrderPaymentStatus.AUTO_GENERATED,
  )
    ? [
        ...params.paymentStatus,
        ...Object.values(ServiceOrderPaymentWithIndicationStatus),
      ]
    : params.paymentStatus;

  const response: AxiosResponse<Resource<ServiceOrderView>> =
    await axiosClient.get(`/api/serviceOrders`, {
      params: {
        ...params,
        ...(paymentStatus ? {paymentStatus} : {}),
      },
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
      }),
    {enabled: !!user, ...options},
  );
}

export const queryDueServiceOrders = async (
  params: ServiceOrderQueryParams,
): Promise<Resource<ServiceOrderView>> => {
  const response: AxiosResponse<Resource<ServiceOrderView>> =
    await axiosClient.get(`/api/serviceOrders/dueOrders`, {
      params,
      paramsSerializer,
    });
  return response.data;
};

export function useDueServiceOrders(
  params: ServiceOrderQueryParams & {candidateTechnicianAssigned?: boolean},
  options?: UseQueryOptions<any, any, any>,
) {
  const {user} = useUserSession();
  return useQuery<
    Resource<ServiceOrderView>,
    RestError,
    Resource<ServiceOrderView>
  >(
    [
      queryKeys.queryDueServiceOrders,
      params,
      user?.userAccount.serviceCompany.id,
    ],
    () =>
      queryDueServiceOrders({
        serviceCompanyId: user!.userAccount.serviceCompany.id,
        order: Order.DESC,
        ...params,
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
    [queryKeys.queryServiceOrders, params, user?.userAccount.serviceCompany.id],
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

export const getServiceOrderChecklist = async (
  serviceOrderId: string,
): Promise<CheckList> => {
  const response = await axiosClient.get<CheckList>(
    `/api/serviceOrders/${serviceOrderId}/checkList`,
  );
  return response.data;
};

export const updateServiceOrderArticles = async (
  serviceOrderId: string,
  body: ServiceOrderArticleRecord[],
) => {
  await axiosClient.put(`api/serviceOrders/${serviceOrderId}/articles/`, body);
};

// it is okay to use pass any,information is for react-query & not us.Passing correct types makes simple function gigantic
export function useServiceOrderCheckList(
  serviceOrderId?: string,
  options?: UseQueryOptions<any, any, any>,
) {
  return useQuery<CheckList, RestError, CheckList>(
    [queryKeys.fetchServiceOrderChecklist, serviceOrderId],
    () => getServiceOrderChecklist(serviceOrderId!),
    {enabled: !!serviceOrderId, ...options},
  );
}

const getServiceOrderActivities = async (
  serviceOrderId: string,
  params: any = {},
) => {
  const response: AxiosResponse<ServiceOrderActivityView[]> =
    await axiosClient.get(`/api/serviceOrders/${serviceOrderId}/activities`, {
      params,
      paramsSerializer,
    });
  return response.data;
};

export function useServiceOrderActivities(
  serviceOrderId?: string,
  options?: UseQueryOptions<any, any, any>,
) {
  const {language} = useContext(LanguageContext);
  return useQuery<
    ServiceOrderActivityView[],
    RestError,
    ServiceOrderActivityView[]
  >(
    [
      queryKeys.serviceOrderActivity,
      serviceOrderId,
      languageContextMap[language],
    ],
    () =>
      getServiceOrderActivities(serviceOrderId!, {
        language: languageContextMap[language],
      }),
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
  const {enqueueSnackbar, showError} = useSnackbar();
  return useMutation(
    (serviceOrderId: string) => cancelServiceOrders(serviceOrderId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([queryKeys.getServiceOrderDetails]);
        queryClient.invalidateQueries([queryKeys.serviceOrderActivity]);
        enqueueSnackbar('Service job has been cancelled', {
          variant: 'success',
        });
      },
      onError: (err) => {
        showError(err);
      },
    },
  );
};

const completeServiceOrder = async (
  serviceOrderId: string,
  body: CompleteServiceOrder,
) => {
  await axiosClient.put<StringValue>(
    `/api/serviceOrders/${serviceOrderId}/complete`,
    {...body},
  );
};

export const useCompleteServiceOrder = (successMsg?: string) => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar, showError} = useSnackbar();
  return useMutation(
    ({
      serviceOrderId,
      body,
    }: {
      serviceOrderId: string;
      body: CompleteServiceOrder;
    }) => completeServiceOrder(serviceOrderId, body),
    {
      onSuccess: () => {
        setTimeout(() => {
          queryClient.invalidateQueries([queryKeys.getServiceOrderDetails]);
          queryClient.invalidateQueries([queryKeys.serviceOrderActivity]);
        }, 10);
        if (successMsg) {
          enqueueSnackbar(successMsg, {
            variant: 'success',
          });
        }
      },
      onError: (err) => {
        showError(err);
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
  const {enqueueSnackbar, showError} = useSnackbar();
  return useMutation(
    (serviceOrderId: string) => unschedulerServiceOrder(serviceOrderId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([queryKeys.getServiceOrderDetails]);
        queryClient.invalidateQueries([queryKeys.serviceOrderActivity]);
        enqueueSnackbar('Service job has been unscheduled', {
          variant: 'success',
        });
      },
      onError: (err) => {
        showError(err);
      },
    },
  );
};

const updateServiceOrderSchedule = async (
  body: UpdateServiceOrderScheduleBody,
  serviceOrderId: string,
) => {
  await axiosClient.put<StringValue>(`/api/serviceOrders/${serviceOrderId}`, {
    ...body,
  });
};

export const useUpdateServiceOrderSchedule = (successMsg: string) => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar, showError} = useSnackbar();
  return useMutation(
    ({
      body,
      serviceOrderId,
    }: {
      body: UpdateServiceOrderScheduleBody;
      serviceOrderId: string;
    }) => updateServiceOrderSchedule(body, serviceOrderId),
    {
      onSuccess: () => {
        enqueueSnackbar(successMsg, {
          variant: 'success',
        });
        queryClient.invalidateQueries([queryKeys.getServiceOrderDetails]);
        queryClient.invalidateQueries([queryKeys.queryDueServiceOrders]);
      },
      onError: (err) => {
        showError(err);
      },
    },
  );
};

const updateServiceOrder = async (
  body: Partial<UpdateServiceOrderBody>,
  serviceOrderId: string,
) => {
  await axiosClient.put<StringValue>(`/api/serviceOrders/${serviceOrderId}`, {
    ...body,
  });
};

export const useUpdateServiceOrder = (successMsg: string) => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar, showError} = useSnackbar();
  return useMutation(
    ({
      body,
      serviceOrderId,
    }: {
      body: Partial<UpdateServiceOrderBody>;
      serviceOrderId: string;
    }) => updateServiceOrder(body, serviceOrderId),
    {
      onSuccess: () => {
        enqueueSnackbar(successMsg, {
          variant: 'success',
        });
        queryClient.invalidateQueries([queryKeys.getServiceOrderDetails]);
      },
      onError: (err) => {
        showError(err);
      },
    },
  );
};

const createAssignmentBasedOrder = async (body: AssignmentBasedOrderBody) =>
  axiosClient.post<StringValue>('/api/serviceOrders/assignmentBased', {
    ...body,
  });

export const useAssignmentBasedOrder = (successMsg: string) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  return useMutation(
    (body: AssignmentBasedOrderBody) => createAssignmentBasedOrder(body),
    {
      onSuccess: () => {
        enqueueSnackbar(successMsg, {
          variant: 'success',
        });
      },
      onError: (err) => {
        showError(err);
      },
    },
  );
};

const createServiceOrder = async (body: CreateServiceOrderRecord) =>
  axiosClient.post<StringValue>('/api/serviceOrders', {
    ...body,
  });

export const useCreateServiceOrder = (successMsg: string) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  return useMutation(createServiceOrder, {
    onSuccess: () => {
      enqueueSnackbar(successMsg, {
        variant: 'success',
      });
    },
    onError: (err) => {
      console.log(err);
      showError(err);
    },
  });
};

export const queryAppointmentConfirmationRequiredOrders = async (
  params: AppointmentConfirmationRequiredOrdersQueryParams,
): Promise<Resource<ServiceOrderView>> => {
  const response: AxiosResponse<Resource<ServiceOrderView>> =
    await axiosClient.get(
      `/api/serviceOrders/appointmentConfirmationRequiredOrders`,
      {
        params,
        paramsSerializer,
      },
    );
  return response.data;
};

export function useAppointmentConfirmationRequiredOrders(
  params: AppointmentConfirmationRequiredOrdersQueryParams,
  options?: UseQueryOptions<any, any, any>,
) {
  const {user} = useUserSession();
  return useQuery<
    Resource<ServiceOrderView>,
    RestError,
    Resource<ServiceOrderView>
  >(
    [
      queryKeys.queryAppointmentConfirmationRequiredOrders,
      params,
      user?.userAccount.serviceCompany.id,
    ],
    () =>
      queryAppointmentConfirmationRequiredOrders({
        ...params,
        serviceCompanyId: user!.userAccount.serviceCompany.id,
      }),
    {enabled: !!user, ...options},
  );
}

const appointmentNotification = async (serviceOrderId: string) =>
  axiosClient.post<StringValue>(
    `/api/serviceOrders/${serviceOrderId}/appointmentNotification`,
  );

export const useAppointmentNotification = () => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar, showError} = useSnackbar();
  return useMutation(
    (serviceOrderId: string) => appointmentNotification(serviceOrderId),
    {
      onSuccess: () => {
        enqueueSnackbar('Appointment notification sent successfully', {
          variant: 'success',
        });
        return queryClient.invalidateQueries([
          queryKeys.queryAppointmentConfirmationRequiredOrders,
        ]);
      },
      onError: (err) => {
        showError(err);
      },
    },
  );
};

const confirmAppointment = async (serviceOrderId: string) =>
  axiosClient.put<StringValue>(
    `/api/serviceOrders/${serviceOrderId}/appointment`,
  );

export const useConfirmAppointment = () => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar, showError} = useSnackbar();

  return useMutation(
    (serviceOrderId: string) => confirmAppointment(serviceOrderId),
    {
      onSuccess: () => {
        enqueueSnackbar('Appointment confirmed', {
          variant: 'success',
        });
        return queryClient.invalidateQueries([
          queryKeys.queryAppointmentConfirmationRequiredOrders,
        ]);
      },
      onError: (err) => {
        showError(err);
      },
    },
  );
};

export const postSendChecklist = async (
  id: string,
  body: SendServiceOrderCheckListRecord,
) => {
  await axiosClient.post<{value: string}>(
    `api/serviceOrders/${id}/checkList/send`,
    body,
  );
};

export const useSendChecklist = () => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar, showError} = useSnackbar();

  return useMutation(
    ({id, body}: {id: string; body: SendServiceOrderCheckListRecord}) =>
      postSendChecklist(id, body),
    {
      onSuccess: () => {
        enqueueSnackbar(`CheckList sent successfully`, {
          variant: 'success',
        });
        queryClient.invalidateQueries([queryKeys.getServiceOrderDetails]);
      },
      onError: (err) => {
        showError(err);
      },
    },
  );
};

export const postSendWorkReport = async (
  id: string,
  body: SendServiceOrderReportRecord,
) => {
  await axiosClient.post<{value: string}>(
    `api/serviceOrders/${id}/report/send`,
    body,
  );
};

export const useSendWorkReport = () => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar, showError} = useSnackbar();

  return useMutation(
    ({id, body}: {id: string; body: SendServiceOrderReportRecord}) =>
      postSendWorkReport(id, body),
    {
      onSuccess: () => {
        enqueueSnackbar(`Work report sent successfully`, {
          variant: 'success',
        });
        queryClient.invalidateQueries([queryKeys.getServiceOrderDetails]);
      },
      onError: (err) => {
        showError(err);
      },
    },
  );
};

export const deleteServiceOrderArticle = async (
  serviceOrder: string,
  serviceOrderArticleId: string,
) => {
  await axiosClient.delete(
    `api/serviceOrders/${serviceOrder}/articles/${serviceOrderArticleId}`,
  );
};

export const useDeleteServiceOrderArticle = () => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar, showError} = useSnackbar();

  return useMutation(
    ({
      serviceOrder,
      serviceOrderArticleId,
    }: {
      serviceOrder: string;
      serviceOrderArticleId: string;
    }) => deleteServiceOrderArticle(serviceOrder, serviceOrderArticleId),
    {
      onSuccess: () => {
        enqueueSnackbar(`Job Article deleted successfully`, {
          variant: 'success',
        });
        queryClient.invalidateQueries([queryKeys.fetchServiceJobArticles]);
        queryClient.invalidateQueries([queryKeys.getServiceOrderDetails]);
      },
      onError: (err) => {
        showError(err);
      },
    },
  );
};

const createServiceOrderArticle = async (
  serviceOrder: string,
  body: ServiceOrderArticleRecord,
) =>
  axiosClient.post<StringValue>(`/api/serviceOrders/${serviceOrder}/articles`, {
    ...body,
  });

export const useCreateServiceOrderArticle = () => {
  const {enqueueSnackbar, showError} = useSnackbar();
  const queryClient = useQueryClient();

  return useMutation(
    ({
      serviceOrder,
      body,
    }: {
      serviceOrder: string;
      body: ServiceOrderArticleRecord;
    }) => createServiceOrderArticle(serviceOrder, body),
    {
      onSuccess: () => {
        enqueueSnackbar('Service Job article added successfully', {
          variant: 'success',
        });
        queryClient.invalidateQueries([queryKeys.fetchServiceJobArticles]);
        queryClient.invalidateQueries([queryKeys.getServiceOrderDetails]);
      },
      onError: (err) => {
        showError(err);
      },
    },
  );
};

const fetchServiceJobArticles = async (serviceOrder: string) => {
  const response = await axiosClient.get<ServiceOrderArticleView[]>(
    `/api/serviceOrders/${serviceOrder}/articles`,
  );
  return response.data;
};

export const useServiceOrderArticles = (serviceOrder?: string) =>
  useQuery([queryKeys.fetchServiceJobArticles, serviceOrder], () =>
    fetchServiceJobArticles(serviceOrder!),
  );

export const putNewServiceOrderArticles = async (
  body: ServiceOrderArticleRecord,
  serviceOrder: string,
  serviceOrderArticleId: string,
) => {
  await axiosClient.put(
    `api/serviceOrders/${serviceOrder}/articles/${serviceOrderArticleId}`,
    body,
  );
};

export const useNewUpdateServiceOrderArticles = () => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar, showError} = useSnackbar();

  return useMutation(
    ({
      data,
      serviceOrder,
      serviceOrderArticleId,
    }: {
      data: ServiceOrderArticleRecord;
      serviceOrder: string;
      serviceOrderArticleId: string;
    }) => putNewServiceOrderArticles(data, serviceOrder, serviceOrderArticleId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([queryKeys.fetchServiceJobArticles]);
        queryClient.invalidateQueries([queryKeys.getServiceOrderDetails]);
        enqueueSnackbar(`Service Job updated successfully.`, {
          variant: 'success',
        });
      },
      onError: (err) => {
        showError(err);
      },
    },
  );
};

export const postServiceOrderConfirmationPublish = async (
  serviceOrder: string,
  body: ServiceOrderConfirmationPublishBody,
) => {
  await axiosClient.post(
    `/api/serviceOrders/${serviceOrder}/confirmation/publish`,
    body || {},
  );
};

export const usePostServiceOrderConfirmationPublish = () =>
  useMutation(
    ({
      data,
      serviceOrder,
    }: {
      data: ServiceOrderConfirmationPublishBody;
      serviceOrder: string;
    }) => postServiceOrderConfirmationPublish(serviceOrder, data),
  );

export const fetchServiceOrderComments = async (
  serviceOrderId: string,
  params: QueryServiceOrderCommentsParams,
): Promise<Resource<Comment>> => {
  const response = await axiosClient.get<Resource<Comment>>(
    `/api/serviceOrders/${serviceOrderId}/comments`,
    {
      params,
      paramsSerializer,
    },
  );

  return response.data;
};

export function useInvoiceComments(
  serviceOrderId: string,
  params: QueryServiceOrderCommentsParams,
  options?: UseQueryOptions<any, any, any>,
) {
  return useQuery<Resource<Comment>, RestError>(
    [queryKeys.fetchServiceOrderComments, params, serviceOrderId],
    () => fetchServiceOrderComments(serviceOrderId, params),
    {
      ...options,
    },
  );
}

export function useInfiniteServiceOrderComments(
  serviceOrderId: string,
  params: QueryServiceOrderCommentsParams,
  options?: UseInfiniteQueryOptions<any, any, any>,
) {
  return useInfiniteQuery<Resource<Comment>, RestError, Resource<Comment>>(
    [
      queryKeys.fetchServiceOrderComments,
      params,
      serviceOrderId,
      {infinite: true},
    ],
    ({pageParam = 0}) =>
      fetchServiceOrderComments(serviceOrderId, {
        ...params,
        pageIndex: pageParam,
      }),
    {
      getNextPageParam: (lastPage) => {
        const currentTotal =
          (lastPage.page.pageIndex + 1) * lastPage.page.pageSize;
        if (lastPage.total && currentTotal < lastPage.total) {
          return lastPage.page.pageIndex + 1;
        }
        return undefined;
      },
      ...options,
    },
  );
}

export const postServiceOrderComment = async (
  serviceOrderId: string,
  body: CreateServiceOrderComment,
) => {
  const {data} = await axiosClient.post<{value: string}>(
    `/api/serviceOrders/${serviceOrderId}/comments`,
    body,
  );
  return data;
};

export const useCreateserviceOrderComment = () =>
  useServiceOrderCommentMutation(
    ({
      serviceOrderId,
      body,
    }: {
      serviceOrderId: string;
      body: CreateServiceOrderComment;
    }) => postServiceOrderComment(serviceOrderId, body),
    queryKeys.fetchServiceOrderComments,
  );

export const deleteServiceOrderComment = async (
  serviceOrderId: string,
  noteId: string,
) => {
  const {data} = await axiosClient.delete<{value: string}>(
    `/api/serviceOrders/${serviceOrderId}/comments/${noteId}`,
  );
  return data;
};

export const useDeleteServiceOrderComment = () =>
  useServiceOrderCommentMutation<
    {value: string},
    {serviceOrderId: string; noteId: string}
  >(
    ({serviceOrderId, noteId}) =>
      deleteServiceOrderComment(serviceOrderId, noteId),
    queryKeys.fetchServiceOrderComments,
  );

export const updateServiceOrderComment = async (
  serviceOrderId: string,
  noteId: string,
  body: CreateServiceOrderComment,
) => {
  const {data} = await axiosClient.put<{value: string}>(
    `/api/serviceOrders/${serviceOrderId}/comments/${noteId}`,
    body,
  );
  return data;
};

export const useUpdateServiceOrderComment = () =>
  useServiceOrderCommentMutation<
    {value: string},
    {serviceOrderId: string; noteId: string; body: CreateServiceOrderComment}
  >(
    ({serviceOrderId, noteId, body}) =>
      updateServiceOrderComment(serviceOrderId, noteId, body),
    queryKeys.fetchServiceOrderComments,
  );

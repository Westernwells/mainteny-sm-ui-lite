import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from 'react-query';
import {AxiosResponse} from 'axios';
import {axiosClient, paramsSerializer} from 'utils/axios-utils';
import {queryKeys} from 'reactQuery/constants';
import {useNavigate} from 'react-router';
import {useSnackbar} from 'notistack';
import {
  CustomerElevatorParams,
  Elevator,
  ElevatorComment,
  ElevatorRequestBody,
  ElevatorView,
} from '../../models/elevator';
import {
  CacheTypes,
  CacheTypesParams,
  Page,
  Resource,
  RestError,
  StringValue,
} from '../../models/misc';
import {MaintainerView} from '../../models/technician';
import {useUserSession} from './useUserSession';

export const fetchElevators = async (query: string, page: Page, id: string) => {
  const response = await axiosClient.get<Resource<ElevatorView>>(
    `/api/serviceCompanies/${id}/elevators`,
    {
      params: {query, ...page},
      paramsSerializer,
    },
  );
  return response.data;
};

export const fetchElevator = async (elevatorId: string) => {
  const response = await axiosClient.get<Elevator>(
    `/api/elevators/${elevatorId}`,
  );
  return response.data;
};

export const fetchElevatorMaintainers = async (elevatorId: string) => {
  const response = await axiosClient.get<MaintainerView[]>(
    `/api/elevators/${elevatorId}/maintainers`,
  );
  return response.data;
};

export const fetchElevatorBreakdownHistory = async (elevatorId: string) => {
  const response: AxiosResponse<Resource<any>> = await axiosClient.post(
    `/api/elevators/${elevatorId}/breakdownHistories`,
    {
      data: {
        breakdownDate: '2022-01-03',
        createdAt: '2022-01-03T16:22:56.410Z',
        durationInMinutes: 0,
        serviceOrderId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        status: 'REPORTED',
      },
    },
  );
  return response.data;
};

export const useElevatorById = (elevatorId?: string) => {
  const navigate = useNavigate();
  return useQuery(
    [queryKeys.elevatorById, elevatorId],
    () => fetchElevator(elevatorId!),
    {
      enabled: !!elevatorId,
      onError: (e: any) => {
        if (e.response.status === 500) navigate('/404');
      },
    },
  );
};

export const useElevatorMaintainers = (elevatorId?: string) =>
  useQuery(
    [queryKeys.maintainerByElevatorId, elevatorId],
    () => fetchElevatorMaintainers(elevatorId!),
    {
      enabled: !!elevatorId,
    },
  );

export function useAllElevators(
  query: string,
  page: Page,
  filter: {status: string[]},
  options?: UseQueryOptions<any, any, any>,
) {
  const {user} = useUserSession();
  return useQuery<Resource<ElevatorView>, RestError>(
    [
      queryKeys.fetchAllElevators,
      query,
      page,
      user?.userAccount.serviceCompany.id,
    ],
    () => fetchElevators(query, page, user!.userAccount.serviceCompany.id),
    {
      ...options,
      enabled: !!user,
    },
  );
}

export const queryCustomerElevator = async (
  params: CustomerElevatorParams,

  id?: string,
) => {
  const response = await axiosClient.get<Resource<ElevatorView>>(
    `/api/propertyOwners/${id}/elevators`,
    {params, paramsSerializer},
  );
  return response.data;
};

export const useQueryCustomerElevator = (
  params: CustomerElevatorParams,
  filter: any,
  id?: string,
  options?: any,
) =>
  useQuery(
    [queryKeys.queryUnitsByCustomer, params, id],
    () => queryCustomerElevator(params, id!),
    {
      enabled: !!id,
      ...options,
    },
  );

const updateElevator = async (
  body: Partial<ElevatorRequestBody>,
  elevatorId: string,
) => {
  await axiosClient.put<StringValue>(`/api/elevators/${elevatorId}`, {
    ...body,
  });
};

export const useUpdateElevator = (successMsg: string) => {
  const {enqueueSnackbar} = useSnackbar();
  const queryClient = useQueryClient();
  return useMutation(
    ({
      body,
      elevatorId,
    }: {
      body: Partial<ElevatorRequestBody>;
      elevatorId: string;
    }) => updateElevator(body, elevatorId),
    {
      onSuccess: () => {
        enqueueSnackbar(successMsg, {
          variant: 'success',
        });
        queryClient.invalidateQueries(queryKeys.elevatorById);
      },
      onError: (err: any) => {
        console.log(err);
        enqueueSnackbar('Some error occurred, please try again.', {
          variant: 'error',
        });
      },
    },
  );
};

export const fetchCacheValues = async (
  params: CacheTypesParams,
  type: CacheTypes,
) => {
  const response = await axiosClient.get<Resource<string>>(
    `/api/values/${type}`,
    {
      params,
      paramsSerializer,
    },
  );
  return response.data;
};

export const useCacheValues = (params: CacheTypesParams, type: CacheTypes) =>
  useQuery(
    [queryKeys.queryCacheTypes, type, params],
    () => fetchCacheValues(params, type),
    {
      enabled: !!type,
    },
  );

export const fetchElevatorComment = async (
  params: Page,
  elevatorId: string,
) => {
  const response = await axiosClient.get<Resource<ElevatorComment>>(
    `/api/elevators/${elevatorId}/notes`,
    {
      params,
      paramsSerializer,
    },
  );
  return response.data;
};

export const useFetchElevatorComments = (params: Page, elevatorId: string) =>
  useQuery(
    [queryKeys.fetchElevatorComment, params, elevatorId],
    () => fetchElevatorComment(params, elevatorId),
    {
      enabled: !!elevatorId,
    },
  );

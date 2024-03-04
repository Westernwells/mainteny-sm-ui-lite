import {
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from 'react-query';
import {AxiosResponse} from 'axios';
import {axiosClient, paramsSerializer} from 'utils/axios-utils';
import {queryKeys} from 'reactQuery/constants';
import {useParams} from 'react-router-dom';
import {useSnackbar} from 'hooks/useSnackbar';
import {Mixpanel} from 'mixpanel/mixpanel';
import {mixpanelEvents} from 'mixpanel/constants';
import {
  CacheTypes,
  CacheTypesParams,
  Page,
  Resource,
  RestError,
  StringValue,
} from 'models/misc';
import {MaintainerView} from 'models/technician';
import {
  CustomerElevatorParams,
  ElevatorComment,
  ElevatorCommentRecord,
  ElevatorQueryParams,
  ElevatorRequestBody,
  ElevatorView,
  QueryTodoParams,
} from 'models/elevator';
import {useUserSession} from './useUserSession';

export const fetchElevators = async (
  params: Partial<ElevatorQueryParams>,
  id: string,
) => {
  const response = await axiosClient.get<Resource<ElevatorView>>(
    `/api/serviceCompanies/${id}/elevators`,
    {
      params,
      paramsSerializer,
    },
  );
  return response.data;
};

export const fetchElevator = async (elevatorId: string) => {
  const response = await axiosClient.get<ElevatorView>(
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
  const {showError} = useSnackbar();
  return useQuery(
    [queryKeys.elevatorById, elevatorId],
    () => fetchElevator(elevatorId!),
    {
      enabled: !!elevatorId,
      onError: (err: any) => {
        console.log(err);
        showError(err);
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
  params: Partial<ElevatorQueryParams>,
  options?: UseQueryOptions<any, any, any>,
) {
  const {user} = useUserSession();
  const {showError} = useSnackbar();
  return useQuery<Resource<ElevatorView>, RestError>(
    [queryKeys.fetchAllElevators, params, user?.userAccount.serviceCompany.id],
    () => fetchElevators(params, user!.userAccount.serviceCompany.id),
    {
      ...options,
      enabled: !!user,
      onError: (err: any) => {
        console.log(err);
        showError(err);
      },
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
  const {enqueueSnackbar, showError} = useSnackbar();
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
        showError(err);
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

export const queryElevatorComment = async (
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

export const useQueryElevatorComments = (params: Page, elevatorId: string) =>
  useQuery(
    [queryKeys.queryElevatorComment, params, elevatorId],
    () => queryElevatorComment(params, elevatorId),
    {
      enabled: !!elevatorId,
    },
  );

export const useInfiniteElevatorComments = (
  elevatorId: string,
  params: Page,
  options?: UseInfiniteQueryOptions<any, any, any>,
) =>
  useInfiniteQuery<
    Resource<ElevatorComment>,
    RestError,
    Resource<ElevatorComment>
  >(
    [queryKeys.queryElevatorComment, params, elevatorId, {infinite: true}],
    ({pageParam = 0}) =>
      queryElevatorComment({...params, pageIndex: pageParam}, elevatorId),
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

const updateElevatorComment = async (
  body: Partial<ElevatorCommentRecord>,
  elevatorId: string,
  noteId: string,
) => {
  await axiosClient.put<StringValue>(
    `/api/elevators/${elevatorId}/notes/${noteId}`,
    {
      ...body,
    },
  );
};

export const useUpdateElevatorComment = (successMsg?: string) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  const queryClient = useQueryClient();
  return useMutation(
    ({
      body,
      elevatorId,
      noteId,
    }: {
      body: ElevatorCommentRecord;
      elevatorId: string;
      noteId: string;
    }) => updateElevatorComment(body, elevatorId, noteId),
    {
      onSuccess: () => {
        if (successMsg) {
          enqueueSnackbar(successMsg, {
            variant: 'success',
          });
        }
        queryClient.invalidateQueries(queryKeys.queryElevatorComment);
      },
      onError: (err: any) => {
        console.log(err);
        showError(err);
      },
    },
  );
};

const addElevatorComment = async (
  body: Partial<ElevatorCommentRecord>,
  elevatorId: string,
) => {
  await axiosClient.post<StringValue>(`/api/elevators/${elevatorId}/notes`, {
    ...body,
  });
};

export const useAddElevatorComment = (successMsg?: string) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  const queryClient = useQueryClient();
  return useMutation(
    ({body, elevatorId}: {body: ElevatorCommentRecord; elevatorId: string}) =>
      addElevatorComment(body, elevatorId),
    {
      onSuccess: () => {
        if (successMsg) {
          enqueueSnackbar(successMsg, {
            variant: 'success',
          });
        }
        queryClient.invalidateQueries(queryKeys.queryElevatorComment);
      },
      onError: (err: any) => {
        console.log(err);
        showError(err);
      },
    },
  );
};

const deleteElevatorComment = async (elevatorId: string, noteId: string) => {
  await axiosClient.delete<StringValue>(
    `/api/elevators/${elevatorId}/notes/${noteId}`,
  );
};

export const useDeleteElevatorComment = (successMsg?: string) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  const queryClient = useQueryClient();
  return useMutation(
    ({elevatorId, noteId}: {elevatorId: string; noteId: string}) =>
      deleteElevatorComment(elevatorId, noteId),
    {
      onSuccess: () => {
        if (successMsg) {
          enqueueSnackbar(successMsg, {
            variant: 'success',
          });
        }
        queryClient.invalidateQueries(queryKeys.queryElevatorComment);
      },
      onError: (err: any) => {
        console.log(err);
        showError(err);
      },
    },
  );
};

const updateElevatorTechnician = async (
  body: {[key: string]: number},
  elevatorId: string,
) => {
  await axiosClient.put<StringValue>(
    `/api/elevators/${elevatorId}/maintainers`,
    {
      ...body,
    },
  );
};

export const useUpdateElevatorTechnician = (successMsg?: string) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  const queryClient = useQueryClient();

  return useMutation(
    ({body, elevatorId}: {body: {[key: string]: number}; elevatorId: string}) =>
      updateElevatorTechnician(body, elevatorId),
    {
      onSuccess: () => {
        if (successMsg) {
          enqueueSnackbar(successMsg, {
            variant: 'success',
          });
        }
        queryClient.invalidateQueries(queryKeys.elevatorById);
      },
      onError: (err: any) => {
        console.log(err);
        showError(err);
      },
    },
  );
};

const addElevator = async (body: Partial<ElevatorRequestBody>) => {
  const response = await axiosClient.post<StringValue>('/api/elevators', {
    ...body,
  });
  return response.data;
};

export const useAddElevator = (successMsg?: string) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  const queryClient = useQueryClient();
  return useMutation(
    (body: Partial<ElevatorRequestBody>) => addElevator(body),
    {
      onSuccess: (data, variables) => {
        if (successMsg) {
          enqueueSnackbar(successMsg, {
            variant: 'success',
          });
        }
        queryClient.invalidateQueries(queryKeys.elevatorById);
        Mixpanel.identifyAndTrack(mixpanelEvents.NEW_UNIT_CREATED, {
          elevatorId: data.value,
          propertyOwnerId: variables.propertyOwnerId,
        });
      },
      onError: (err: any) => {
        console.log(err);
        showError(err);
      },
    },
  );
};

export const getTodos = async (id: string, params: QueryTodoParams) => {
  const response = await axiosClient.get<Resource<ElevatorComment>>(
    `/api/elevators/${id}/todos`,
    {
      params,
      paramsSerializer,
    },
  );
  return response.data;
};

export const useTodos = (params: QueryTodoParams, options?: any) => {
  const {id: elevatorId} = useParams();
  return useQuery<Resource<ElevatorComment>, RestError>(
    [queryKeys.queryTodos, params],
    () => getTodos(elevatorId || '', params),
    {
      enabled: !!elevatorId,
      ...options,
    },
  );
};
export const postTodo = async (id: string, body: ElevatorCommentRecord) => {
  await axiosClient.post(`/api/elevators/${id}/todos`, body);
};

export const useCreateTodo = () => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar, showError} = useSnackbar();

  return useMutation(
    ({elevatorId, data}: {elevatorId: string; data: ElevatorCommentRecord}) =>
      postTodo(elevatorId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([queryKeys.queryTodos]);
        enqueueSnackbar(`Todo created successfully`, {
          variant: 'success',
        });
      },
      onError: (err) => {
        console.log(err);
        showError(err);
      },
    },
  );
};

export const putTodo = async (
  elevatorId: string,
  todoId: string,
  body: ElevatorCommentRecord,
) => {
  await axiosClient.put(`/api/elevators/${elevatorId}/todos/${todoId}`, body);
};

export const useUpdateTodo = () => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar, showError} = useSnackbar();

  return useMutation(
    ({
      elevatorId,
      todoId,
      data,
    }: {
      elevatorId: string;
      todoId: string;
      data: ElevatorCommentRecord;
    }) => putTodo(elevatorId, todoId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([queryKeys.queryTodos]);
        enqueueSnackbar(`Todo updated successfully`, {
          variant: 'success',
        });
      },
      onError: (err) => {
        console.log(err);
        showError(err);
      },
    },
  );
};

export const deleteTodo = async (elevatorId: string, todoId: string) => {
  await axiosClient.delete(`/api/elevators/${elevatorId}/todos/${todoId}`);
};

export const useDeleteTodo = () => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar, showError} = useSnackbar();

  return useMutation(
    ({elevatorId, todoId}: {elevatorId: string; todoId: string}) =>
      deleteTodo(elevatorId, todoId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([queryKeys.queryTodos]);
        enqueueSnackbar(`Todo deleted successfully`, {
          variant: 'success',
        });
      },
      onError: (err) => {
        console.log(err);
        showError(err);
      },
    },
  );
};

const deleteElevator = async (elevatorId: string) => {
  const response = await axiosClient.delete<StringValue>(
    `/api/elevators/${elevatorId}`,
  );
  return response.data;
};

export const useDeleteElevator = (successMsg?: string) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  const queryClient = useQueryClient();
  return useMutation((elevatorId: string) => deleteElevator(elevatorId), {
    onSuccess: () => {
      if (successMsg) {
        enqueueSnackbar(successMsg, {
          variant: 'success',
        });
        queryClient.invalidateQueries(queryKeys.fetchAllElevators);
        queryClient.invalidateQueries(queryKeys.queryUnitsByCustomer);
      }
    },
    onError: (err: any) => {
      console.log(err);
      showError(err);
    },
  });
};

import {Resource, RestError, StringValue} from 'models/misc';
import {
  CreateTaskBody,
  EXTRA_ASSIGNMENT_OPTIONS,
  QueryTasksParams,
  TaskStatistics,
  TaskView,
  UpdateTaskBody,
} from 'models/tasks';
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from 'react-query';
import {axiosClient, paramsSerializer} from 'utils/axios-utils';
import {queryKeys} from 'reactQuery/constants';
import {AxiosResponse} from 'axios';
import {useSnackbar} from 'hooks/useSnackbar';
import {removeUndefinedAndEmptyValues} from 'utils/utils';
import {useTranslation} from 'react-i18next';
import {useAll} from './useAll';
import {useUserSession} from './useUserSession';

export const queryTasks = async (
  params: QueryTasksParams,
  serviceCompanyId: string,
) => {
  const filteredParams = removeUndefinedAndEmptyValues(
    params ?? {},
  ) as QueryTasksParams;

  if (EXTRA_ASSIGNMENT_OPTIONS.includes(filteredParams.assignedEmployeeId!)) {
    delete filteredParams.assignedEmployeeId;
  }

  const response = await axiosClient.get<Resource<TaskView>>(
    `/api/serviceCompanies/${serviceCompanyId}/tasks`,
    {
      params: filteredParams,
      paramsSerializer,
    },
  );

  return response.data;
};

export const useQueryTasks = (
  params: QueryTasksParams,
  options?: UseQueryOptions<Resource<TaskView>, RestError, Resource<TaskView>>,
) => {
  const {user} = useUserSession();
  const serviceCompanyId = user?.userAccount.serviceCompany.id;

  return useQuery<Resource<TaskView>, RestError, Resource<TaskView>>(
    [queryKeys.queryTasks, params],
    () => queryTasks(params, serviceCompanyId!!),
    {
      ...options,
      enabled: !!user,
    },
  );
};

export const getTaskById = async (taskId: string) => {
  const response = await axiosClient.get<TaskView>(`/api/tasks/${taskId}`);

  return response.data;
};

export const useGetTaskById = (
  taskId?: string,
  options?: UseQueryOptions<TaskView, RestError>,
) =>
  useQuery<TaskView, RestError, TaskView>(
    [queryKeys.getTaskById, taskId],
    () => getTaskById(taskId!),
    {
      ...options,
      enabled: !!taskId,
    },
  );

export const useAllQueryTasks = (
  params: QueryTasksParams,
  options?: UseQueryOptions<TaskView[], RestError>,
) => {
  const {user} = useUserSession();
  const serviceCompanyId = user?.userAccount.serviceCompany.id;

  return useAll<QueryTasksParams, TaskView>({
    queryKey: [queryKeys.queryAllTasks, params],
    queryFn: () => queryTasks(params, serviceCompanyId!!),
    params,
    options: {
      ...options,
      enabled: !!user,
    },
  });
};

export const fetchTasksStatistics = async (
  params: QueryTasksParams,
  serviceCompanyId: string,
): Promise<TaskStatistics> => {
  const response: AxiosResponse<TaskStatistics> = await axiosClient.get(
    `/api/serviceCompanies/${serviceCompanyId}/tasks/statistics`,
    {
      params: {
        ...removeUndefinedAndEmptyValues(params ?? {}),
      },
      paramsSerializer,
    },
  );
  return response.data;
};

export const useTasksStatistics = (
  params: QueryTasksParams,
  options?: UseQueryOptions<TaskStatistics, RestError, TaskStatistics>,
) => {
  const {user} = useUserSession();

  const paramsCopied = {...params};
  delete paramsCopied.assignmentType;
  delete paramsCopied.assignedEmployeeId;

  return useQuery<TaskStatistics, RestError, TaskStatistics>(
    [
      queryKeys.fetchTasksStatistics,
      paramsCopied,
      user?.userAccount.serviceCompany.id,
    ],
    () =>
      fetchTasksStatistics(paramsCopied, user!.userAccount.serviceCompany.id),
    {
      enabled: !!user,
      ...options,
    },
  );
};

export const createTask = async (body: CreateTaskBody) =>
  axiosClient.post<StringValue>(`api/tasks`, body);

export const useCreateTask = (successMessage?: string) => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar, showError} = useSnackbar();
  const {t} = useTranslation();

  return useMutation((params: CreateTaskBody) => createTask(params), {
    onSuccess: () => {
      queryClient.invalidateQueries([queryKeys.queryTasks]);
      queryClient.invalidateQueries([queryKeys.fetchTasksStatistics]);

      enqueueSnackbar(successMessage ?? t('Task created successfully'), {
        variant: 'success',
      });
    },
    onError: (err) => {
      showError(err);
    },
  });
};

export const editTask = async (taskId: string, body: UpdateTaskBody) =>
  axiosClient.put<StringValue>(`api/tasks/${taskId}`, body);

export const useEditTask = (taskId?: string) => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar, showError} = useSnackbar();

  return useMutation((params: UpdateTaskBody) => editTask(taskId!, params), {
    onSuccess: () => {
      queryClient.invalidateQueries([queryKeys.queryTasks]);
      queryClient.invalidateQueries([queryKeys.fetchTasksStatistics]);
      queryClient.invalidateQueries([queryKeys.getTaskById, taskId]);

      enqueueSnackbar('Task edited successfully', {
        variant: 'success',
      });
    },
    onError: (err) => {
      showError(err);
    },
  });
};

export const deleteTask = async (id: string) =>
  axiosClient.delete(`api/tasks/${id}`);

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  const {showError} = useSnackbar();

  return useMutation((taskId: string) => deleteTask(taskId), {
    onSuccess: () => {
      queryClient.invalidateQueries([queryKeys.queryTasks]);
      queryClient.invalidateQueries([queryKeys.fetchTasksStatistics]);
    },
    onError: (err) => {
      showError(err);
    },
  });
};

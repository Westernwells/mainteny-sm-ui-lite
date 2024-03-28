import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from 'react-query';
import {queryKeys} from 'reactQuery/constants';
import {axiosClient, paramsSerializer} from 'utils/axios-utils';
import {useSnackbar} from 'hooks/useSnackbar';
import {Page, Resource, RestError, StringValue} from 'models/misc';
import {
  CheckList,
  CreateCheckListRecord,
  ServiceOrderCheckListView,
  UpdateCheckListRecord,
} from 'models/checklist';
import {useUserSession} from './useUserSession';

export const queryChecklists = async (
  serviceCompanyId: string,
  page: Page,
  query: string,
) => {
  const response = await axiosClient.get<Resource<CheckList>>(
    `/api/serviceCompanies/${serviceCompanyId}/checkLists`,
    {
      params: {
        query,
        ...page,
      },
      paramsSerializer,
    },
  );
  return response.data;
};

export const useQueryChecklists = (
  page: Page,
  query: string,
  options?: UseQueryOptions<any, any, any>,
) => {
  const {user} = useUserSession();
  return useQuery<Resource<CheckList>, RestError>(
    [queryKeys.queryChecklists, page, query],
    () => queryChecklists(user!.userAccount.serviceCompany.id, page, query),
    {
      enabled: !!user,
      ...options,
    },
  );
};

const createChecklist = async (
  body: CreateCheckListRecord,
): Promise<StringValue> => {
  const response = await axiosClient.post<StringValue>(
    '/api/checkLists/upload',
    {
      record: JSON.stringify(body),
    },
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );
  return response.data;
};

export const useCreateChecklist = (successMsg: string) => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar, showError} = useSnackbar();
  return useMutation((body: CreateCheckListRecord) => createChecklist(body), {
    onSuccess: () => {
      enqueueSnackbar(successMsg, {
        variant: 'success',
      });
      queryClient.invalidateQueries([queryKeys.queryChecklists]);
    },
    onError: (err) => {
      console.log(err);
      showError(err);
    },
  });
};

const updateChecklist = async (
  id: string,
  checklist: UpdateCheckListRecord,
) => {
  await axiosClient.put<StringValue>(
    `/api/checkLists/${id}/upload`,
    {
      record: JSON.stringify(checklist),
    },
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );
};

export const useUpdateChecklist = (successMsg?: string) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  const queryClient = useQueryClient();
  return useMutation(
    ({id, checklist}: {id: string; checklist: UpdateCheckListRecord}) =>
      updateChecklist(id, checklist),
    {
      onSuccess: () => {
        if (successMsg) {
          enqueueSnackbar(successMsg, {
            variant: 'success',
          });
        }
        queryClient.invalidateQueries(queryKeys.queryChecklists);
      },
      onError: (err: any) => {
        console.log(err);
        showError(err);
      },
    },
  );
};

const deleteChecklist = async (id: string) => {
  await axiosClient.delete<StringValue>(`/api/checkLists/${id}`);
};

export const useDeleteChecklist = (successMsg?: string) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  const queryClient = useQueryClient();
  return useMutation(({id}: {id: string}) => deleteChecklist(id), {
    onSuccess: () => {
      if (successMsg) {
        enqueueSnackbar(successMsg, {
          variant: 'success',
        });
      }
      queryClient.invalidateQueries(queryKeys.queryChecklists);
    },
    onError: (err: any) => {
      console.log(err);
      showError(err);
    },
  });
};

export const queryServiceOrderChecklists = async (
  serviceOrderId: string,
  params?: {technicianId?: string},
) => {
  const response = await axiosClient.get<ServiceOrderCheckListView[]>(
    `/api/serviceOrders/${serviceOrderId}/checkLists`,
    {
      params,
      paramsSerializer,
    },
  );
  return response.data;
};

export const useQueryServiceOrderChecklists = ({
  serviceOrderId,
  params,
  options,
}: {
  serviceOrderId: string;
  params?: {technicianId?: string};
  options?: UseQueryOptions<any, any, any>;
}) =>
  useQuery<ServiceOrderCheckListView[], RestError>(
    [queryKeys.queryServiceOrderChecklists, serviceOrderId],
    () => queryServiceOrderChecklists(serviceOrderId, params),
    {
      ...options,
    },
  );

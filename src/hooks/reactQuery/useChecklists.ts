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
  const response = await axiosClient.post<StringValue>('/api/checkLists', {
    ...body,
  });
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
  await axiosClient.put<StringValue>(`/api/checkLists/${id}`, {
    ...checklist,
  });
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

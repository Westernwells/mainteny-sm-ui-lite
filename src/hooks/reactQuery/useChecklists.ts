import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from 'react-query';
import {queryKeys} from 'reactQuery/constants';
import {axiosClient, paramsSerializer} from 'utils/axios-utils';
import {useSnackbar} from 'hooks/useSnackbar';
import {Resource, RestError, StringValue} from 'models/misc';
import {
  CheckList,
  CreateCheckListRecord,
  ServiceOrderCheckListView,
  UpdateCheckListRecord,
} from 'models/checklist';
import {CheckListAnswerRecord} from 'models/service-order';
import {useUserSession} from './useUserSession';
import {Page} from '../../models/pagination';

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

interface AssociateChecklistParam {
  serviceOrder: string;
}
export interface AssociateChecklistBody {
  checkListId: string;
  technicianId: string;
}

const associateChecklistToServiceOrder = async (
  params: AssociateChecklistParam,
  body: AssociateChecklistBody,
) => {
  const response = await axiosClient.post<ServiceOrderCheckListView>(
    `/api/serviceOrders/${params.serviceOrder}/checkLists`,
    {},
    {
      params: body,
    },
  );

  return response.data;
};

const uploadChecklistAnswer = async (
  params: AssociateChecklistParam,
  queryParams: AssociateChecklistBody,
  body: CheckListAnswerRecord[],
) => {
  const response = await axiosClient.put<StringValue>(
    `/api/serviceOrders/${params.serviceOrder}/checkList/answers`,
    body,
    {
      params: queryParams,
    },
  );

  return response.data;
};

export const useUploadChecklistAnswer = (successMsg: string) => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar, showError} = useSnackbar();
  return useMutation(
    ({
      params,
      queryParams,
      body,
    }: {
      params: AssociateChecklistParam;
      queryParams: AssociateChecklistBody;
      body: CheckListAnswerRecord[];
    }) => uploadChecklistAnswer(params, queryParams, body),
    {
      onSuccess: (_data, variables) => {
        enqueueSnackbar(successMsg, {
          variant: 'success',
        });

        queryClient.invalidateQueries([
          queryKeys.queryServiceOrderChecklists,
          variables.params.serviceOrder,
        ]);
        queryClient.invalidateQueries([
          queryKeys.getServiceOrderDetails,
          variables.params.serviceOrder,
        ]);
      },
      onError: (err) => {
        showError(err);
      },
    },
  );
};

const disassociateChecklistToServiceOrder = async (
  params: AssociateChecklistParam,
  body: AssociateChecklistBody,
) => {
  const response = await axiosClient.delete<ServiceOrderCheckListView>(
    `/api/serviceOrders/${params.serviceOrder}/checkLists`,
    {
      params: body,
    },
  );

  return response.data;
};

const associateMultiChecklistToServiceOrder = async (
  params: AssociateChecklistParam,
  bodies: AssociateChecklistBody[],
) => {
  const promises = bodies.map(async (item) => {
    const response = await axiosClient.post<ServiceOrderCheckListView>(
      `/api/serviceOrders/${params.serviceOrder}/checkLists`,
      {},
      {
        params: item,
      },
    );

    return response.data;
  });

  return Promise.all(promises);
};

export const useAssociateMultiChecklistToServiceOrder = (
  successMsg: string,
) => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar, showError} = useSnackbar();
  return useMutation(
    ({
      params,
      body,
    }: {
      params: AssociateChecklistParam;
      body: AssociateChecklistBody[];
    }) => associateMultiChecklistToServiceOrder(params, body),
    {
      onSuccess: (_data, variables) => {
        enqueueSnackbar(successMsg, {
          variant: 'success',
        });

        queryClient.invalidateQueries([
          queryKeys.queryServiceOrderChecklists,
          variables.params.serviceOrder,
        ]);
        queryClient.invalidateQueries([
          queryKeys.getServiceOrderDetails,
          variables.params.serviceOrder,
        ]);
      },
      onError: (err) => {
        showError(err);
      },
    },
  );
};

export const useAssociateChecklistToServiceOrder = (successMsg: string) => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar, showError} = useSnackbar();
  return useMutation(
    ({
      params,
      body,
    }: {
      params: AssociateChecklistParam;
      body: AssociateChecklistBody;
    }) => associateChecklistToServiceOrder(params, body),
    {
      onSuccess: (_data, variables) => {
        enqueueSnackbar(successMsg, {
          variant: 'success',
        });
        queryClient.invalidateQueries([
          queryKeys.queryServiceOrderChecklists,
          variables.params.serviceOrder,
        ]);
        queryClient.invalidateQueries([
          queryKeys.getServiceOrderDetails,
          variables.params.serviceOrder,
        ]);
      },
      onError: (err) => {
        showError(err);
      },
    },
  );
};

export const useDisassociateChecklistToServiceOrder = (successMsg: string) => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar, showError} = useSnackbar();
  return useMutation(
    ({
      params,
      body,
    }: {
      params: AssociateChecklistParam;
      body: AssociateChecklistBody;
    }) => disassociateChecklistToServiceOrder(params, body),
    {
      onSuccess: (_data, variables) => {
        enqueueSnackbar(successMsg, {
          variant: 'success',
        });
        queryClient.invalidateQueries([
          queryKeys.queryServiceOrderChecklists,
          variables.params.serviceOrder,
        ]);
        queryClient.invalidateQueries([
          queryKeys.getServiceOrderDetails,
          variables.params.serviceOrder,
        ]);
      },
      onError: (err) => {
        showError(err);
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

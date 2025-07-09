import {AxiosResponse} from 'axios';
import {axiosClient, paramsSerializer} from 'utils/axios-utils';
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from 'react-query';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {Resource, RestError, StringValue} from 'models/misc';
import {queryKeys} from 'reactQuery/constants';
import {useSnackbar} from 'hooks/useSnackbar';
import {
  AttachmentView,
  CreateAttachmentQuery,
  GetAttachmentQuery,
  UpdateAttachmentQuery,
} from 'models/attachment';

export const getAttachments = async ({
  serviceCompanyId,
  ...params
}: GetAttachmentQuery): Promise<Resource<AttachmentView>> => {
  const response: AxiosResponse<Resource<AttachmentView>> =
    await axiosClient.get(
      `/api/serviceCompanies/${serviceCompanyId}/attachments`,
      {
        params: {
          ...params,
        },
        paramsSerializer,
      },
    );
  return response.data;
};

export function useAttachments(
  params: Omit<GetAttachmentQuery, 'serviceCompanyId'>,
  options?: UseQueryOptions<any, any, any>,
) {
  const {user} = useUserSession();
  return useQuery<
    Resource<AttachmentView>,
    RestError,
    Resource<AttachmentView>
  >(
    [queryKeys.fetchAttachments, params, user?.userAccount.serviceCompany.id],
    () =>
      getAttachments({
        serviceCompanyId: user!.userAccount.serviceCompany.id,
        ...params,
      }),
    {
      enabled: !!user,
      ...options,
    },
  );
}

export const deleteAttachment = async (id: string) =>
  axiosClient.delete(`api/attachments/${id}`);

export const useDeleteAttachment = () => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar, showError} = useSnackbar();

  return useMutation(({id}: {id: string}) => deleteAttachment(id), {
    onSuccess: () => {
      queryClient.invalidateQueries([queryKeys.fetchAttachments]);

      enqueueSnackbar('Attachment was deleted', {
        variant: 'success',
      });
    },
    onError: (err) => {
      showError(err);
    },
  });
};

type UpdateAttachmentQueryPrams = {
  id: string;
} & UpdateAttachmentQuery;

export const updateAttachment = async ({
  id,
  ...body
}: UpdateAttachmentQueryPrams) =>
  axiosClient.put<StringValue>(`api/attachments/${id}`, body);

export const useUpdateAttachment = (message: string) => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar, showError} = useSnackbar();

  return useMutation(
    (params: UpdateAttachmentQueryPrams) => updateAttachment(params),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([queryKeys.fetchAttachments]);

        enqueueSnackbar(message, {
          variant: 'success',
        });
      },
      onError: (err) => {
        showError(err);
      },
    },
  );
};

export const createAttachment = async (body: CreateAttachmentQuery) =>
  axiosClient.post<StringValue>(`api/attachments/`, body);

export const useCreateAttachment = () => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar, showError} = useSnackbar();
  const {user} = useUserSession();

  return useMutation(
    (params: Omit<CreateAttachmentQuery, 'serviceCompanyId'>) =>
      createAttachment({
        serviceCompanyId: user!.userAccount.serviceCompany.id,
        ...params,
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([queryKeys.fetchAttachments]);

        enqueueSnackbar('Attachment added successfully', {
          variant: 'success',
        });
      },
      onError: (err) => {
        showError(err);
      },
    },
  );
};

type MoveAttachmentQueryPrams = {
  attachmentId: string;
  parentId: string | null;
};

export const moveAttachment = async (body: MoveAttachmentQueryPrams) =>
  axiosClient.put<StringValue>(`api/attachments/move`, body);

export const useMoveAttachment = (
  message = 'Attachment has been moved successfully',
) => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar, showError} = useSnackbar();

  return useMutation(
    (params: MoveAttachmentQueryPrams) => moveAttachment(params),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([queryKeys.fetchAttachments]);

        enqueueSnackbar(message, {
          variant: 'success',
        });
      },
      onError: (err) => {
        showError(err);
      },
    },
  );
};

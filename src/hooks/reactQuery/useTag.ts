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
import {
  GetTagsQuery,
  Tag,
  TagStatistics,
  TagStatisticsQuery,
  UpdateTagRecord,
} from 'models/tag';
import {useSnackbar} from 'hooks/useSnackbar';

export const getTags = async ({
  serviceCompanyId,
  ...params
}: GetTagsQuery): Promise<Resource<Tag>> => {
  const response: AxiosResponse<Resource<Tag>> = await axiosClient.get(
    `/api/serviceCompanies/${serviceCompanyId}/tags`,
    {
      params: {
        ...params,
      },
      paramsSerializer,
    },
  );
  return response.data;
};

export function useTags(
  params: Omit<GetTagsQuery, 'serviceCompanyId'>,
  options?: UseQueryOptions<any, any, any>,
) {
  const {user} = useUserSession();
  return useQuery<Resource<Tag>, RestError, Resource<Tag>>(
    [queryKeys.fetchTags, params, user?.userAccount.serviceCompany.id],
    () =>
      getTags({
        serviceCompanyId: user!.userAccount.serviceCompany.id,
        ...params,
      }),
    {
      enabled: !!user,
      ...options,
    },
  );
}

export const deleteTag = async (id: string) =>
  axiosClient.delete(`api/tags/${id}`);

export const useDeleteTag = () => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar, showError} = useSnackbar();

  return useMutation(({tagId}: {tagId: string}) => deleteTag(tagId), {
    onSuccess: () => {
      queryClient.invalidateQueries([queryKeys.fetchTags]);

      enqueueSnackbar('Tag was deleted', {
        variant: 'success',
      });
    },
    onError: (err) => {
      showError(err);
    },
  });
};

type UpdateTagQueryPrams = {
  tagId: string;
} & UpdateTagRecord;

export const updateTag = async ({tagId, ...body}: UpdateTagQueryPrams) =>
  axiosClient.put<StringValue>(`api/tags/${tagId}`, body);

export const useUpdateTag = (message: string) => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar, showError} = useSnackbar();

  return useMutation((params: UpdateTagQueryPrams) => updateTag(params), {
    onSuccess: () => {
      queryClient.invalidateQueries([queryKeys.fetchTags]);
      queryClient.invalidateQueries([queryKeys.fetchArticles]);

      enqueueSnackbar(message, {
        variant: 'success',
      });
    },
    onError: (err) => {
      showError(err);
    },
  });
};

type CreateTagQueryPrams = {
  serviceCompanyId: string;
} & UpdateTagRecord;

export const createTag = async (body: CreateTagQueryPrams) =>
  axiosClient.post<StringValue>(`api/tags/`, body);

export const useCreateTag = () => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar, showError} = useSnackbar();
  const {user} = useUserSession();

  return useMutation(
    (params: UpdateTagRecord) =>
      createTag({
        serviceCompanyId: user!.userAccount.serviceCompany.id,
        ...params,
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([queryKeys.fetchTags]);
        queryClient.invalidateQueries([queryKeys.fetchTagStatistics]);

        enqueueSnackbar('Tag created successfully', {
          variant: 'success',
        });
      },
      onError: (err) => {
        showError(err);
      },
    },
  );
};

export const fetchTagStatistics = async (
  params: TagStatisticsQuery,
  serviceCompanyId: string,
): Promise<TagStatistics> => {
  const response: AxiosResponse<TagStatistics> = await axiosClient.get(
    `/api/serviceCompanies/${serviceCompanyId}/tags/statistics`,
    {
      params: {
        ...params,
      },
      paramsSerializer,
    },
  );
  return response.data;
};

export const useTagStatistics = (
  params: TagStatisticsQuery,
  options?: UseQueryOptions<any, any, any>,
) => {
  const {user} = useUserSession();
  return useQuery<TagStatistics, RestError, TagStatistics>(
    [queryKeys.fetchTagStatistics, params, user?.userAccount.serviceCompany.id],
    () => fetchTagStatistics(params, user!.userAccount.serviceCompany.id),
    {
      enabled: !!user,
      ...options,
    },
  );
};

import {Resource, RestError, StringValue} from 'models/misc';
import {
  CreateTextBlockRecord,
  QueryTextBlockParams,
  TextBlockFilters,
  TextBlockView,
  UpdateTextBlockRecord,
} from 'models/text-block';
import {axiosClient, paramsSerializer} from 'utils/axios-utils';
import {queryKeys, queryKeys as qk} from 'reactQuery/constants';
import {useSnackbar} from 'hooks/useSnackbar';
import {useMutation, useQueryClient, useQuery} from 'react-query';
import {useCallback} from 'react';
import {useUserSession} from './useUserSession';

export const fetchTextBlocks = async (
  params: QueryTextBlockParams,
  id: string,
): Promise<Resource<TextBlockView>> => {
  const response = await axiosClient.get<Resource<TextBlockView>>(
    `/api/serviceCompanies/${id}/textBlocks`,
    {
      params,
      paramsSerializer,
    },
  );

  return response.data;
};

const filterTextBlocks = (textBlockRes: Resource<TextBlockView>) => {
  const result = {...textBlockRes};

  return result;
};

export function useTextBlocks(
  params: QueryTextBlockParams,
  filters: TextBlockFilters,
  options?: any,
) {
  const {user} = useUserSession();
  return useQuery<Resource<TextBlockView>, RestError>(
    [qk.fetchTextBlocks, params, user?.userAccount.id],
    () => fetchTextBlocks(params, user!.userAccount.serviceCompany.id),
    {
      enabled: !!user,
      ...options,
      select: useCallback(
        (textBlockRes: Resource<TextBlockView>) => {
          const filterResult = filterTextBlocks(textBlockRes);
          return filterResult;
        },
        [filters],
      ),
    },
  );
}

const fetchTextBlockDetails = async (textBlockId: string) => {
  const response = await axiosClient.get<TextBlockView>(
    `/api/textBlocks/${textBlockId}`,
  );
  return response.data;
};

export const useTextBlockDetails = (textBlockId?: string) =>
  useQuery([qk.fetchTextBlockDetail, textBlockId], () =>
    fetchTextBlockDetails(textBlockId!),
  );

const createTextBlock = async (
  body: CreateTextBlockRecord,
): Promise<StringValue> => {
  const response = await axiosClient.post<StringValue>('/api/textBlocks', {
    ...body,
  });
  return response.data;
};

export const useCreateTextBlock = (successMsg: string | JSX.Element) => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar, showError} = useSnackbar();
  return useMutation((body: CreateTextBlockRecord) => createTextBlock(body), {
    onSuccess: () => {
      enqueueSnackbar(successMsg, {
        variant: 'success',
        autoHideDuration: 3000,
      });
      queryClient.invalidateQueries([queryKeys.fetchTextBlocks]);
    },
    onError: (err) => {
      showError(err);
    },
  });
};

const updateTextBlock = async (
  textBlockId: string,
  textBlock: UpdateTextBlockRecord,
) => {
  await axiosClient.put<StringValue>(`/api/textBlocks/${textBlockId}`, {
    ...textBlock,
  });
};

export const useUpdateTextBlock = (successMsg?: string) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  const queryClient = useQueryClient();
  return useMutation(
    ({
      textBlockId,
      textBlock,
    }: {
      textBlockId: string;
      textBlock: UpdateTextBlockRecord;
    }) => updateTextBlock(textBlockId, textBlock),
    {
      onSuccess: () => {
        if (successMsg) {
          enqueueSnackbar(successMsg, {
            variant: 'success',
          });
        }
        queryClient.invalidateQueries(queryKeys.fetchTextBlockDetail);
        queryClient.invalidateQueries(queryKeys.fetchTextBlocks);
      },
      onError: (err: any) => {
        showError(err);
      },
    },
  );
};

const deleteTextBlock = async (textBlockId: string) => {
  await axiosClient.delete<StringValue>(`/api/textBlocks/${textBlockId}`);
};

export const useDeleteTextBlock = (successMsg?: string) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  const queryClient = useQueryClient();
  return useMutation(
    ({textBlockId}: {textBlockId: string}) => deleteTextBlock(textBlockId),
    {
      onSuccess: () => {
        if (successMsg) {
          enqueueSnackbar(successMsg, {
            variant: 'success',
          });
        }
        queryClient.invalidateQueries(queryKeys.fetchTextBlocks);
      },
      onError: (err: any) => {
        showError(err);
      },
    },
  );
};

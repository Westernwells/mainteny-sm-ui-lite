import {RequestParameters} from 'models/apiRequests';
import {
  Comment,
  CreateCommentBody,
  QueryCommentsParams,
  UpdateCommentBody,
} from 'models/comment';
import {Resource, RestError} from 'models/misc';
import {
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';
import {queryKeys} from 'reactQuery/constants';
import {axiosClient, paramsSerializer} from 'utils/axios-utils';
import {useSnackbar} from 'hooks/useSnackbar';
import * as Sentry from '@sentry/react';

export const fetchComments = async (
  params: QueryCommentsParams,
): Promise<Resource<Comment>> => {
  const response = await axiosClient.get<Resource<Comment>>(`/api/comments`, {
    params,
    paramsSerializer,
  });

  return response.data;
};

export function useInfiniteComments(
  params: QueryCommentsParams,
  options?: UseInfiniteQueryOptions<any, any, any>,
) {
  return useInfiniteQuery<Resource<Comment>, RestError, Resource<Comment>>(
    [queryKeys.fetchComments, params, {infinite: true}],
    ({pageParam = 0}) =>
      fetchComments({
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

export function useComments(
  params: QueryCommentsParams,
  requestParams?: RequestParameters,
) {
  return useQuery<Resource<Comment>, RestError, Resource<Comment>>({
    queryKey: [queryKeys.fetchComments, params, {infinite: true}],
    queryFn: ({pageParam = 0}) =>
      fetchComments({
        ...params,
        pageIndex: pageParam,
      }),
    enabled: requestParams?.enabled ?? true,
  });
}

export const postComment = async (body: CreateCommentBody) => {
  const {data} = await axiosClient.post<{value: string}>(`/api/comments`, body);
  return data;
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();
  const {showError} = useSnackbar();

  return useMutation(({body}: {body: CreateCommentBody}) => postComment(body), {
    onSuccess: () => {
      queryClient.invalidateQueries([queryKeys.fetchComments]);
    },
    onError: (err) => {
      Sentry.captureException(err);
      showError(err);
    },
  });
};

export const deleteComment = async (noteId: string) => {
  const {data} = await axiosClient.delete<{value: string}>(
    `/api/comments/${noteId}`,
  );
  return data;
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();
  const {showError} = useSnackbar();

  return useMutation(({noteId}: {noteId: string}) => deleteComment(noteId), {
    onSuccess: () => {
      queryClient.invalidateQueries([queryKeys.fetchComments]);
    },
    onError: (err) => {
      Sentry.captureException(err);
      showError(err);
    },
  });
};
export const updateComment = async (
  noteId: string,
  body: UpdateCommentBody,
) => {
  const {data} = await axiosClient.put<{value: string}>(
    `/api/comments/${noteId}`,
    body,
  );
  return data;
};

export const useUpdateComment = () => {
  const queryClient = useQueryClient();
  const {showError} = useSnackbar();

  return useMutation(
    ({noteId, body}: {noteId: string; body: UpdateCommentBody}) =>
      updateComment(noteId, body),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([queryKeys.fetchComments]);
      },
      onError: (err) => {
        Sentry.captureException(err);
        showError(err);
      },
    },
  );
};

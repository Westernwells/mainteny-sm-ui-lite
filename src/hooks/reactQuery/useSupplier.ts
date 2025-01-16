import {
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useMutation,
  useQueryClient,
} from 'react-query';
import {axiosClient, paramsSerializer} from 'utils/axios-utils';
import {queryKeys as qk} from 'reactQuery/constants';
import {Comment} from 'models/comment';
import {Resource, RestError} from 'models/misc';
import {QuerySupplierCommentsParams, SupplierComment} from 'models/supplier';
import {useSnackbar} from 'hooks/useSnackbar';

export const fetchSupplierComments = async (
  supplierId: string,
  params: QuerySupplierCommentsParams,
): Promise<Resource<Comment>> => {
  const response = await axiosClient.get<Resource<Comment>>(
    `/api/articleSuppliers/${supplierId}/comments`,
    {
      params,
      paramsSerializer,
    },
  );

  return response.data;
};

export function useInfiniteSupplierComments(
  supplierId: string,
  params: QuerySupplierCommentsParams,
  options?: UseInfiniteQueryOptions<any, any, any>,
) {
  return useInfiniteQuery<Resource<Comment>, RestError, Resource<Comment>>(
    [qk.fetchSupplierComments, params, supplierId, {infinite: true}],
    ({pageParam = 0}) =>
      fetchSupplierComments(supplierId, {...params, pageIndex: pageParam}),
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

export const createSupplierComment = async (
  supplierId: string,
  body: SupplierComment,
) => {
  const response = await axiosClient.post<{value: string}>(
    `/api/articleSuppliers/${supplierId}/comments`,
    body,
  );
  return response.data;
};

export const useCreateSupplierComment = () => {
  const queryClient = useQueryClient();
  const {showError} = useSnackbar();

  return useMutation(
    ({id, body}: {id: string; body: SupplierComment}) =>
      createSupplierComment(id, body),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([qk.fetchSupplierComments]);
      },
      onError: (err) => {
        showError(err);
      },
    },
  );
};

export const deleteSupplierComment = async (id: string, commentId: string) => {
  const response = await axiosClient.delete<{value: string}>(
    `/api/articleSuppliers/${id}/comments/${commentId}`,
  );
  return response.data;
};

export const useDeleteSupplierComment = () => {
  const queryClient = useQueryClient();
  const {showError} = useSnackbar();

  return useMutation(
    ({id, noteId}: {id: string; noteId: string}) =>
      deleteSupplierComment(id, noteId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([qk.fetchSupplierComments]);
      },
      onError: (err) => {
        showError(err);
      },
    },
  );
};

export const updateSupplierComment = async (
  id: string,
  commentId: string,
  body: SupplierComment,
) => {
  const response = await axiosClient.put<{value: string}>(
    `/api/articleSuppliers/${id}/comments/${commentId}`,
    body,
  );
  return response.data;
};

export const useUpdateSupplierComment = () => {
  const queryClient = useQueryClient();
  const {showError} = useSnackbar();

  return useMutation(
    ({id, noteId, body}: {id: string; noteId: string; body: SupplierComment}) =>
      updateSupplierComment(id, noteId, body),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([qk.fetchSupplierComments]);
      },
      onError: (err) => {
        showError(err);
      },
    },
  );
};

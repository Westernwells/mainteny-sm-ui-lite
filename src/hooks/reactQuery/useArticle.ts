import {useCallback} from 'react';
import {
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from 'react-query';
import {queryKeys, queryKeys as qk} from 'reactQuery/constants';
import {axiosClient, paramsSerializer} from 'utils/axios-utils';
import {useSnackbar} from 'hooks/useSnackbar';
import _ from 'lodash';
import {
  ArticleComment,
  ArticleOrderView,
  ArticleStatistics,
  ArticleView,
  CreateArticleOrderRecord,
  CreateArticleRecord,
  PropertyOwnerArticleRecord,
  QueryArticleCommentsParams,
  QueryArticleParams,
  UpdateArticleRecord,
} from 'models/article';
import {Comment} from 'models/comment';
import {Resource, RestError, StringValue, WithOptional} from 'models/misc';
import {data} from 'utils/partial-article-data';
import {FileResourceRecord} from 'models/media';
import {useAll} from 'hooks/reactQuery/useAll';
import {AxiosResponse} from 'axios';
import {
  ArticleSupplierView,
  CreateArticleSupplierRecord,
  QueryArticleSuppliersParams,
  UpdateArticleSupplierRecord,
} from '../../models/supplier';
import {useUserSession} from './useUserSession';

export const fetchArticles = async (
  params: QueryArticleParams,
  id: string,
): Promise<Resource<ArticleView>> => {
  params = <QueryArticleParams>_.omitBy(params, (it) => !it);
  const response = await axiosClient.get<Resource<ArticleView>>(
    `/api/serviceCompanies/${id}/articles`,
    {
      params,
      paramsSerializer,
    },
  );
  return response.data;
};

// To support the "Partial Invoicing" we use a unique Article which is of category PARTIAL.
// This "Partial Invoice" article is created automatically and is limited to 1 per service company.
// "Partial Invoice" article should not be displayed in the article listing.
// Due to this reason we filter out the "PARTIAL" category by default.

export function useArticles(
  params: QueryArticleParams,
  options?: any,
  showPartial?: boolean,
) {
  const {user} = useUserSession();
  return useQuery<Resource<ArticleView>, RestError>(
    [qk.fetchArticles, params, user?.userAccount.id],
    () => fetchArticles(params, user!.userAccount.serviceCompany.id),
    {
      enabled: !!user,
      select: useCallback(
        (articlesRes: Resource<ArticleView>) => {
          const filteredRes = articlesRes.data.filter(
            (i) => i.unit !== 'PARTIAL',
          );

          return showPartial
            ? articlesRes
            : {
                data: filteredRes,
                page: {
                  pageIndex: articlesRes.page.pageIndex,
                  pageSize: filteredRes.length,
                },
                total:
                  articlesRes.total -
                  (articlesRes.data.length - filteredRes.length),
              };
        },
        [showPartial],
      ),
      ...options,
    },
  );
}

const fetchArticleDetails = async (articleId: string) => {
  const response = await axiosClient.get<ArticleView>(
    `/api/articles/${articleId}`,
  );
  return response.data;
};
export const useArticleDetails = (articleId?: string) =>
  useQuery([qk.fetchArticleDetail, articleId], () =>
    fetchArticleDetails(articleId!),
  );

const createArticle = async (
  body: CreateArticleRecord,
): Promise<StringValue> => {
  const response = await axiosClient.post<StringValue>('/api/articles', {
    ...body,
  });
  return response.data;
};

export const useCreateArticle = (successMsg: string) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  return useMutation((body: CreateArticleRecord) => createArticle(body), {
    onSuccess: () => {
      enqueueSnackbar(successMsg, {
        variant: 'success',
      });
    },
    onError: (err) => {
      showError(err);
    },
  });
};

const deleteArticle = async (articleId: string) => {
  await axiosClient.delete<StringValue>(`/api/articles/${articleId}`);
};

export const useDeleteArticle = (successMsg?: string) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  const queryClient = useQueryClient();
  return useMutation(
    ({articleId}: {articleId: string}) => deleteArticle(articleId),
    {
      onSuccess: () => {
        if (successMsg) {
          enqueueSnackbar(successMsg, {
            variant: 'success',
          });
        }
        queryClient.invalidateQueries(queryKeys.fetchArticles);
      },
      onError: (err: any) => {
        showError(err);
      },
    },
  );
};

const updateArticle = async (
  articleId: string,
  article: UpdateArticleRecord,
) => {
  await axiosClient.put<StringValue>(`/api/articles/${articleId}`, {
    ...article,
  });
};

export const useUpdateArticle = (successMsg?: string) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  const queryClient = useQueryClient();
  return useMutation(
    ({articleId, article}: {articleId: string; article: UpdateArticleRecord}) =>
      updateArticle(articleId, article),
    {
      onSuccess: () => {
        if (successMsg) {
          enqueueSnackbar(successMsg, {
            variant: 'success',
          });
        }
        queryClient.invalidateQueries(queryKeys.fetchArticleDetail);
      },
      onError: (err: any) => {
        showError(err);
      },
    },
  );
};

export const postPartialArticle = async (serviceCompanyId?: string) => {
  if (serviceCompanyId)
    await axiosClient.post('api/articles', {
      ...data,
      serviceCompanyId,
    });
};

export const useCreatePartialArticle = () => {
  const queryClient = useQueryClient();
  const {user} = useUserSession();
  const {enqueueSnackbar, showError} = useSnackbar();
  return useMutation(
    () => postPartialArticle(user!.userAccount.serviceCompany.id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([qk.fetchArticles]);
        enqueueSnackbar(`Partial invoicing is supported`, {
          variant: 'success',
        });
      },
      onError: (err) => {
        showError(err);
      },
    },
  );
};

const getArticleOrder = async (orderId: string) => {
  const response = await axiosClient.get<ArticleOrderView>(
    `/api/articleOrders/${orderId}`,
  );
  return response.data;
};

export const useArticleOrder = (
  orderId?: string,
  options?: UseQueryOptions<any, any, any>,
) =>
  useQuery<ArticleOrderView, RestError>(
    [qk.fetchArticleOrder, orderId],
    () => getArticleOrder(orderId!),
    {enabled: !!orderId, ...options},
  );

const createArticleOrder = async (
  body: CreateArticleOrderRecord,
): Promise<StringValue> => {
  const response = await axiosClient.post<StringValue>('/api/articleOrders', {
    ...body,
  });
  return response.data;
};

export const useCreateArticleOrder = (successMsg: string | JSX.Element) => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar, showError} = useSnackbar();
  return useMutation(
    (body: CreateArticleOrderRecord) => createArticleOrder(body),
    {
      onSuccess: () => {
        enqueueSnackbar(successMsg, {
          variant: 'info',
          autoHideDuration: 12000,
        });
        queryClient.invalidateQueries([queryKeys.fetchArticleOrder]);
      },
      onError: (err) => {
        showError(err);
      },
    },
  );
};

export const queryArticleSuppliers = async (
  params: QueryArticleSuppliersParams,
) => {
  const response = await axiosClient.get<Resource<ArticleSupplierView>>(
    `/api/serviceCompanies/${params.serviceCompanyId}/articleSuppliers`,
    {
      params,
      paramsSerializer,
    },
  );
  return response.data;
};

export const useQueryArticleSuppliers = (
  params: WithOptional<QueryArticleSuppliersParams, 'serviceCompanyId'>,
  options?: UseQueryOptions<any, any, any>,
) => {
  const {user} = useUserSession();
  return useQuery<Resource<ArticleSupplierView>, RestError>(
    [queryKeys.queryArticleSuppliers, params],
    () =>
      queryArticleSuppliers({
        ...params,
        serviceCompanyId: user!.userAccount.serviceCompany.id,
      }),
    {
      enabled: !!user,
      ...options,
    },
  );
};

const createArticleSupplier = async (
  body: CreateArticleSupplierRecord,
): Promise<StringValue> => {
  const response = await axiosClient.post<StringValue>(
    '/api/articleSuppliers',
    {
      ...body,
    },
  );
  return response.data;
};

export const useCreateArticleSupplier = (successMsg: string) => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar, showError} = useSnackbar();
  return useMutation(
    (body: CreateArticleSupplierRecord) => createArticleSupplier(body),
    {
      onSuccess: () => {
        enqueueSnackbar(successMsg, {
          variant: 'success',
        });
        queryClient.invalidateQueries([queryKeys.fetchArticleSuppliers]);
      },
      onError: (err) => {
        showError(err);
      },
    },
  );
};

const getArticleSupplier = async (id: string) => {
  const response = await axiosClient.get<ArticleSupplierView>(
    `/api/articleSuppliers/${id}`,
  );
  return response.data;
};

export const useArticleSupplier = (
  id?: string,
  options?: UseQueryOptions<any, any, any>,
) =>
  useQuery<ArticleSupplierView, RestError>(
    [qk.fetchArticleSupplier, id],
    () => getArticleSupplier(id!),
    {enabled: !!id, ...options},
  );

const updateSupplier = async (
  id: string,
  supplier: UpdateArticleSupplierRecord,
) => {
  await axiosClient.put<StringValue>(`/api/articleSuppliers/${id}`, {
    ...supplier,
  });
};

export const useUpdateSupplier = (successMsg?: string) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  const queryClient = useQueryClient();
  return useMutation(
    ({id, supplier}: {id: string; supplier: UpdateArticleSupplierRecord}) =>
      updateSupplier(id, supplier),
    {
      onSuccess: () => {
        if (successMsg) {
          enqueueSnackbar(successMsg, {
            variant: 'success',
          });
        }
        queryClient.invalidateQueries(queryKeys.fetchArticleSupplier);
      },
      onError: (err: any) => {
        showError(err);
      },
    },
  );
};

const deleteSupplier = async (id: string) => {
  await axiosClient.delete<StringValue>(`/api/articleSuppliers/${id}`);
};

export const useDeleteSupplier = (successMsg?: string) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  const queryClient = useQueryClient();
  return useMutation(({id}: {id: string}) => deleteSupplier(id), {
    onSuccess: () => {
      if (successMsg) {
        enqueueSnackbar(successMsg, {
          variant: 'success',
        });
      }
      queryClient.invalidateQueries(queryKeys.queryArticleSuppliers);
    },
    onError: (err: any) => {
      showError(err);
    },
  });
};

export const fetchPropertyOwnerArticles = async (
  propertyOwnerId: string,
  params: QueryArticleParams,
): Promise<Resource<ArticleView>> => {
  const response = await axiosClient.get<Resource<ArticleView>>(
    `/api/propertyOwners/${propertyOwnerId}/articles`,
    {
      params,
      paramsSerializer,
    },
  );
  return response.data;
};

export function usePropertyOwnerArticles(
  propertyOwnerId: string,
  params: QueryArticleParams,
  options?: any,
) {
  const {user} = useUserSession();
  return useQuery<Resource<ArticleView>, RestError>(
    [qk.fetchPropertyOwnerArticles, params, propertyOwnerId],
    () => fetchPropertyOwnerArticles(propertyOwnerId, params),
    {
      enabled: !!user && !!propertyOwnerId,
      ...options,
    },
  );
}

const createPropertyOwnerArticle = async ({
  propertyOwnerId,
  body,
}: {
  propertyOwnerId: string;
  body: PropertyOwnerArticleRecord;
}): Promise<StringValue> => {
  const response = await axiosClient.post<StringValue>(
    `/api/propertyOwners/${propertyOwnerId}/articles`,
    {
      ...body,
    },
  );
  return response.data;
};

export const useCreatePropertyOwnerArticle = (successMsg?: string) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  const queryClient = useQueryClient();
  return useMutation(createPropertyOwnerArticle, {
    onSuccess: () => {
      if (successMsg) {
        enqueueSnackbar(successMsg, {
          variant: 'success',
        });
      }
      queryClient.invalidateQueries(queryKeys.fetchPropertyOwnerArticles);
    },
    onError: (err) => {
      showError(err);
    },
  });
};

const updatePropertyOwnerArticle = async ({
  propertyOwnerId,
  articleId,
  article,
}: {
  propertyOwnerId: string;
  articleId: string;
  article: PropertyOwnerArticleRecord;
}) => {
  await axiosClient.put<StringValue>(
    `/api/propertyOwners/${propertyOwnerId}/articles/${articleId}`,
    {
      ...article,
    },
  );
};

export const useUpdatePropertyOwnerArticle = (successMsg?: string) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  const queryClient = useQueryClient();
  return useMutation(updatePropertyOwnerArticle, {
    onSuccess: () => {
      if (successMsg) {
        enqueueSnackbar(successMsg, {
          variant: 'success',
        });
      }
      queryClient.invalidateQueries(queryKeys.fetchPropertyOwnerArticles);
    },
    onError: (err: any) => {
      showError(err);
    },
  });
};

const deletePropertyOwnerArticle = async ({
  propertyOwnerId,
  articleId,
}: {
  propertyOwnerId: string;
  articleId: string;
}) => {
  await axiosClient.delete<StringValue>(
    `/api/propertyOwners/${propertyOwnerId}/articles/${articleId}`,
  );
};

export const useDeletePropertyOwnerArticle = (successMsg?: string) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  const queryClient = useQueryClient();
  return useMutation(deletePropertyOwnerArticle, {
    onSuccess: () => {
      if (successMsg) {
        enqueueSnackbar(successMsg, {
          variant: 'success',
        });
      }
      queryClient.invalidateQueries(queryKeys.fetchPropertyOwnerArticles);
    },
    onError: (err: any) => {
      showError(err);
    },
  });
};

const createArticlePictures = async (
  body: FileResourceRecord,
  articleId: string,
): Promise<StringValue> => {
  const response = await axiosClient.post<StringValue>(
    `/api/articles/${articleId}/pictures`,
    {
      ...body,
    },
  );
  return response.data;
};

export const useCreateArticlePictures = (
  successMsg: string,
  articleId: string,
) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  const queryClient = useQueryClient();
  return useMutation(
    (body: FileResourceRecord) => createArticlePictures(body, articleId),
    {
      onSuccess: () => {
        enqueueSnackbar(successMsg, {
          variant: 'success',
        });
        queryClient.invalidateQueries(queryKeys.fetchArticleDetail);
      },
      onError: (err) => {
        showError(err);
      },
    },
  );
};
const updateArticlePicture = async (
  body: FileResourceRecord,
  articleId: string,
  fileResourceId: string,
): Promise<StringValue> => {
  const response = await axiosClient.put<StringValue>(
    `/api/articles/${articleId}/pictures/${fileResourceId}`,
    {
      ...body,
    },
  );
  return response.data;
};

export const useUpdateArticlePicture = (
  successMsg: string,
  articleId: string,
) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  const queryClient = useQueryClient();
  return useMutation(
    ({
      fileResourceId,
      body,
    }: {
      fileResourceId: string;
      body: FileResourceRecord;
    }) => updateArticlePicture(body, articleId, fileResourceId),
    {
      onSuccess: () => {
        enqueueSnackbar(successMsg, {
          variant: 'success',
        });
        queryClient.invalidateQueries(queryKeys.fetchArticleDetail);
      },
      onError: (err) => {
        showError(err);
      },
    },
  );
};
const deleteArticlePicture = async (
  articleId: string,
  fileResourceId: string,
): Promise<StringValue> => {
  const response = await axiosClient.delete<StringValue>(
    `/api/articles/${articleId}/pictures/${fileResourceId}`,
  );
  return response.data;
};

export const useDeleteArticlePicture = (
  successMsg: string,
  articleId: string,
) => {
  const {enqueueSnackbar, showError} = useSnackbar();
  const queryClient = useQueryClient();
  return useMutation(
    ({fileResourceId}: {fileResourceId: string}) =>
      deleteArticlePicture(articleId, fileResourceId),
    {
      onSuccess: () => {
        enqueueSnackbar(successMsg, {
          variant: 'success',
        });
        queryClient.invalidateQueries(queryKeys.fetchArticleDetail);
      },
      onError: (err) => {
        showError(err);
      },
    },
  );
};

export const fetchArticleStatistics = async (
  params: QueryArticleParams,
  serviceCompanyId: string,
): Promise<ArticleStatistics> => {
  const response: AxiosResponse<ArticleStatistics> = await axiosClient.get(
    `/api/serviceCompanies/${serviceCompanyId}/articles/statistics`,
    {
      params: {
        ...params,
      },
      paramsSerializer,
    },
  );
  return response.data;
};

export const useArticleStatistics = (
  params: QueryArticleParams,
  options?: UseQueryOptions<any, any, any>,
) => {
  const {user} = useUserSession();
  return useQuery<ArticleStatistics, RestError, ArticleStatistics>(
    [
      queryKeys.fetchElevatorStatistics,
      params,
      user?.userAccount.serviceCompany.id,
    ],
    () => fetchArticleStatistics(params, user!.userAccount.serviceCompany.id),
    {
      enabled: !!user,
      ...options,
    },
  );
};

export function useAllArticles(
  params: QueryArticleParams,
  options?: UseQueryOptions<ArticleView[], RestError>,
) {
  const {user} = useUserSession();
  const serviceCompanyId = user?.userAccount.serviceCompany.id;

  return useAll<QueryArticleParams, ArticleView>({
    queryKey: [queryKeys.queryAllArticles, params, serviceCompanyId],
    queryFn: (p) => fetchArticles(p, serviceCompanyId ?? ''),
    params,
    options: {
      enabled: !!serviceCompanyId,
      ...options,
    },
  });
}

export const fetchArticleComments = async (
  articleId: string,
  params: QueryArticleCommentsParams,
): Promise<Resource<Comment>> => {
  const response = await axiosClient.get<Resource<Comment>>(
    `/api/articles/${articleId}/comments`,
    {
      params,
      paramsSerializer,
    },
  );

  return response.data;
};

export function useInfiniteArticleComments(
  articleId: string,
  params: QueryArticleCommentsParams,
  options?: UseInfiniteQueryOptions<any, any, any>,
) {
  return useInfiniteQuery<Resource<Comment>, RestError, Resource<Comment>>(
    [qk.fetchArticleComments, params, articleId, {infinite: true}],
    ({pageParam = 0}) =>
      fetchArticleComments(articleId, {...params, pageIndex: pageParam}),
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

export const createArticleComment = async (
  id: string,
  body: ArticleComment,
) => {
  const response = await axiosClient.post<{value: string}>(
    `/api/articles/${id}/comments`,
    body,
  );
  return response.data;
};

export const useCreateArticleComment = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const {showError} = useSnackbar();

  return useMutation(
    ({id, body}: {id: string; body: ArticleComment}) =>
      createArticleComment(id, body),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([queryKeys.fetchArticleComments]);
        onSuccess?.();
      },
      onError: (err) => {
        showError(err);
      },
    },
  );
};

export const deleteArticleComment = async (id: string, commentId: string) => {
  const response = await axiosClient.delete<{value: string}>(
    `/api/articles/${id}/comments/${commentId}`,
  );
  return response.data;
};

export const useDeleteArticleComment = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const {showError} = useSnackbar();

  return useMutation(
    ({id, noteId}: {id: string; noteId: string}) =>
      deleteArticleComment(id, noteId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([queryKeys.fetchArticleComments]);
        onSuccess?.();
      },
      onError: (err) => {
        showError(err);
      },
    },
  );
};

export const updateArticleComment = async (
  id: string,
  commentId: string,
  body: ArticleComment,
) => {
  const response = await axiosClient.put<{value: string}>(
    `/api/articles/${id}/comments/${commentId}`,
    body,
  );
  return response.data;
};

export const useUpdateArticleComment = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const {showError} = useSnackbar();

  return useMutation(
    ({id, noteId, body}: {id: string; noteId: string; body: ArticleComment}) =>
      updateArticleComment(id, noteId, body),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([queryKeys.fetchArticleComments]);
        onSuccess?.();
      },
      onError: (err) => {
        showError(err);
      },
    },
  );
};

import {useCallback} from 'react';
import {
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
  ArticleView,
  CreateArticleRecord,
  QueryArticleParams,
  UpdateArticleRecord,
  ServiceOrderArticleRecord,
  CreateArticleOrderRecord,
  ArticleOrderView,
} from 'models/article';
import {Resource, RestError, StringValue} from 'models/misc';
import {data} from 'utils/partial-article-data';
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
  const {enqueueSnackbar} = useSnackbar();
  return useMutation((body: CreateArticleRecord) => createArticle(body), {
    onSuccess: () => {
      enqueueSnackbar(successMsg, {
        variant: 'success',
      });
    },
    onError: (err) => {
      console.log(err);
      enqueueSnackbar('An unexpected error occurred, please try again.', {
        variant: 'error',
      });
    },
  });
};

const deleteArticle = async (articleId: string) => {
  await axiosClient.delete<StringValue>(`/api/articles/${articleId}`);
};

export const useDeleteArticle = (successMsg?: string) => {
  const {enqueueSnackbar} = useSnackbar();
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
        console.log(err);
        enqueueSnackbar('An unexpected error occurred, please try again.', {
          variant: 'error',
        });
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
  const {enqueueSnackbar} = useSnackbar();
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
        console.log(err);
        enqueueSnackbar(
          'Sorry! Unable to save changes right now. Please try again.',
          {
            variant: 'error',
          },
        );
      },
    },
  );
};

export const updateServiceOrderArticle = async (
  serviceOrderId: string,
  body: Partial<ServiceOrderArticleRecord>[],
) => axiosClient.put(`/api/serviceOrders/${serviceOrderId}/articles`, body);

export const useUpdateServiceOrderArticles = (successMsg?: string) => {
  const {enqueueSnackbar} = useSnackbar();
  const queryClient = useQueryClient();
  return useMutation(
    ({
      body,
      serviceOrderId,
    }: {
      body: Partial<ServiceOrderArticleRecord>[];
      serviceOrderId: string;
    }) => updateServiceOrderArticle(serviceOrderId, body),
    {
      onSuccess: () => {
        if (successMsg) {
          enqueueSnackbar(successMsg, {
            variant: 'success',
          });
        }
        queryClient.invalidateQueries(qk.getServiceOrderDetails);
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
  const {enqueueSnackbar} = useSnackbar();
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
        console.log(err);
        enqueueSnackbar('An unexpected error occurred, please try again.', {
          variant: 'error',
        });
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

export const useCreateArticleOrder = (successMsg: string) => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar} = useSnackbar();
  return useMutation(
    (body: CreateArticleOrderRecord) => createArticleOrder(body),
    {
      onSuccess: () => {
        enqueueSnackbar(successMsg, {
          variant: 'success',
        });
        queryClient.invalidateQueries([queryKeys.fetchArticleOrder]);
      },
      onError: (err) => {
        console.log(err);
        enqueueSnackbar('An unexpected error occurred, please try again.', {
          variant: 'error',
        });
      },
    },
  );
};

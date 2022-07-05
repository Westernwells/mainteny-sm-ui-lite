import {useCallback} from 'react';
import {useMutation, useQuery, useQueryClient} from 'react-query';
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
                total: articlesRes.total,
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

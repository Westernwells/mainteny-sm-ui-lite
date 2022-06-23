import {useMutation, useQuery, useQueryClient} from 'react-query';
import {useNavigate} from 'react-router';
import {queryKeys, queryKeys as qk} from 'reactQuery/constants';
import {axiosClient, paramsSerializer} from 'utils/axios-utils';
import {useSnackbar} from 'notistack';
import _ from 'lodash';
import {Resource, RestError, StringValue} from 'models/misc';
import {
  ArticleView,
  CreateArticleRecord,
  QueryArticleParams,
  UpdateArticleRecord,
} from 'models/article';
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

export function useArticles(params: QueryArticleParams, options?: any) {
  const {user} = useUserSession();
  return useQuery<Resource<ArticleView>, RestError>(
    [qk.fetchArticles, params, user?.userAccount.id],
    () => fetchArticles(params, user!.userAccount.serviceCompany.id),
    {
      enabled: !!user,
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
export const useArticleDetails = (articleId?: string) => {
  const navigate = useNavigate();
  return useQuery(
    [qk.fetchArticleDetail, articleId],
    () => fetchArticleDetails(articleId!),
    {
      onError: (e: any) => {
        if (e.response.status === 500) navigate('/404');
      },
    },
  );
};

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
      enqueueSnackbar('Some error occurred, please try again.', {
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
        enqueueSnackbar('Some error occurred, please try again.', {
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
        enqueueSnackbar('Some error occurred, please try again.', {
          variant: 'error',
        });
      },
    },
  );
};

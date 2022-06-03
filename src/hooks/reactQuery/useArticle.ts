import {useQuery} from 'react-query';
import {useNavigate} from 'react-router';
import {queryKeys as qk} from 'reactQuery/constants';
import {axiosClient, paramsSerializer} from 'utils/axios-utils';
import _ from 'lodash';
import {Resource, RestError} from 'models/misc';
import {ArticleView, QueryArticleParams} from 'models/article';
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
export const useArticleDetails = (articleId: string) => {
  const navigate = useNavigate();
  return useQuery(
    [qk.articleDetails, articleId],
    () => fetchArticleDetails(articleId),
    {
      onError: (e: any) => {
        if (e.response.status === 500) navigate('/404');
      },
    },
  );
};

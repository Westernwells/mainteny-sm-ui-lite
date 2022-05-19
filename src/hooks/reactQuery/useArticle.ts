import {useQuery} from 'react-query';
import {queryKeys as qk} from 'reactQuery/constants';
import {axiosClient, paramsSerializer} from 'utils/axios-utils';
import {Resource, RestError} from 'models/misc';
import {ArticleView, QueryArticleParams} from 'models/article';
import {useUserSession} from './useUserSession';

export const fetchArticles = async (
  params: QueryArticleParams,
  id: string,
): Promise<Resource<ArticleView>> => {
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

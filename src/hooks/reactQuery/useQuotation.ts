import {useCallback} from 'react';
import {useQuery} from 'react-query';
import {queryKeys as qk} from 'reactQuery/constants';
import {Resource, RestError} from 'models/misc';
import {axiosClient, paramsSerializer} from 'utils/axios-utils';
import {
  QueryQuotationParams,
  QuotationFilters,
  QuotationView,
} from 'models/quotation';
import {useUserSession} from './useUserSession';

export const fetchQuotations = async (
  params: QueryQuotationParams,
  id: string,
): Promise<Resource<QuotationView>> => {
  const response = await axiosClient.get<Resource<QuotationView>>(
    `/api/serviceCompanies/${id}/quotations`,
    {
      params,
      paramsSerializer,
    },
  );

  return response.data;
};

const filterQuotations = (
  quotationsRes: Resource<QuotationView>,
  filters: QuotationFilters,
) => {
  const result = {...quotationsRes};
  console.log(filters);
  // TODO: Filter code goes here

  return result;
};

export function useQuotations(
  params: QueryQuotationParams,
  filters: QuotationFilters,
  options?: any,
) {
  const {user} = useUserSession();
  return useQuery<Resource<QuotationView>, RestError>(
    [qk.fetchQuotations, params, user?.userAccount.id],
    () => fetchQuotations(params, user!.userAccount.serviceCompany.id),
    {
      enabled: !!user,
      ...options,
      select: useCallback(
        (quotationsRes: Resource<QuotationView>) => {
          const filterResult = filterQuotations(quotationsRes, filters);
          return filterResult;
        },
        [filters],
      ),
    },
  );
}

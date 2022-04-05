import {useCallback} from 'react';
import {useQuery} from 'react-query';
import {queryKeys as qk} from 'reactQuery/constants';
import {Resource, RestError} from 'models/misc';
// import {axiosClient, paramsSerializer} from 'utils/axios-utils';
import {
  QueryQuotationParams,
  QuotationFilters,
  QuotationView,
} from 'models/quotation';
// TODO: Dummy import
import {data as staticData} from 'pages/Quotations/data';
import {useUserSession} from './useUserSession';

export const fetchQuotations = async (
  params: QueryQuotationParams,
  id: string,
): Promise<Resource<QuotationView>> => {
  // TODO: Make API call to fetch data

  //   const response = await axiosClient.get<Resource<QuotationView>>(
  //     `/api/serviceCompanies/${id}/quotations`,
  //     {
  //       params,
  //       paramsSerializer,
  //     },
  //   );
  console.log(typeof params, id);

  return Promise.resolve(staticData);
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

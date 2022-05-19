import {useCallback} from 'react';
import {useQuery} from 'react-query';
import {useSnackbar} from 'notistack';
import {queryKeys as qk} from 'reactQuery/constants';
import {useNavigate} from 'react-router';
import {Resource, RestError, WithOptional} from 'models/misc';
import {axiosClient, paramsSerializer} from 'utils/axios-utils';
import {
  CreateQuotation,
  QueryQuotationParams,
  QuotationFilters,
  QuotationView,
  UpdateQuotation,
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

export const fetchQuotation = async (quotationId: string) => {
  const response = await axiosClient.get<QuotationView>(
    `/api/quotations/${quotationId}`,
  );
  return response.data;
};

export function useQuotationDetails(quotationId?: string) {
  const navigate = useNavigate();

  return useQuery(
    [qk.quotationById, quotationId],
    () => fetchQuotation(quotationId!),
    {
      enabled: !!quotationId,
      onError: (e: any) => {
        if (e.response.status === 500) navigate('/404');
      },
    },
  );
}

export const useQuotation = () => {
  const {enqueueSnackbar} = useSnackbar();
  const {user} = useUserSession();
  const newQuotation = async (
    requestData: WithOptional<CreateQuotation, 'serviceCompanyId'>,
    onSuccess?: () => void,
  ) => {
    const urlEndpoint = `api/quotations`;
    try {
      if (user && requestData) {
        requestData.serviceCompanyId = user.userAccount.serviceCompany.id;
        const {status} = await axiosClient.post(urlEndpoint, requestData);

        if (status === 200) {
          enqueueSnackbar(`Quotation created successfully!`, {
            variant: 'success',
          });
          if (onSuccess) {
            onSuccess();
          }
        }
      }
    } catch (error: any) {
      console.error(error);
      enqueueSnackbar(
        error.response?.message ||
          'Sorry! Quotation creation failed. Please try again.',
        {
          variant: 'error',
        },
      );
    }
  };

  const updateQuotation = async (
    id: string,
    requestData: UpdateQuotation,
    onSuccess?: () => void,
  ) => {
    const urlEndpoint = `api/quotations/${id}`;
    try {
      if (requestData && id) {
        const {status} = await axiosClient.put(urlEndpoint, requestData);

        if (status === 200) {
          enqueueSnackbar(`Quotation updated successfully!`, {
            variant: 'success',
          });
          if (onSuccess) {
            onSuccess();
          }
        }
      }
    } catch (error: any) {
      console.error(error);
      enqueueSnackbar(
        error.response?.message ||
          'Sorry! Failed to update quotation. Please try again.',
        {
          variant: 'error',
        },
      );
    }
  };

  return {newQuotation, updateQuotation};
};

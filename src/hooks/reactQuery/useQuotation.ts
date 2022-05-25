import {useCallback} from 'react';
import {useMutation, useQuery, useQueryClient} from 'react-query';
import {useSnackbar} from 'notistack';
import {queryKeys as qk} from 'reactQuery/constants';
import {useNavigate} from 'react-router';
import {Resource, RestError} from 'models/misc';
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

export const postPublishQuotation = async (id: string) => {
  await axiosClient.post(`api/quotations/${id}/publish`);
};

export const usePublishQuotation = () => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar} = useSnackbar();
  const navigate = useNavigate();

  return useMutation(
    (quotationId: string) => postPublishQuotation(quotationId),
    {
      onSuccess: (_, quotationId) => {
        queryClient.invalidateQueries([qk.fetchQuotations]);
        queryClient.invalidateQueries([qk.quotationById]);
        enqueueSnackbar(`Quotation sent client!`, {
          variant: 'success',
        });
        navigate(`/quotations/details/${quotationId}`);
      },
      onError: (err) => {
        console.log(err);
        enqueueSnackbar('Some error occurred, please try again!', {
          variant: 'error',
        });
      },
    },
  );
};

export const postQuotation = async (
  body: CreateQuotation,
  publish: boolean,
) => {
  const {data} = await axiosClient.post<{value: string}>(
    'api/quotations',
    body,
  );
  return {data, publish};
};

export const useCreateQuotation = () => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar} = useSnackbar();
  const navigate = useNavigate();
  const {mutate: publishQuotation} = usePublishQuotation();

  return useMutation(
    ({data, publish}: {data: CreateQuotation; publish: boolean}) =>
      postQuotation(data, publish),
    {
      onSuccess: ({data, publish}) => {
        queryClient.invalidateQueries([qk.fetchQuotations]);
        queryClient.invalidateQueries([qk.quotationById]);
        enqueueSnackbar(`Quotation created successfully!`, {
          variant: 'success',
        });
        if (publish) {
          publishQuotation(data.value);
        } else {
          navigate('/quotations?pageIndex=1&pageSize=25');
        }
      },
      onError: (err) => {
        console.log(err);
        enqueueSnackbar('Some error occurred, please try again!', {
          variant: 'error',
        });
      },
    },
  );
};

export const putQuotation = async (
  body: UpdateQuotation,
  id: string,
  publish: boolean,
) => {
  await axiosClient.put(`api/quotations/${id}`, body);
  return publish;
};

export const useUpdateQuotation = () => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar} = useSnackbar();
  const {mutate: publishQuotation} = usePublishQuotation();

  return useMutation(
    ({
      data,
      quotationId,
      publish,
    }: {
      data: UpdateQuotation;
      quotationId: string;
      publish: boolean;
    }) => putQuotation(data, quotationId, publish),
    {
      onSuccess: (_, {publish, quotationId}) => {
        queryClient.invalidateQueries([qk.fetchQuotations]);
        queryClient.invalidateQueries([qk.quotationById]);
        enqueueSnackbar(`Quotation updated successfully!`, {
          variant: 'success',
        });
        if (publish) {
          publishQuotation(quotationId);
        }
      },
      onError: (err) => {
        console.log(err);
        enqueueSnackbar('Some error occurred, please try again!', {
          variant: 'error',
        });
      },
    },
  );
};

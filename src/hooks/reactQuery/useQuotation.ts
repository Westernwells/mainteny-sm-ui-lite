import {useCallback} from 'react';
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from 'react-query';
import {useSnackbar} from 'hooks/useSnackbar';
import {queryKeys as qk} from 'reactQuery/constants';
import {useNavigate} from 'react-router-dom';
import {Resource, RestError} from 'models/misc';
import {axiosClient, paramsSerializer} from 'utils/axios-utils';
import {
  CreateQuotation,
  QueryQuotationParams,
  QuotationFilters,
  QuotationView,
  ReplyQuotation,
  UpdateQuotation,
} from 'models/quotation';
import {Mixpanel} from 'mixpanel/mixpanel';
import {mixpanelEvents} from 'mixpanel/constants';
import {getTotalFromArticles, getTotalWithVatFromArticles} from 'utils/invoice';
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

export function useQuotationDetails(
  quotationId?: string,
  options?: UseQueryOptions<any, any, any>,
) {
  return useQuery<QuotationView, RestError, QuotationView>(
    [qk.quotationById, quotationId],
    () => fetchQuotation(quotationId!),
    {
      enabled: !!quotationId,
      ...options,
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
        enqueueSnackbar(`Quotation sent successfully`, {
          variant: 'success',
        });
        navigate(`/quotations/details/${quotationId}`);
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

export const putReplyQuotation = async (id: string, body: ReplyQuotation) => {
  await axiosClient.put(`api/quotations/${id}/reply`, body);
};

export const useReplyQuotation = () => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar} = useSnackbar();
  const navigate = useNavigate();

  return useMutation(
    ({quotationId, reply}: {quotationId: string; reply: ReplyQuotation}) =>
      putReplyQuotation(quotationId, reply),
    {
      onSuccess: (_, {quotationId}) => {
        queryClient.invalidateQueries([qk.fetchQuotations]);
        queryClient.invalidateQueries([qk.quotationById]);
        enqueueSnackbar(`Quotation marked as accepted`, {
          variant: 'success',
        });
        navigate(`/quotations/details/${quotationId}`);
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
      onSuccess: ({data, publish}, variables) => {
        queryClient.invalidateQueries([qk.fetchQuotations]);
        queryClient.invalidateQueries([qk.quotationById]);
        enqueueSnackbar(`Quotation created successfully`, {
          variant: 'success',
        });
        Mixpanel.identifyAndTrack(mixpanelEvents.NEW_QUOTATION_CREATED, {
          quotationId: data.value,
          elevatorId: variables.data.elevatorId,
          amountWithoutVat: getTotalFromArticles(variables.data.items),
          amountWithVat: getTotalWithVatFromArticles(variables.data.items),
        });
        if (publish) {
          publishQuotation(data.value);
        } else {
          navigate('/quotations?pageIndex=1&pageSize=25');
        }
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
        enqueueSnackbar(`Quotation updated successfully`, {
          variant: 'success',
        });
        if (publish) {
          publishQuotation(quotationId);
        }
      },
      onError: (err) => {
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

export const deleteQuotation = async (id: string, navigate: boolean) => {
  await axiosClient.delete(`api/quotations/${id}`);
  return navigate;
};

export const useDeleteQuotation = () => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar} = useSnackbar();
  const navigate = useNavigate();

  return useMutation(
    ({
      quotationId,
      shouldNavigate,
    }: {
      quotationId: string;
      shouldNavigate: boolean;
    }) => deleteQuotation(quotationId, shouldNavigate),
    {
      onSuccess: (__, {shouldNavigate}) => {
        queryClient.invalidateQueries([qk.fetchQuotations]);
        queryClient.invalidateQueries([qk.quotationById]);
        enqueueSnackbar(`Quotation deleted successfully`, {
          variant: 'success',
        });
        if (shouldNavigate) navigate(`/quotations?pageIndex=1&pageSize=25`);
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

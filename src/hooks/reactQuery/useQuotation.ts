import {useCallback, useContext} from 'react';
import {
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from 'react-query';
import {useSnackbar} from 'hooks/useSnackbar';
import {queryKeys as qk} from 'reactQuery/constants';
import {useNavigate} from 'react-router-dom';
import {Language, Resource, RestError, SimpleEmailRecord} from 'models/misc';
import {axiosClient, paramsSerializer} from 'utils/axios-utils';
import {
  CreateQuotation,
  CreateQuotationComment,
  QueryQuotationCommentsParams,
  QueryQuotationParams,
  QuotationActivityView,
  QuotationFilters,
  QuotationView,
  ReplyQuotation,
  UpdateQuotation,
} from 'models/quotation';
import {Comment} from 'models/comment';
import {Mixpanel} from 'mixpanel/mixpanel';
import {mixpanelEvents} from 'mixpanel/constants';
import {languageContextMap} from 'utils/utils';
import {getTotalFromArticles, getTotalWithVatFromArticles} from 'utils/invoice';
import {LanguageContext} from 'context/LanguageProvider';
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

const filterQuotations = (quotationsRes: Resource<QuotationView>) => {
  const result = {...quotationsRes};

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
          const filterResult = filterQuotations(quotationsRes);
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

export const postPublishQuotation = async (
  id: string,
  body: SimpleEmailRecord,
) => {
  await axiosClient.post(`api/quotations/${id}/publish`, body);
};

export const usePublishQuotation = () => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar, showError} = useSnackbar();
  const navigate = useNavigate();

  return useMutation(
    ({id, body}: {id: string; body: SimpleEmailRecord}) =>
      postPublishQuotation(id, body),
    {
      onSuccess: (_, {id}) => {
        queryClient.invalidateQueries([qk.fetchQuotations]);
        queryClient.invalidateQueries([qk.quotationById]);
        enqueueSnackbar(`Quotation sent successfully`, {
          variant: 'success',
        });
        navigate(`/quotations/details/${id}`);
      },
      onError: (err) => {
        console.log(err);
        showError(err);
      },
    },
  );
};

export const putReplyQuotation = async (id: string, body: ReplyQuotation) => {
  await axiosClient.put(`api/quotations/${id}/reply`, body);
};

export const useReplyQuotation = () => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar, showError} = useSnackbar();
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
        showError(err);
      },
    },
  );
};

export const postQuotation = async (body: CreateQuotation) => {
  const {data} = await axiosClient.post<{value: string}>(
    'api/quotations',
    body,
  );
  return data;
};

export const useCreateQuotation = () => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar, showError} = useSnackbar();
  const navigate = useNavigate();

  return useMutation(({data}: {data: CreateQuotation}) => postQuotation(data), {
    onSuccess: (data, variables) => {
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
      navigate(`/quotations/details/${data.value}`);
    },
    onError: (err) => {
      console.log(err);
      showError(err);
    },
  });
};

export const putQuotation = async (body: UpdateQuotation, id: string) => {
  await axiosClient.put(`api/quotations/${id}`, body);
};

export const useUpdateQuotation = () => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar, showError} = useSnackbar();

  return useMutation(
    ({data, quotationId}: {data: UpdateQuotation; quotationId: string}) =>
      putQuotation(data, quotationId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([qk.fetchQuotations]);
        queryClient.invalidateQueries([qk.quotationById]);
        enqueueSnackbar(`Quotation updated successfully`, {
          variant: 'success',
        });
      },
      onError: (err) => {
        console.log(err);
        showError(err);
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
  const {enqueueSnackbar, showError} = useSnackbar();
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
        showError(err);
      },
    },
  );
};

export const fetchQuotationComments = async (
  quotationId: string,
  params: QueryQuotationCommentsParams,
): Promise<Resource<Comment>> => {
  const response = await axiosClient.get<Resource<Comment>>(
    `/api/quotations/${quotationId}/comments`,
    {
      params,
      paramsSerializer,
    },
  );

  return response.data;
};

export function useQuotationComments(
  quotationId: string,
  params: QueryQuotationCommentsParams,
  options?: UseQueryOptions<any, any, any>,
) {
  return useQuery<Resource<Comment>, RestError>(
    [qk.fetchQuotationComments, params, quotationId],
    () => fetchQuotationComments(quotationId, params),
    {
      ...options,
    },
  );
}

export function useInfiniteQuotationComments(
  quotationId: string,
  params: QueryQuotationCommentsParams,
  options?: UseInfiniteQueryOptions<any, any, any>,
) {
  return useInfiniteQuery<Resource<Comment>, RestError, Resource<Comment>>(
    [qk.fetchQuotationComments, params, quotationId, {infinite: true}],
    ({pageParam = 0}) =>
      fetchQuotationComments(quotationId, {...params, pageIndex: pageParam}),
    {
      getNextPageParam: (lastPage) => {
        const currentTotal =
          (lastPage.page.pageIndex + 1) * lastPage.page.pageSize;
        if (lastPage.total && currentTotal < lastPage.total) {
          return lastPage.page.pageIndex + 1;
        }
        return undefined;
      },
      ...options,
    },
  );
}

export const postQuotationComment = async (
  quotationId: string,
  body: CreateQuotationComment,
) => {
  const {data} = await axiosClient.post<{value: string}>(
    `/api/quotations/${quotationId}/comments`,
    body,
  );
  return data;
};

export const useCreateQuotationComment = () => {
  const queryClient = useQueryClient();
  const {showError} = useSnackbar();

  return useMutation(
    ({
      quotationId,
      body,
    }: {
      quotationId: string;
      body: CreateQuotationComment;
    }) => postQuotationComment(quotationId, body),
    {
      onSuccess: () =>
        queryClient.invalidateQueries([qk.fetchQuotationComments]),
      onError: (err) => {
        console.log(err);
        showError(err);
      },
    },
  );
};

export const deleteQuotationComment = async (
  quotationId: string,
  commentId: string,
) => {
  const {data} = await axiosClient.delete<{value: string}>(
    `/api/quotations/${quotationId}/comments/${commentId}`,
  );
  return data;
};

export const useDeleteQuotationComment = () => {
  const queryClient = useQueryClient();
  const {showError} = useSnackbar();

  return useMutation(
    ({quotationId, commentId}: {quotationId: string; commentId: string}) =>
      deleteQuotationComment(quotationId, commentId),
    {
      onSuccess: () =>
        queryClient.invalidateQueries([qk.fetchQuotationComments]),
      onError: (err) => {
        console.log(err);
        showError(err);
      },
    },
  );
};

export const updateQuotationComment = async (
  quotationId: string,
  commentId: string,
  body: CreateQuotationComment,
) => {
  const {data} = await axiosClient.put<{value: string}>(
    `/api/quotations/${quotationId}/comments/${commentId}`,
    body,
  );
  return data;
};

export const useUpdateQuotationComment = () => {
  const queryClient = useQueryClient();
  const {showError} = useSnackbar();

  return useMutation(
    ({
      quotationId,
      commentId,
      body,
    }: {
      quotationId: string;
      commentId: string;
      body: CreateQuotationComment;
    }) => updateQuotationComment(quotationId, commentId, body),
    {
      onSuccess: () =>
        queryClient.invalidateQueries([qk.fetchQuotationComments]),
      onError: (err) => {
        console.log(err);
        showError(err);
      },
    },
  );
};

export const fetchQuotationActivities = async (params: {
  quotationId: string;
  language: Language;
}) => {
  const response = await axiosClient.get<QuotationActivityView[]>(
    `/api/quotations/${params.quotationId}/activities`,
    {
      params,
      paramsSerializer,
    },
  );
  return response.data;
};

export const useQuotationActivities = (
  {quotationId}: {quotationId: string},
  options?: UseQueryOptions<any, any, any>,
) => {
  const {language} = useContext(LanguageContext);
  return useQuery<QuotationActivityView[], RestError>(
    [qk.fetchQuotationActivities, quotationId, language],
    () =>
      fetchQuotationActivities({
        quotationId,
        language: languageContextMap[language],
      }),
    {
      enabled: !!quotationId,
      ...options,
    },
  );
};

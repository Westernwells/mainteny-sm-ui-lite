import {useContext} from 'react';
import {useTranslation} from 'react-i18next';
import {
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from 'react-query';
import {AxiosError, AxiosResponse} from 'axios';
import * as _ from 'lodash';
import {queryKeys as qk, queryKeys} from 'reactQuery/constants';
import {axiosClient, paramsSerializer} from 'utils/axios-utils';
import {useSnackbar} from 'hooks/useSnackbar';
import {useNavigate} from 'react-router-dom';

// FIXME: Dummy Import
import {
  EmailRecord,
  Language,
  Resource,
  RestError,
  SimpleEmailRecord,
  StringValue,
} from 'models/misc';
import {
  CreateInvoice,
  CreateInvoiceComment,
  CreateInvoiceOverdueNoticeRecord,
  FetchXInvoiceByInvoiceIdParams,
  InvoiceActivityView,
  InvoiceFilters,
  InvoicePaymentRecord,
  InvoiceStatistics,
  InvoiceStatus,
  InvoiceView,
  PrintInvoiceRecord,
  QueryInvoiceCommentsParams,
  QueryInvoiceParams,
  SendInvoiceRecord,
  UpdateInvoice,
} from 'models/invoice';
import {Comment} from 'models/comment';
import {ErrorCode} from 'models/error';
import {languageContextMap} from 'utils/utils';
import {transformInvoiceForCreditNote} from 'utils/invoice-utils';
import {LanguageContext} from 'context/LanguageProvider';
import {QueryElevatorInvoiceParams} from 'models/elevator';
import {useAll} from 'hooks/reactQuery/useAll';
import {useUserSession} from './useUserSession';

// TODO: make API call to fetch Invoices

export const fetchInvoices = async (
  params: QueryInvoiceParams,
  id: string,
): Promise<Resource<InvoiceView>> => {
  const response = await axiosClient.get<Resource<InvoiceView>>(
    `/api/serviceCompanies/${id}/invoices`,
    {
      params,
      paramsSerializer,
    },
  );
  return response.data;
};

const fetchContractInvoices = async (
  contractId: string,
  params: QueryInvoiceParams,
): Promise<Resource<InvoiceView>> => {
  const response = await axiosClient.get<Resource<InvoiceView>>(
    `/api/contracts/${contractId}/invoices`,
    {
      params,
      paramsSerializer,
    },
  );
  return response.data;
};

export const filterByAmount = (
  invoicesRes: Resource<InvoiceView>,
  amount: InvoiceFilters['amount'],
) =>
  invoicesRes.data.filter((item) => {
    const value =
      (item.totalAmount?.netAmount ?? 0) /
      10 ** item.totalAmount.fractionDigits!;
    return value >= amount[0] && value <= amount[1];
  });

export const filterByStatus = (
  invoicesRes: Resource<InvoiceView>,
  status: InvoiceStatus,
) => {
  const filterResult = [] as InvoiceView[];
  const invoiceStatusMap = _.groupBy(invoicesRes.data, (item) => item.status);

  if (invoiceStatusMap[status]) {
    invoiceStatusMap[status].forEach((item) => {
      filterResult.push(item);
    });
  }

  return filterResult;
};

export const filterByServiceType = (
  invoicesRes: Resource<InvoiceView>,
  serviceType: InvoiceFilters['serviceType'],
) => {
  let filterResult = [] as InvoiceView[];
  const invoiceServiceTypeMap = _.groupBy(
    invoicesRes.data,
    (item) => item.serviceOrder?.type,
  );

  serviceType
    .map((item) => invoiceServiceTypeMap[item])
    .filter((item) => item)
    .forEach((item) => {
      filterResult = [...filterResult, ...item];
    });

  return filterResult;
};

export function useInvoices(params: QueryInvoiceParams, options?: any) {
  const {user} = useUserSession();
  return useQuery<Resource<InvoiceView>, RestError>(
    [qk.fetchInvoices, params, user?.userAccount.id],
    () => fetchInvoices(params, user!.userAccount.serviceCompany.id),
    {
      enabled: !!user,
      ...options,
    },
  );
}

export const useContractInvoices = (
  contractId: string,
  params: QueryInvoiceParams,
  options?: UseQueryOptions<any, any, any>,
) =>
  useQuery<Resource<InvoiceView>, RestError>(
    [queryKeys.fetchContractInvoices, contractId, params],
    () => fetchContractInvoices(contractId, params),
    {...options},
  );

export const fetchInvoice = async (invoiceId: string) => {
  const response = await axiosClient.get<InvoiceView>(
    `/api/invoices/${invoiceId}`,
  );
  return response.data;
};

export function useInvoiceDetail(invoiceId?: string, isCreditNote?: boolean) {
  return useQuery([qk.invoiceById, invoiceId], () => fetchInvoice(invoiceId!), {
    enabled: !!invoiceId,
    ...(isCreditNote
      ? {
          select: transformInvoiceForCreditNote,
        }
      : {}),
  });
}

export const postPrintInvoice = async (
  id: string,
  body: PrintInvoiceRecord,
) => {
  await axiosClient.post<{value: string}>(`api/invoices/${id}/print`, body);
};

export const usePrintInvoice = ({
  shouldNavigate = true,
}: {
  shouldNavigate?: boolean;
} = {}) => {
  const queryClient = useQueryClient();
  const {showError} = useSnackbar();
  const navigate = useNavigate();

  return useMutation(
    ({id, body}: {id: string; body: PrintInvoiceRecord}) =>
      postPrintInvoice(id, body),
    {
      onSuccess: (__, {id}) => {
        queryClient.invalidateQueries([qk.fetchInvoices]);
        queryClient.invalidateQueries([qk.invoiceById]);
        queryClient.invalidateQueries([qk.fetchInvoiceActivities]);

        if (shouldNavigate) {
          navigate(`/invoices/details/${id}`);
        }
      },
      onError: (err) => {
        showError(err);
      },
    },
  );
};

export const postSendInvoice = async (id: string, body: SendInvoiceRecord) => {
  await axiosClient.post<{value: string}>(`api/invoices/${id}/send`, body);
};

export const useSendInvoice = ({
  shouldNavigate = true,
}: {
  shouldNavigate?: boolean;
} = {}) => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar, showError} = useSnackbar();
  const navigate = useNavigate();
  const {t} = useTranslation();

  return useMutation(
    ({id, body}: {id: string; body: SendInvoiceRecord}) =>
      postSendInvoice(id, body),
    {
      onSuccess: (__, {id}) => {
        queryClient.invalidateQueries([qk.fetchInvoices]);
        queryClient.invalidateQueries([qk.invoiceById]);
        queryClient.invalidateQueries([qk.fetchInvoiceActivities]);
        enqueueSnackbar(`Invoice sent successfully`, {
          variant: 'success',
        });
        if (shouldNavigate) {
          navigate(`/invoices/details/${id}`);
        }
      },
      onError: (err: AxiosError, {body}) => {
        const responseErrorCode = (err?.response?.data as RestError)?.errorCode;
        if (responseErrorCode === ErrorCode.DUPLICATE_INVOICE_EXTERNAL_ID) {
          enqueueSnackbar(
            t(
              'Invoice number "{{invoiceNumber}}" is already taken. Invoice PDF is regenerated. Try sending again.',
              {invoiceNumber: body.externalId},
            ),
            {
              variant: 'info',
            },
          );
          throw new Error('Regenerate PDF');
        } else {
          showError(err);
        }
      },
    },
  );
};

export const postPublishInvoice = async (id: string, body: EmailRecord) => {
  await axiosClient.post<{value: string}>(`api/invoices/${id}/publish`, body);
};

export const usePublishInvoice = ({
  shouldNavigate = true,
}: {
  shouldNavigate?: boolean;
} = {}) => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar, showError} = useSnackbar();
  const navigate = useNavigate();

  return useMutation(
    ({id, body}: {id: string; body: EmailRecord}) =>
      postPublishInvoice(id, body),
    {
      onSuccess: (__, {id}) => {
        queryClient.invalidateQueries([qk.fetchInvoices]);
        queryClient.invalidateQueries([qk.invoiceById]);
        queryClient.invalidateQueries([qk.fetchInvoiceActivities]);
        enqueueSnackbar(`Invoice sent successfully`, {
          variant: 'success',
        });
        if (shouldNavigate) {
          navigate(`/invoices/details/${id}`);
        }
      },
      onError: (err) => {
        showError(err);
      },
    },
  );
};

export const putInvoicePaymentStatus = async (id: string) => {
  await axiosClient.put(`api/invoices/${id}/payment`);
};

export const useInvoicePaymentStatus = () => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar, showError} = useSnackbar();
  const navigate = useNavigate();

  return useMutation(
    (invoiceId: string) => putInvoicePaymentStatus(invoiceId),
    {
      onSuccess: (__, invoiceId) => {
        queryClient.invalidateQueries([qk.fetchInvoices]);
        queryClient.invalidateQueries([qk.invoiceById]);
        queryClient.invalidateQueries([qk.fetchInvoiceActivities]);
        enqueueSnackbar(`Invoice marked as paid!`, {
          variant: 'success',
        });
        navigate(`/invoices/details/${invoiceId}`);
      },
      onError: (err) => {
        showError(err);
      },
    },
  );
};

export const addInvoicePayment = async ({
  invoiceId,
  body,
}: {
  invoiceId: string;
  body: InvoicePaymentRecord;
}) => {
  await axiosClient.post<{value: string}>(
    `api/invoices/${invoiceId}/payments`,
    body,
  );
};

export const useAddInvoicePayment = () => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar, showError} = useSnackbar();
  const navigate = useNavigate();

  return useMutation(
    ({invoiceId, body}: {invoiceId: string; body: InvoicePaymentRecord}) =>
      addInvoicePayment({invoiceId, body}),
    {
      onSuccess: (__, {invoiceId}) => {
        queryClient.invalidateQueries([qk.fetchInvoices]);
        queryClient.invalidateQueries([qk.invoiceById]);
        queryClient.invalidateQueries([qk.fetchInvoiceActivities]);
        enqueueSnackbar(`Invoice marked as paid!`, {
          variant: 'success',
        });
        navigate(`/invoices/details/${invoiceId}`);
      },
      onError: (err) => {
        showError(err);
      },
    },
  );
};

export const postInvoice = async (body: CreateInvoice) => {
  const {data} = await axiosClient.post<StringValue>('/api/invoices', body);
  return data;
};

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar, showError} = useSnackbar();

  return useMutation(({data}: {data: CreateInvoice}) => postInvoice(data), {
    onSuccess: () => {
      queryClient.invalidateQueries([qk.fetchInvoices]);
      queryClient.invalidateQueries([qk.invoiceById]);
      queryClient.invalidateQueries([qk.fetchInvoiceActivities]);
      queryClient.invalidateQueries([qk.fetchInvoiceComments]);
      enqueueSnackbar(`Invoice created successfully`, {
        variant: 'success',
      });

      // navigate(`/invoices/details/${data.value}`);
    },
    onError: (err) => {
      showError(err);
    },
  });
};

export const putInvoice = async (body: UpdateInvoice, id: string) => {
  const {data} = await axiosClient.put<StringValue>(`api/invoices/${id}`, body);
  return data;
};

export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar, showError} = useSnackbar();

  return useMutation(
    ({data, invoiceId}: {data: UpdateInvoice; invoiceId: string}) =>
      putInvoice(data, invoiceId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([qk.fetchInvoices]);
        queryClient.invalidateQueries([qk.invoiceById]);
        queryClient.invalidateQueries([qk.fetchInvoiceActivities]);
        enqueueSnackbar(`Invoice updated successfully`, {
          variant: 'success',
        });
      },
      onError: (err) => {
        showError(err);
      },
    },
  );
};

export const deleteInvoice = async (id: string, navigate: boolean) => {
  await axiosClient.delete(`api/invoices/${id}`);
  return navigate;
};

export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();
  const {showError} = useSnackbar();
  const navigate = useNavigate();

  return useMutation(
    ({
      invoiceId,
      shouldNavigate,
    }: {
      invoiceId: string;
      shouldNavigate: boolean;
    }) => deleteInvoice(invoiceId, shouldNavigate),
    {
      onSuccess: (__, {shouldNavigate}) => {
        queryClient.invalidateQueries([qk.fetchInvoices]);
        queryClient.invalidateQueries([qk.invoiceById]);
        queryClient.invalidateQueries([qk.fetchServiceOrderInvoices]);
        if (shouldNavigate) navigate(`/invoices?pageIndex=1&pageSize=25`);
      },
      onError: (err) => {
        showError(err);
      },
    },
  );
};

const fetchServiceOrderInvoices = async (serviceOrderId: string) => {
  const response = await axiosClient.get<InvoiceView[]>(
    `/api/serviceOrders/${serviceOrderId}/invoices`,
  );
  return response.data;
};

export const useFetchServiceOrderInvoices = (
  serviceOrderId?: string,
  options?: UseQueryOptions<any, any, any>,
) =>
  useQuery<InvoiceView[]>(
    [queryKeys.fetchServiceOrderInvoices, serviceOrderId],
    () => fetchServiceOrderInvoices(serviceOrderId!),
    {enabled: !!serviceOrderId, ...options},
  );

export const fetchInvoiceComments = async (
  invoiceId: string,
  params: QueryInvoiceCommentsParams,
): Promise<Resource<Comment>> => {
  const response = await axiosClient.get<Resource<Comment>>(
    `/api/invoices/${invoiceId}/comments`,
    {
      params,
      paramsSerializer,
    },
  );

  return response.data;
};

export function useInvoiceComments(
  invoiceId: string,
  params: QueryInvoiceCommentsParams,
  options?: UseQueryOptions<any, any, any>,
) {
  return useQuery<Resource<Comment>, RestError>(
    [qk.fetchInvoiceComments, params, invoiceId],
    () => fetchInvoiceComments(invoiceId, params),
    {
      ...options,
    },
  );
}

export function useInfiniteInvoiceComments(
  invoiceid: string,
  params: QueryInvoiceCommentsParams,
  options?: UseInfiniteQueryOptions<any, any, any>,
) {
  return useInfiniteQuery<Resource<Comment>, RestError, Resource<Comment>>(
    [qk.fetchInvoiceComments, params, invoiceid, {infinite: true}],
    ({pageParam = 0}) =>
      fetchInvoiceComments(invoiceid, {...params, pageIndex: pageParam}),
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

export const postInvoiceComment = async (
  invoiceId: string,
  body: CreateInvoiceComment,
) => {
  const {data} = await axiosClient.post<{value: string}>(
    `/api/invoices/${invoiceId}/comments`,
    body,
  );
  return data;
};

export const useCreateInvoiceComment = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const {showError} = useSnackbar();

  return useMutation(
    ({invoiceId, body}: {invoiceId: string; body: CreateInvoiceComment}) =>
      postInvoiceComment(invoiceId, body),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([qk.fetchInvoiceComments]);
        onSuccess?.();
      },
      onError: (err) => {
        showError(err);
      },
    },
  );
};

export const deleteInvoiceComment = async (
  invoiceId: string,
  noteId: string,
) => {
  const {data} = await axiosClient.delete<{value: string}>(
    `/api/invoices/${invoiceId}/comments/${noteId}`,
  );
  return data;
};

export const useDeleteInvoiceComment = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const {showError} = useSnackbar();

  return useMutation(
    ({invoiceId, noteId}: {invoiceId: string; noteId: string}) =>
      deleteInvoiceComment(invoiceId, noteId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([qk.fetchInvoiceComments]);
        onSuccess?.();
      },
      onError: (err) => {
        showError(err);
      },
    },
  );
};

export const updateInvoiceComment = async (
  invoiceId: string,
  noteId: string,
  body: CreateInvoiceComment,
) => {
  const {data} = await axiosClient.put<{value: string}>(
    `/api/invoices/${invoiceId}/comments/${noteId}`,
    body,
  );
  return data;
};

export const useUpdateInvoiceComment = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const {showError} = useSnackbar();

  return useMutation(
    ({
      invoiceId,
      noteId,
      body,
    }: {
      invoiceId: string;
      noteId: string;
      body: CreateInvoiceComment;
    }) => updateInvoiceComment(invoiceId, noteId, body),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([qk.fetchInvoiceComments]);
        onSuccess?.();
      },
      onError: (err) => {
        showError(err);
      },
    },
  );
};

export const createInvoiceOverdueNotice = async (
  invoiceId: string,
  body: CreateInvoiceOverdueNoticeRecord,
) => {
  const {data} = await axiosClient.post<{value: string}>(
    `/api/invoices/${invoiceId}/overdueNotices`,
    body,
  );
  return data;
};

export const useCreateInvoiceOverdueNotice = () => {
  const queryClient = useQueryClient();
  const {showError} = useSnackbar();
  return useMutation(
    ({
      invoiceId,
      body,
    }: {
      invoiceId: string;
      body: CreateInvoiceOverdueNoticeRecord;
    }) => createInvoiceOverdueNotice(invoiceId, body),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([qk.fetchInvoices]);
        queryClient.invalidateQueries([qk.invoiceById]);
        queryClient.invalidateQueries([qk.fetchInvoiceActivities]);
      },
      onError: (err) => {
        showError(err);
      },
    },
  );
};

export const publishInvoiceOverdueNotice = async (
  invoiceId: string,
  noticeId: string,
  body: SimpleEmailRecord,
) => {
  await axiosClient.post<{value: string}>(
    `api/invoices/${invoiceId}/overdueNotices/${noticeId}/publish`,
    body,
  );
};

export const usePublishInvoiceOverdueNotice = () => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar, showError} = useSnackbar();
  const navigate = useNavigate();
  return useMutation(
    ({
      invoiceId,
      noticeId,
      body,
    }: {
      invoiceId: string;
      noticeId: string;
      body: SimpleEmailRecord;
    }) => publishInvoiceOverdueNotice(invoiceId, noticeId, body),
    {
      onSuccess: (__, {invoiceId}) => {
        queryClient.invalidateQueries([qk.fetchInvoices]);
        queryClient.invalidateQueries([qk.invoiceById]);
        queryClient.invalidateQueries([qk.fetchInvoiceActivities]);
        enqueueSnackbar(`Overdue notice sent successfully!`, {
          variant: 'success',
        });
        navigate(`/invoices/details/${invoiceId}`);
      },
      onError: (err: any) => {
        showError(err);
      },
    },
  );
};

export const fetchInvoiceActivities = async (params: {
  invoiceId: string;
  language: Language;
}) => {
  const response = await axiosClient.get<InvoiceActivityView[]>(
    `/api/invoices/${params.invoiceId}/activities`,
    {
      params,
      paramsSerializer,
    },
  );
  return response.data;
};

export const useInvoiceActivities = (
  {invoiceId}: {invoiceId: string},
  options?: UseQueryOptions<any, any, any>,
) => {
  const {language} = useContext(LanguageContext);
  return useQuery<InvoiceActivityView[], RestError>(
    [qk.fetchInvoiceActivities, invoiceId, language],
    () =>
      fetchInvoiceActivities({
        invoiceId,
        language: languageContextMap[language],
      }),
    {
      enabled: !!invoiceId,
      ...options,
    },
  );
};

const fetchElevatorInvoices = async (
  elevatorId: string,
  params: QueryElevatorInvoiceParams,
): Promise<Resource<InvoiceView>> => {
  const response = await axiosClient.get<Resource<InvoiceView>>(
    `/api/elevators/${elevatorId}/invoices`,
    {
      params,
      paramsSerializer,
    },
  );
  return response.data;
};

export const useElevatorInvoices = (
  elevatorId: string,
  params: QueryElevatorInvoiceParams,
  options?: UseQueryOptions<any, any, any>,
) =>
  useQuery<Resource<InvoiceView>, RestError>(
    [queryKeys.fetchElevatorInvoices, elevatorId, params],
    () => fetchElevatorInvoices(elevatorId, params),
    {enabled: !!elevatorId, ...options},
  );

export const cancelInvoice = async (id: string) => {
  await axiosClient.put(`api/invoices/${id}/cancel`);
};

export const useCancelInvoice = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const {showError} = useSnackbar();

  return useMutation((invoiceId: string) => cancelInvoice(invoiceId), {
    onSuccess: () => {
      queryClient.invalidateQueries([qk.fetchInvoices]);
      queryClient.invalidateQueries([qk.invoiceById]);
      queryClient.invalidateQueries([qk.fetchInvoiceActivities]);
      navigate(`/invoices/`);
    },
    onError: (err) => {
      showError(err);
    },
  });
};

export const fetchInvoiceAmountDetail = async (invoiceId: string) => {
  const response = await axiosClient.get(`/api/invoices/${invoiceId}/amount/`);
  return response.data;
};

export function useInvoiceAmountDetail(invoiceId?: string) {
  return useQuery(
    [qk.invoiceAmountById, invoiceId],
    () => fetchInvoiceAmountDetail(invoiceId!),
    {
      enabled: !!invoiceId,
    },
  );
}

export const fetchXInvoiceByInvoiceId = async (
  invoiceId: string,
  queryParams: FetchXInvoiceByInvoiceIdParams,
) => {
  const response = await axiosClient.get<string>(
    `/api/invoices/${invoiceId}/xInvoice`,
    {
      params: queryParams,
      paramsSerializer,
      headers: {Accept: 'application/xml'},
    },
  );
  return response.data;
};

export const useFetchXInvoiceByInvoiceId = () => {
  const {showError} = useSnackbar();

  return useMutation(
    ({
      invoiceId,
      params,
    }: {
      invoiceId: string;
      params: FetchXInvoiceByInvoiceIdParams;
    }) => fetchXInvoiceByInvoiceId(invoiceId, params),
    {
      onError: (err) => {
        showError(err);
      },
    },
  );
};

export const queryInvoiceStatistics = async (
  serviceCompanyId: string,
  params: QueryInvoiceParams,
): Promise<InvoiceStatistics> => {
  const response: AxiosResponse<InvoiceStatistics> = await axiosClient.get(
    `/api/serviceCompanies/${serviceCompanyId}/invoices/statistics`,
    {
      params: {
        ...params,
      },
      paramsSerializer,
    },
  );
  return response.data;
};

export function useInvoiceStatistics(
  params: QueryInvoiceParams,
  options?: UseQueryOptions<any, any, any>,
) {
  const {user} = useUserSession();
  return useQuery<InvoiceStatistics, RestError, InvoiceStatistics>(
    [
      queryKeys.queryServiceOrdersStatistics,
      params,
      user?.userAccount.serviceCompany.id,
    ],
    () =>
      queryInvoiceStatistics(user!.userAccount.serviceCompany.id, {
        ...params,
      }),
    {
      enabled: !!user,
      ...options,
    },
  );
}

export function useAllInvoices(
  params: QueryInvoiceParams,
  options?: UseQueryOptions<InvoiceView[], RestError>,
) {
  const {user} = useUserSession();
  const serviceCompanyId = user?.userAccount.serviceCompany.id;

  return useAll<QueryInvoiceParams, InvoiceView>({
    queryKey: [queryKeys.fetchInvoiceStatistics, params, serviceCompanyId],
    queryFn: (p) => fetchInvoices(p, serviceCompanyId ?? ''),
    params,
    options: {
      enabled: !!serviceCompanyId,
      ...options,
    },
  });
}

import {
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from 'react-query';
import * as _ from 'lodash';
import {queryKeys as qk, queryKeys} from 'reactQuery/constants';
import {axiosClient, paramsSerializer} from 'utils/axios-utils';
import {useSnackbar} from 'hooks/useSnackbar';
import {useNavigate} from 'react-router-dom';
// FIXME: Dummy Import

import {Resource, RestError, SimpleEmailRecord} from 'models/misc';
import {
  InvoiceView,
  QueryInvoiceParams,
  InvoiceFilters,
  InvoiceStatus,
  CreateInvoice,
  UpdateInvoice,
  QueryInvoiceCommentsParams,
  CreateInvoiceComment,
  InvoicePaymentRecord,
} from 'models/invoice';
import {Comment} from 'models/comment';
import {Mixpanel} from 'mixpanel/mixpanel';
import {mixpanelEvents} from 'mixpanel/constants';
import {getTotalFromArticles, getTotalWithVatFromArticles} from 'utils/invoice';
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

export const filterByAmount = (
  invoicesRes: Resource<InvoiceView>,
  amount: InvoiceFilters['amount'],
) =>
  invoicesRes.data.filter((item) => {
    const value =
      item.totalAmount.netAmount / 10 ** item.totalAmount.fractionDigits!;
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

export const fetchInvoice = async (invoiceId: string) => {
  const response = await axiosClient.get<InvoiceView>(
    `/api/invoices/${invoiceId}`,
  );
  return response.data;
};

export function useInvoiceDetail(invoiceId?: string) {
  return useQuery([qk.invoiceById, invoiceId], () => fetchInvoice(invoiceId!), {
    enabled: !!invoiceId,
  });
}

export const postPublishInvoice = async (
  id: string,
  body: SimpleEmailRecord,
) => {
  await axiosClient.post<{value: string}>(`api/invoices/${id}/publish`, body);
};

export const usePublishInvoice = () => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar} = useSnackbar();
  const navigate = useNavigate();

  return useMutation(
    ({invoiceId, body}: {invoiceId: string; body: SimpleEmailRecord}) =>
      postPublishInvoice(invoiceId, body),
    {
      onSuccess: (__, {invoiceId}) => {
        queryClient.invalidateQueries([qk.fetchInvoices]);
        queryClient.invalidateQueries([qk.invoiceById]);
        enqueueSnackbar(`Invoice sent successfully`, {
          variant: 'success',
        });
        navigate(`/invoices/details/${invoiceId}`);
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

export const putInvoicePaymentStatus = async (id: string) => {
  await axiosClient.put(`api/invoices/${id}/payment`);
};

export const useInvoicePaymentStatus = () => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar} = useSnackbar();
  const navigate = useNavigate();

  return useMutation(
    (invoiceId: string) => putInvoicePaymentStatus(invoiceId),
    {
      onSuccess: (__, invoiceId) => {
        queryClient.invalidateQueries([qk.fetchInvoices]);
        queryClient.invalidateQueries([qk.invoiceById]);
        enqueueSnackbar(`Invoice marked as paid`, {
          variant: 'success',
        });
        navigate(`/invoices/details/${invoiceId}`);
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
  const {enqueueSnackbar} = useSnackbar();
  const navigate = useNavigate();

  return useMutation(
    ({invoiceId, body}: {invoiceId: string; body: InvoicePaymentRecord}) =>
      addInvoicePayment({invoiceId, body}),
    {
      onSuccess: (__, {invoiceId}) => {
        queryClient.invalidateQueries([qk.fetchInvoices]);
        queryClient.invalidateQueries([qk.invoiceById]);
        enqueueSnackbar(`Invoice marked as paid!`, {
          variant: 'success',
        });
        navigate(`/invoices/details/${invoiceId}`);
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

export const postInvoice = async (body: CreateInvoice) => {
  const {data} = await axiosClient.post<{value: string}>('api/invoices', body);
  return data;
};

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar} = useSnackbar();
  const navigate = useNavigate();

  return useMutation(({data}: {data: CreateInvoice}) => postInvoice(data), {
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries([qk.fetchInvoices]);
      queryClient.invalidateQueries([qk.invoiceById]);
      enqueueSnackbar(`Invoice created successfully`, {
        variant: 'success',
      });
      Mixpanel.identifyAndTrack(mixpanelEvents.NEW_INVOICE_CREATED, {
        invoiceId: data.value,
        propertyOwnerId: variables.data.propertyOwnerId,
        serviceOrderId: variables.data.serviceOrderId,
        amountWithoutVat: getTotalFromArticles(variables.data.items),
        amountWithVat: getTotalWithVatFromArticles(variables.data.items),
        isPartialInvoice: variables.data.type === 'PARTIAL',
      });
      navigate(`/invoices/details/${data.value}`);
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
  });
};

export const putInvoice = async (body: UpdateInvoice, id: string) => {
  await axiosClient.put(`api/invoices/${id}`, body);
};

export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar} = useSnackbar();

  return useMutation(
    ({data, invoiceId}: {data: UpdateInvoice; invoiceId: string}) =>
      putInvoice(data, invoiceId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([qk.fetchInvoices]);
        queryClient.invalidateQueries([qk.invoiceById]);
        enqueueSnackbar(`Invoice updated successfully`, {
          variant: 'success',
        });
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

export const deleteInvoice = async (id: string, navigate: boolean) => {
  await axiosClient.delete(`api/invoices/${id}`);
  return navigate;
};

export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar} = useSnackbar();
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
        enqueueSnackbar(`Invoice deleted successfully`, {
          variant: 'success',
        });
        if (shouldNavigate) navigate(`/invoices?pageIndex=1&pageSize=25`);
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

export const useCreateInvoiceComment = () => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar} = useSnackbar();

  return useMutation(
    ({invoiceId, body}: {invoiceId: string; body: CreateInvoiceComment}) =>
      postInvoiceComment(invoiceId, body),
    {
      onSuccess: () => queryClient.invalidateQueries([qk.fetchInvoiceComments]),
      onError: (err) => {
        console.log(err);
        enqueueSnackbar('An unexpected error occurred, please try again.', {
          variant: 'error',
        });
      },
    },
  );
};

export const deleteInvoiceComment = async (
  invoiceId: string,
  commentId: string,
) => {
  const {data} = await axiosClient.delete<{value: string}>(
    `/api/invoices/${invoiceId}/comments/${commentId}`,
  );
  return data;
};

export const useDeleteInvoiceComment = () => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar} = useSnackbar();

  return useMutation(
    ({invoiceId, commentId}: {invoiceId: string; commentId: string}) =>
      deleteInvoiceComment(invoiceId, commentId),
    {
      onSuccess: () => queryClient.invalidateQueries([qk.fetchInvoiceComments]),
      onError: (err) => {
        console.log(err);
        enqueueSnackbar('An unexpected error occurred, please try again.', {
          variant: 'error',
        });
      },
    },
  );
};

export const updateInvoiceComment = async (
  invoiceId: string,
  commentId: string,
  body: CreateInvoiceComment,
) => {
  const {data} = await axiosClient.put<{value: string}>(
    `/api/invoices/${invoiceId}/comments/${commentId}`,
    body,
  );
  return data;
};

export const useUpdateInvoiceComment = () => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar} = useSnackbar();

  return useMutation(
    ({
      invoiceId,
      commentId,
      body,
    }: {
      invoiceId: string;
      commentId: string;
      body: CreateInvoiceComment;
    }) => updateInvoiceComment(invoiceId, commentId, body),
    {
      onSuccess: () => queryClient.invalidateQueries([qk.fetchInvoiceComments]),
      onError: (err) => {
        console.log(err);
        enqueueSnackbar('An unexpected error occurred, please try again.', {
          variant: 'error',
        });
      },
    },
  );
};

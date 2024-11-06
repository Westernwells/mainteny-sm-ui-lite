import {
  UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';
import {queryKeys as qk} from 'reactQuery/constants';
import {axiosClient, paramsSerializer} from 'utils/axios-utils';
import {useSnackbar} from 'hooks/useSnackbar';
import {useNavigate} from 'react-router-dom';
import {Resource, RestError, StringValue} from 'models/misc';
import {
  CreatePurchaseInvoiceRecord,
  PurchaseInvoiceStatistics,
  PurchaseInvoiceStatus,
  PurchaseInvoiceView,
  QueryPurchaseInvoiceParams,
  QueryPurchaseInvoiceStatisticsParams,
  UpdatePurchaseInvoiceRecord,
} from 'models/purchaseInvoice';
import {AxiosResponse} from 'axios';
import {useUserSession} from './useUserSession';

export const fetchPurchaseInvoices = async (
  params: QueryPurchaseInvoiceParams,
  id: string,
): Promise<Resource<PurchaseInvoiceView>> => {
  const response = await axiosClient.get<Resource<PurchaseInvoiceView>>(
    `/api/serviceCompanies/${id}/purchaseInvoices`,
    {
      params,
      paramsSerializer,
    },
  );
  return response.data;
};

export function usePurchaseInvoices(
  params: QueryPurchaseInvoiceParams,
  options?: any,
) {
  const {user} = useUserSession();
  return useQuery<Resource<PurchaseInvoiceView>, RestError>(
    [qk.fetchPurchaseInvoices, params, user?.userAccount.id],
    () => fetchPurchaseInvoices(params, user!.userAccount.serviceCompany.id),
    {
      enabled: !!user,
      ...options,
    },
  );
}

export const fetchPurchaseInvoiceStatistics = async (
  params: QueryPurchaseInvoiceStatisticsParams,
  id: string,
): Promise<PurchaseInvoiceStatistics> => {
  const mappedPurchaseInvoiceStatus = params.status?.reduce(
    (acc, currentStatus) => [...acc, currentStatus],
    [] as PurchaseInvoiceStatus[],
  );

  const response: AxiosResponse<PurchaseInvoiceStatistics> =
    await axiosClient.get(
      `/api/serviceCompanies/${id}/purchaseInvoices/statistics`,
      {
        params: {
          ...params,
          ...(mappedPurchaseInvoiceStatus
            ? {status: mappedPurchaseInvoiceStatus}
            : {}),
        },
        paramsSerializer,
      },
    );

  return response.data;
};

export function usePurchaseInvoiceStatistics(
  params: QueryPurchaseInvoiceStatisticsParams,
  options?: UseQueryOptions<any, any, any>,
) {
  const {user} = useUserSession();
  return useQuery<
    PurchaseInvoiceStatistics,
    RestError,
    PurchaseInvoiceStatistics
  >(
    [qk.fetchPurchaseInvoiceStatistics, params, user?.userAccount.id],
    () =>
      fetchPurchaseInvoiceStatistics(
        params,
        user!.userAccount.serviceCompany.id,
      ),
    {
      enabled:
        !!user && !!(params.createdDateTimeFrom && params.createdDateTimeTo),
      ...options,
    },
  );
}

export const fetchPurchaseInvoiceDetail = async (invoiceId: string) => {
  const response = await axiosClient.get<PurchaseInvoiceView>(
    `/api/purchaseInvoices/${invoiceId}`,
  );
  return response.data;
};

export function usePurchaseInvoiceDetail(invoiceId?: string) {
  return useQuery(
    [qk.purchaseInvoiceById, invoiceId],
    () => fetchPurchaseInvoiceDetail(invoiceId!),
    {
      enabled: !!invoiceId,
      ...{},
    },
  );
}

export const postPurchaseInvoice = async (
  body: CreatePurchaseInvoiceRecord,
) => {
  const {data} = await axiosClient.post<StringValue>(
    '/api/purchaseInvoices',
    body,
  );
  return data;
};

export const useCreatePurchaseInvoice = () => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar, showError} = useSnackbar();

  return useMutation(
    ({data}: {data: CreatePurchaseInvoiceRecord}) => postPurchaseInvoice(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([qk.fetchPurchaseInvoices]);
        queryClient.invalidateQueries([qk.purchaseInvoiceById]);

        enqueueSnackbar(`Purchase Invoice created successfully`, {
          variant: 'success',
        });
      },
      onError: (err) => {
        showError(err);
      },
    },
  );
};

export const putPurchaseInvoice = async (
  body: UpdatePurchaseInvoiceRecord,
  id: string,
) => {
  const {data} = await axiosClient.put<StringValue>(
    `api/purchaseInvoices/${id}`,
    body,
  );
  return data;
};

export const useUpdatePurchaseInvoice = () => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar, showError} = useSnackbar();

  return useMutation(
    ({
      data,
      invoiceId,
    }: {
      data: UpdatePurchaseInvoiceRecord;
      invoiceId: string;
    }) => putPurchaseInvoice(data, invoiceId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([qk.fetchPurchaseInvoices]);
        queryClient.invalidateQueries([qk.purchaseInvoiceById]);
        enqueueSnackbar(`Purchase Invoice updated successfully`, {
          variant: 'success',
        });
      },
      onError: (err) => {
        showError(err);
      },
    },
  );
};

export const deletePurchaseInvoice = async (id: string, navigate: boolean) => {
  await axiosClient.delete(`api/purchaseInvoices/${id}`);
  return navigate;
};

export const useDeletePurchaseInvoice = () => {
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
    }) => deletePurchaseInvoice(invoiceId, shouldNavigate),
    {
      onSuccess: (__, {shouldNavigate}) => {
        queryClient.invalidateQueries([qk.fetchPurchaseInvoices]);
        queryClient.invalidateQueries([qk.purchaseInvoiceById]);
        if (shouldNavigate)
          navigate(`/purchase-invoices?pageIndex=1&pageSize=25`);
      },
      onError: (err) => {
        showError(err);
      },
    },
  );
};

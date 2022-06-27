import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from 'react-query';
import * as _ from 'lodash';
import {useCallback} from 'react';
import {queryKeys as qk, queryKeys} from 'reactQuery/constants';
import {axiosClient, paramsSerializer} from 'utils/axios-utils';
import {useSnackbar} from 'notistack';
import {useNavigate} from 'react-router';
// FIXME: Dummy Import

import {Resource, RestError} from 'models/misc';
import {
  InvoiceView,
  QueryInvoiceParams,
  InvoiceFilters,
  InvoiceStatus,
  CreateInvoice,
  UpdateInvoice,
} from 'models/invoice';
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
    (item) => item.serviceOrder.type,
  );

  serviceType
    .map((item) => invoiceServiceTypeMap[item])
    .filter((item) => item)
    .forEach((item) => {
      filterResult = [...filterResult, ...item];
    });

  return filterResult;
};

const filterInvoices = (
  invoicesRes: Resource<InvoiceView>,
  filters: InvoiceFilters,
) => {
  let result = {...invoicesRes};

  if (filters.amount) {
    const amounts = filterByAmount(result, filters.amount);
    result = {...result, data: amounts, total: amounts.length};
  }
  if (filters.status) {
    const status = filterByStatus(result, filters.status);
    result = {...result, data: status, total: status.length};
  }
  if (filters.serviceType.length) {
    const serviceTypes = filterByServiceType(result, filters.serviceType);
    result = {...result, data: serviceTypes, total: serviceTypes.length};
  }
  return result;
};

export function useInvoices(
  params: QueryInvoiceParams,
  // TODO: Write 'interface' for filter object
  filters: InvoiceFilters,
  options?: any,
) {
  const {user} = useUserSession();
  return useQuery<Resource<InvoiceView>, RestError>(
    [qk.fetchInvoices, params, user?.userAccount.id],
    () => fetchInvoices(params, user!.userAccount.serviceCompany.id),
    {
      enabled: !!user,
      ...options,
      select: useCallback(
        (invoicesRes: Resource<InvoiceView>) => {
          const filterResult = filterInvoices(invoicesRes, filters);
          return filterResult;
        },
        [filters],
      ),
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
  const navigate = useNavigate();

  return useQuery([qk.invoiceById, invoiceId], () => fetchInvoice(invoiceId!), {
    enabled: !!invoiceId,
    onError: (e: any) => {
      if (e.response.status === 500) navigate('/404');
    },
  });
}

export const postPublishInvoice = async (id: string) => {
  await axiosClient.post(`api/invoices/${id}/publish`);
};

export const usePublishInvoice = () => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar} = useSnackbar();
  const navigate = useNavigate();

  return useMutation((invoiceId: string) => postPublishInvoice(invoiceId), {
    onSuccess: (__, invoiceId) => {
      queryClient.invalidateQueries([qk.fetchInvoices]);
      queryClient.invalidateQueries([qk.invoiceById]);
      enqueueSnackbar(`Invoice sent!`, {
        variant: 'success',
      });
      navigate(`/invoices/details/${invoiceId}`);
    },
    onError: (err) => {
      console.log(err);
      enqueueSnackbar('Some error occurred, please try again!', {
        variant: 'error',
      });
    },
  });
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
        enqueueSnackbar(`Invoice marked as paid!`, {
          variant: 'success',
        });
        navigate(`/invoices/details/${invoiceId}`);
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

export const postInvoice = async (body: CreateInvoice, publish: boolean) => {
  const {data} = await axiosClient.post<{value: string}>('api/invoices', body);
  return {data, publish};
};

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar} = useSnackbar();
  const navigate = useNavigate();
  const {mutate: publishInvoice} = usePublishInvoice();

  return useMutation(
    ({data, publish}: {data: CreateInvoice; publish: boolean}) =>
      postInvoice(data, publish),
    {
      onSuccess: ({data, publish}) => {
        queryClient.invalidateQueries([qk.fetchInvoices]);
        queryClient.invalidateQueries([qk.invoiceById]);
        enqueueSnackbar(`Invoice created successfully!`, {
          variant: 'success',
        });
        if (publish) {
          publishInvoice(data.value);
        } else {
          navigate('/invoices?pageIndex=1&pageSize=25');
        }
      },
      onError: (err) => {
        console.log(err);
        enqueueSnackbar('Something went wrong, please try again!', {
          variant: 'error',
        });
      },
    },
  );
};

export const putInvoice = async (
  body: UpdateInvoice,
  id: string,
  publish: boolean,
) => {
  await axiosClient.put(`api/invoices/${id}`, body);
  return publish;
};

export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();
  const {enqueueSnackbar} = useSnackbar();
  const {mutate: publishInvoice} = usePublishInvoice();

  return useMutation(
    ({
      data,
      invoiceId,
      publish,
    }: {
      data: UpdateInvoice;
      invoiceId: string;
      publish: boolean;
    }) => putInvoice(data, invoiceId, publish),
    {
      onSuccess: (__, {publish, invoiceId}) => {
        queryClient.invalidateQueries([qk.fetchInvoices]);
        queryClient.invalidateQueries([qk.invoiceById]);
        enqueueSnackbar(`Invoice updated successfully!`, {
          variant: 'success',
        });
        if (publish) {
          publishInvoice(invoiceId);
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

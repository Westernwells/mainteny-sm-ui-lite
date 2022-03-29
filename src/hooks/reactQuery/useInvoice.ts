import {useQuery} from 'react-query';
import * as _ from 'lodash';
import {useCallback} from 'react';
import {queryKeys as qk} from 'reactQuery/constants';
import {axiosClient, paramsSerializer} from 'utils/axios-utils';
import {useNavigate} from 'react-router';
// FIXME: Dummy Import

import {Resource, RestError} from 'models/misc';
import {
  InvoiceView,
  QueryInvoiceParams,
  InvoiceFilters,
  InvoiceStatus,
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
      item.totalAmount.amount / 10 ** item.totalAmount.fractionDigits!;
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
  console.log(typeof navigate);
  return useQuery(qk.invoiceById, () => fetchInvoice(invoiceId!), {
    enabled: !!invoiceId,
    onError: (e: any) => {
      if (e.response.status === 500) navigate('/404');
    },
  });
}

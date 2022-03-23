import {useQuery} from 'react-query';
// import * as _ from 'lodash';
import {useCallback} from 'react';
import {queryKeys as qk} from 'reactQuery/constants';
import {axiosClient, paramsSerializer} from 'utils/axios-utils';
import {useNavigate} from 'react-router';
// FIXME: Dummy Import

import {Resource, RestError} from 'models/misc';
import {InvoiceView, QueryInvoiceParams} from 'models/invoice';
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

const filterInvoices = (invoicesRes: Resource<InvoiceView>, filters: {}) => {
  const result = {...invoicesRes};
  // TODO: Filter code goes here
  console.log(filters);
  return result;
};

export function useInvoices(
  params: QueryInvoiceParams,
  // TODO: Write 'interface' for filter object
  filters: {},
) {
  const {user} = useUserSession();
  return useQuery<Resource<InvoiceView>, RestError>(
    [qk.fetchInvoice, params, user?.userAccount.id],
    () => fetchInvoices(params, user!.userAccount.serviceCompany.id),
    {
      enabled: !!user,
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

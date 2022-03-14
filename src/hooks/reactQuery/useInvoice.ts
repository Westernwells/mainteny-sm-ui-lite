import {useQuery} from 'react-query';
import {useCallback} from 'react';
import {queryKeys as qk} from 'reactQuery/constants';
// FIXME: Dummy Import
import {invoices} from 'pages/Invoices/data';
import {invoiceDetail} from 'pages/InvoiceDetails/data';

import {Resource, RestError} from 'models/misc';
import {InvoiceView, QueryInvoiceParams} from 'models/invoice';
import {useServiceManager} from './useServiceManager';

// TODO: make API call to fetch Invoices
const staticInvoices = invoices;
/* eslint-disable no-unused-vars */
export const fetchInvoices = async (
  params: QueryInvoiceParams,
  id: string,
): Promise<Resource<InvoiceView>> =>
  // TODO: make API call to fetch Invoices

  // const response = await axiosClient.get<Resource<InvoiceView>>(
  //   `/api/propertyOwners/${id}/invoices`,
  //   {
  //     params,
  //     paramsSerializer,
  //   },
  // );
  Promise.resolve(staticInvoices);

const filterInvoices = (invoicesRes: Resource<InvoiceView>, filters: {}) => {
  const result = {...invoicesRes};
  // TODO: Filter code goes here
  return result;
};

export function useInvoices(
  params: QueryInvoiceParams,
  // TODO: Write 'interface' for filter object
  filters: {},
) {
  const {data: user} = useServiceManager();
  return useQuery<Resource<InvoiceView>, RestError>(
    [qk.fetchInvoice, params, user?.id],
    () => fetchInvoices(params, user!.serviceManager.id),
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

// TODO: make API call to fetch Invoices
const staticInvoiceDetails = invoiceDetail;

export const fetchInvoice = async (invoiceId: string) =>
  // TODO: make API call to fetch Invoice Details

  // const response = await axiosClient.get<InvoiceView>(
  //   `/api/invoices/${invoiceId}`,
  // );

  Promise.resolve(staticInvoiceDetails);

export function useInvoiceDetail(invoiceId?: string) {
  return useQuery(qk.invoiceById, () => fetchInvoice(invoiceId!), {
    enabled: !!invoiceId,
  });
}
/* eslint-enable no-unused-vars */

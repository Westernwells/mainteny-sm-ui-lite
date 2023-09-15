import {useLocation} from 'react-router-dom';
import queryString from 'query-string';
import Box from '@mui/material/Box';
import {Progress} from 'components/Progress';
import {useServiceOrderDetails} from 'hooks/reactQuery/useServiceOrder';
import {useInvoiceDetail} from 'hooks/reactQuery/useInvoice';
import {useGetCustomer} from 'hooks/reactQuery/useCustomers';
import {InvoiceType} from 'models/invoice';
import {InvoiceForm} from './InvoiceForm';

export const NewInvoice = () => {
  const {search} = useLocation();

  const {
    orderId,
    invoiceId = '',
    invoiceType = '',
    customerId = '',
  } = queryString.parse(search);

  const {data: serviceOrderDetails, isLoading} =
    typeof orderId === 'string'
      ? useServiceOrderDetails(orderId)
      : {data: undefined, isLoading: false};

  const {data: invoice, isLoading: isLoadingInvoice} =
    typeof invoiceId === 'string'
      ? useInvoiceDetail(invoiceId)
      : {data: undefined, isLoading: false};

  const {data: customer, isLoading: isLoadingCustomer} =
    typeof customerId === 'string'
      ? useGetCustomer(customerId)
      : {data: undefined, isLoading: false};

  if (isLoading || isLoadingInvoice || isLoadingCustomer) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexGrow={1}>
        <Progress height="100%" />
      </Box>
    );
  }
  return (
    <InvoiceForm
      serviceOrderResource={serviceOrderDetails}
      invoice={invoice}
      invoiceType={invoiceType as InvoiceType}
      customer={customer}
      // customerResource={customerResource.data}
    />
  );
};

export default NewInvoice;

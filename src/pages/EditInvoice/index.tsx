import {useInvoiceDetail} from 'hooks/reactQuery/useInvoice';
import {useLocation, useParams} from 'react-router-dom';
import {Progress} from 'components/Progress';
import {EmptySection} from 'components/EmptySection';
import {InvoiceForm} from 'pages/InvoiceDetails/InvoiceForm';
import {ServiceCompanyType} from 'models/service-company';
import queryString from 'query-string';
import {useGetCustomer} from 'hooks/reactQuery/useCustomers';

export const EditInvoicePage = () => {
  const {id: invoiceId} = useParams();
  const {data: invoice, isLoading, isFetched} = useInvoiceDetail(invoiceId);

  const {search} = useLocation();

  const {customerId = ''} = queryString.parse(search);

  const {data: customer, isLoading: isLoadingCustomer} =
    typeof customerId === 'string'
      ? useGetCustomer(customerId)
      : {data: undefined, isLoading: false};

  if (isLoading || isLoadingCustomer) {
    return <Progress />;
  }

  return isFetched && invoice ? (
    <InvoiceForm
      serviceCompanyType={ServiceCompanyType.PROPERTY_OWNER_PAYMENT_TERM}
      invoice={invoice}
      isNewInvoice={false}
      customerResource={customer}
    />
  ) : (
    <EmptySection label="Sorry, we couldn't find the invoice." />
  );
};

export default EditInvoicePage;

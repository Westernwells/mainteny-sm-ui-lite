import {useInvoiceDetail} from 'hooks/reactQuery/useInvoice';
import {useParams} from 'react-router-dom';
import {Progress} from 'components/Progress';
import {EmptySection} from 'components/EmptySection';
import {InvoiceForm} from 'pages/InvoiceDetails/InvoiceForm';

export const EditInvoicePage = () => {
  const {id: invoiceId} = useParams();
  const {data: invoice, isLoading, isFetched} = useInvoiceDetail(invoiceId);

  if (isLoading) {
    return <Progress />;
  }

  return isFetched && invoice ? (
    <InvoiceForm formType="edit" invoice={invoice} />
  ) : (
    <EmptySection label="Sorry, we couldn't find the invoice." />
  );
};

export default EditInvoicePage;

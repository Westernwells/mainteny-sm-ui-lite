import {useParams} from 'react-router-dom';
import {Progress} from 'components/Progress';
import {EmptySection} from 'components/EmptySection';
import {usePurchaseInvoiceDetail} from 'hooks/reactQuery/usePurchaseInvoice';
import NewPurchaseInvoice from 'pages/NewPurchaseInvoice';

export const EditPurchaseInvoice = () => {
  const {id: purchaseInvoiceId} = useParams();
  const {
    data: purchaseInvoice,
    isLoading,
    isFetched,
  } = usePurchaseInvoiceDetail(purchaseInvoiceId);

  if (isLoading) {
    return <Progress />;
  }

  return isFetched && purchaseInvoice ? (
    <NewPurchaseInvoice purchaseInvoice={purchaseInvoice} formType="edit" />
  ) : (
    <EmptySection label="Sorry, we couldn't find the purchase invoice." />
  );
};

export default EditPurchaseInvoice;

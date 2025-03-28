import {useParams} from 'react-router-dom';
import {
  useQuotationDetails,
  useQuotationSubItems,
} from 'hooks/reactQuery/useQuotation';
import {Progress} from 'components/Progress';
import {EmptySection} from 'components/EmptySection';
import DraftQuotation from 'pages/QuotationDetails/DraftQuotation';
import {ServiceCompanyType} from 'models/service-company';

export const EditQuotationPage = () => {
  const {id: quotationId} = useParams();
  const {
    data: quotation,
    isLoading,
    isFetched,
  } = useQuotationDetails(quotationId);

  const {
    data: quotationSubItems,
    isLoading: isLoadingSubItems,
    isFetched: isFetchedSubItems,
  } = useQuotationSubItems(quotationId);

  if (isLoading || isLoadingSubItems) {
    return <Progress />;
  }

  return isFetched && isFetchedSubItems && quotation ? (
    <DraftQuotation
      formType="edit"
      serviceCompanyType={ServiceCompanyType.PROPERTY_OWNER_PAYMENT_TERM}
      quotation={quotation}
      quotationSubItems={quotationSubItems}
    />
  ) : (
    <EmptySection label="Sorry, we couldn't find the quotation." />
  );
};

export default EditQuotationPage;

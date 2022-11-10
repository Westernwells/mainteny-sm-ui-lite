import {useParams} from 'react-router-dom';
import {useQuotationDetails} from 'hooks/reactQuery/useQuotation';
import {Progress} from 'components/Progress';
import {EmptySection} from 'components/EmptySection';
import {EditQuotation} from './EditQuotation';

export const EditQuotationPage = () => {
  const {id: quotationId} = useParams();
  const {
    data: quotation,
    isLoading,
    isFetched,
  } = useQuotationDetails(quotationId);

  if (isLoading) {
    return <Progress />;
  }

  return isFetched && quotation ? (
    <EditQuotation quotation={quotation} />
  ) : (
    <EmptySection label="Sorry, we couldn't find the quotation." />
  );
};

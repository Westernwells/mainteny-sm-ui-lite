import {useParams} from 'react-router-dom';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {useQuotationDetails} from 'hooks/reactQuery/useQuotation';
import {Progress} from 'components/Progress';
import {EmptySection} from 'components/EmptySection';
import {ViewQuotation} from './ViewQuotation';

export const QuotationDetails = () => {
  const {id: quotationId} = useParams();

  const {
    data: quotation,
    isIdle,
    isLoading,
    isFetched,
  } = useQuotationDetails(quotationId);

  const {data: downloadUrl} = useDownloadUrl(
    isFetched ? [quotation!.additionalInfo.pdfPath] : [],
  );

  if (isIdle || isLoading) {
    return <Progress />;
  }

  return isFetched && quotation ? (
    <ViewQuotation
      downloadUrl={downloadUrl ? Object.values(downloadUrl)[0] : ''}
      quotation={quotation}
    />
  ) : (
    <EmptySection label="Sorry, we couldn't find the quotation." />
  );
};

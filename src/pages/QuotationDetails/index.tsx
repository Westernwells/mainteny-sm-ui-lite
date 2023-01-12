import {useParams} from 'react-router-dom';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {
  useQuotationActivities,
  useQuotationDetails,
} from 'hooks/reactQuery/useQuotation';
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
  const {data: quotationActivities, isLoading: isLoadingQuotationActivities} =
    useQuotationActivities({quotationId: quotationId ?? ''});

  const {data: downloadUrl} = useDownloadUrl(
    isFetched ? [quotation!.additionalInfo.pdfPath] : [],
  );

  if (isIdle || isLoading || isLoadingQuotationActivities) {
    return <Progress />;
  }

  return isFetched && quotation ? (
    <ViewQuotation
      downloadUrl={downloadUrl ? Object.values(downloadUrl)[0] : ''}
      quotation={quotation}
      quotationActivities={quotationActivities!}
    />
  ) : (
    <EmptySection label="Sorry, we couldn't find the quotation." />
  );
};

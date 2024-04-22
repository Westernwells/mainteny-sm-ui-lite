import {useParams} from 'react-router-dom';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {
  useQuotationActivities,
  useQuotationDetails,
} from 'hooks/reactQuery/useQuotation';
import {Progress} from 'components/Progress';
import {EmptySection} from 'components/EmptySection';
import {PdfGenerationStatus} from 'models/misc';
import {useEffect, useLayoutEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {ViewQuotation} from './ViewQuotation';

interface Props {
  getCurrentPageTitle?: (title: string) => void;
}

export const QuotationDetails = ({getCurrentPageTitle}: Props) => {
  const {id: quotationId} = useParams();

  const {
    data: quotation,
    isIdle,
    isLoading,
    isFetched,
    refetch,
  } = useQuotationDetails(quotationId);
  const {t} = useTranslation();
  const {data: quotationActivities, isLoading: isLoadingQuotationActivities} =
    useQuotationActivities({quotationId: quotationId ?? ''});

  const {data: downloadUrl, isLoading: isLoadingDownloadUrl} = useDownloadUrl(
    isFetched && quotation?.additionalInfo.pdfPath
      ? [quotation.additionalInfo.pdfPath]
      : [],
  );
  const [externalId, setExternalId] = useState('');

  useLayoutEffect(() => {
    if (getCurrentPageTitle) {
      getCurrentPageTitle(`${t('Quotation Details')} - ${externalId}`);
    }
  }, [externalId, t]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (
        quotation?.additionalInfo.pdfGenerationStatus ===
        PdfGenerationStatus.RUNNING
      ) {
        refetch();
      }
    }, 3000);
    setExternalId(quotation?.externalId || '');
    return () => {
      clearInterval(timer);
    };
  }, [quotation]);

  if (isIdle || isLoading || isLoadingQuotationActivities) {
    return <Progress />;
  }

  return isFetched && quotation ? (
    <ViewQuotation
      downloadUrl={downloadUrl ? Object.values(downloadUrl)[0] : ''}
      quotation={quotation}
      quotationActivities={quotationActivities!}
      isLoadingDownloadUrl={isLoadingDownloadUrl}
    />
  ) : (
    <EmptySection label="Sorry, we couldn't find the quotation." />
  );
};

export default QuotationDetails;

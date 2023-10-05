import {useContext, useEffect, useLayoutEffect} from 'react';
import {
  useInvoiceActivities,
  useInvoiceDetail,
} from 'hooks/reactQuery/useInvoice';
import {useParams} from 'react-router-dom';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {Progress} from 'components/Progress';
import {EmptySection} from 'components/EmptySection';
import {LanguageContext} from 'context/LanguageProvider';
import {useTranslation} from 'react-i18next';
import {PdfGenerationStatus} from 'models/misc';
import {ViewInvoice} from './ViewInvoice';

interface Props {
  getCurrentPageTitle?: (title: string) => void;
}

export const InvoiceDetails = ({getCurrentPageTitle}: Props) => {
  const {id: invoiceId} = useParams();
  const {t} = useTranslation();
  const {
    data: invoice,
    isLoading,
    isFetched,
    refetch,
  } = useInvoiceDetail(invoiceId);
  const {data: invoiceActivities, isLoading: isLoadingInvoiceActivities} =
    useInvoiceActivities({invoiceId: invoiceId ?? ''});
  const {language} = useContext(LanguageContext);

  const {data: downloadUrl, isLoading: isLoadingDownloadUrl} = useDownloadUrl(
    isFetched ? [invoice!.additionalInfo.pdfPath] : [],
  );

  useLayoutEffect(() => {
    if (getCurrentPageTitle) {
      getCurrentPageTitle(`${t('Invoice Details')}`);
    }
  }, [language]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (
        invoice?.additionalInfo.pdfGenerationStatus ===
        PdfGenerationStatus.RUNNING
      ) {
        refetch();
      }
    }, 3000);

    return () => {
      clearInterval(timer);
    };
  }, [invoice]);

  if (isLoading || isLoadingInvoiceActivities) {
    return <Progress />;
  }
  return isFetched && invoice ? (
    <ViewInvoice
      downloadUrl={downloadUrl ? Object.values(downloadUrl)[0] : ''}
      invoice={invoice}
      invoiceActivities={invoiceActivities!}
      isLoadingDownloadUrl={isLoadingDownloadUrl}
    />
  ) : (
    <EmptySection label="Sorry, we couldn't find the invoice." />
  );
};

export default InvoiceDetails;

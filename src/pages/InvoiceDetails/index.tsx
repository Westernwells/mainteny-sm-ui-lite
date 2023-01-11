import {useContext, useLayoutEffect} from 'react';
import {
  useInvoiceActivities,
  useInvoiceDetail,
} from 'hooks/reactQuery/useInvoice';
import {useParams} from 'react-router-dom';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {useServiceOrderWorkReport} from 'hooks/reactQuery/useServiceOrder';
import {Progress} from 'components/Progress';
import {EmptySection} from 'components/EmptySection';
import {LanguageContext} from 'context/LanguageProvider';
import {useTranslation} from 'react-i18next';
import {ViewInvoice} from './ViewInvoice';

interface Props {
  getCurrentPageTitle?: (title: string) => void;
}

export const InvoiceDetails = ({getCurrentPageTitle}: Props) => {
  const {id: invoiceId} = useParams();
  const {t} = useTranslation();
  const {data: invoice, isLoading, isFetched} = useInvoiceDetail(invoiceId);
  const {data: invoiceActivities, isLoading: isLoadingInvoiceActivities} =
    useInvoiceActivities({invoiceId: invoiceId ?? ''});
  const {language} = useContext(LanguageContext);
  const {data: workReport, isLoading: isLoadingWorkReport} =
    useServiceOrderWorkReport(invoice?.serviceOrder?.id ?? '', {
      useErrorBoundary: false,
      retry: false,
      enabled: !!invoice?.serviceOrder?.id,
    });

  const {data: downloadUrl} = useDownloadUrl(
    isFetched ? [invoice!.additionalInfo.pdfPath] : [],
  );

  useLayoutEffect(() => {
    if (getCurrentPageTitle) {
      getCurrentPageTitle(`${t('Invoice Details')}`);
    }
  }, [language]);

  if (isLoading || isLoadingWorkReport || isLoadingInvoiceActivities) {
    return <Progress />;
  }

  return isFetched && invoice ? (
    <ViewInvoice
      downloadUrl={downloadUrl ? Object.values(downloadUrl)[0] : ''}
      invoice={invoice}
      workReport={workReport!}
      invoiceActivities={invoiceActivities!}
    />
  ) : (
    <EmptySection label="Sorry, we couldn't find the invoice." />
  );
};

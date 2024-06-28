import {useContext, useLayoutEffect} from 'react';
import {
  useInvoiceActivities,
  useInvoiceDetail,
} from 'hooks/reactQuery/useInvoice';
import {useParams} from 'react-router-dom';
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

  useLayoutEffect(() => {
    if (getCurrentPageTitle) {
      getCurrentPageTitle(`${t('Invoice Details')}`);
    }
  }, [language]);

  if (isLoading || isLoadingInvoiceActivities) {
    return <Progress />;
  }
  return isFetched && invoice ? (
    <ViewInvoice
      invoice={{
        ...invoice,
        subject: invoice.subject === 'Regular' ? 'Invoice' : invoice.subject,
      }}
      invoiceActivities={invoiceActivities!}
    />
  ) : (
    <EmptySection label="Sorry, we couldn't find the invoice." />
  );
};

export default InvoiceDetails;

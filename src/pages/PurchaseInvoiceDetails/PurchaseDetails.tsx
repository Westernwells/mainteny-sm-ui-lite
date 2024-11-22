import {useContext, useLayoutEffect} from 'react';
import {useParams} from 'react-router-dom';
import {Progress} from 'components/Progress';
import {EmptySection} from 'components/EmptySection';
import {LanguageContext} from 'context/LanguageProvider';
import {useTranslation} from 'react-i18next';
import {usePurchaseInvoiceDetail} from 'hooks/reactQuery/usePurchaseInvoice';
import {PurchaseInvoiceDetails} from '.';

interface Props {
  getCurrentPageTitle?: (title: string) => void;
}

export const PurchaseDetails = ({getCurrentPageTitle}: Props) => {
  const {id: invoiceId} = useParams();
  const {t} = useTranslation();
  const {
    data: purchaseInvoice,
    isLoading,
    isFetched,
  } = usePurchaseInvoiceDetail(invoiceId);
  const {language} = useContext(LanguageContext);

  useLayoutEffect(() => {
    if (getCurrentPageTitle) {
      getCurrentPageTitle(`${t('Purchase Invoice Details')}`);
    }
  }, [language]);

  if (isLoading) {
    return <Progress />;
  }
  return isFetched && purchaseInvoice ? (
    <PurchaseInvoiceDetails purchaseInvoice={purchaseInvoice} />
  ) : (
    <EmptySection label="Sorry, we couldn't find the invoice." />
  );
};

export default PurchaseDetails;

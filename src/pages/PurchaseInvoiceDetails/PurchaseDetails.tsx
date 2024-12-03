import {useContext, useLayoutEffect} from 'react';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {Progress} from 'components/Progress';
import {EmptySection} from 'components/EmptySection';
import {LanguageContext} from 'context/LanguageProvider';
import {useTranslation} from 'react-i18next';
import {usePurchaseInvoiceDetail} from 'hooks/reactQuery/usePurchaseInvoice';
import {PageLayout} from 'components/PageLayout';
import {PurchaseInvoiceDetails} from '.';

interface Props {
  getCurrentPageTitle?: (title: string) => void;
}

export const PurchaseDetails = ({getCurrentPageTitle}: Props) => {
  const {id: invoiceId} = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const {t} = useTranslation();
  const {
    data: purchaseInvoice,
    isLoading,
    isFetched,
  } = usePurchaseInvoiceDetail(invoiceId);
  const {language} = useContext(LanguageContext);
  const previousPath = location.state?.from || '/purchase-invoices';

  const handleBackAction = () => {
    navigate(previousPath);
  };

  useLayoutEffect(() => {
    if (getCurrentPageTitle) {
      getCurrentPageTitle(`${t('Purchase Invoice Details')}`);
    }
  }, [language]);

  if (isLoading) {
    return <Progress />;
  }
  return isFetched && purchaseInvoice ? (
    <PageLayout
      showBackAction
      path={previousPath}
      backBtnLabel="Purchase Invoice Details"
      pageScrollable
      onBackAction={handleBackAction}>
      <PurchaseInvoiceDetails purchaseInvoice={purchaseInvoice} />
    </PageLayout>
  ) : (
    <EmptySection label="Sorry, we couldn't find the invoice." />
  );
};

export default PurchaseDetails;

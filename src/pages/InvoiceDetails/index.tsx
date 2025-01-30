import {useContext, useLayoutEffect, useMemo} from 'react';
import {
  useInvoiceActivities,
  useInvoiceDetail,
} from 'hooks/reactQuery/useInvoice';
import {useCompanyNextNumber} from 'hooks/reactQuery/useCompanies';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {useQueryClientStorageData} from 'hooks/useClientStorage';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {useParams} from 'react-router-dom';
import {Progress} from 'components/Progress';
import {EmptySection} from 'components/EmptySection';
import {LanguageContext} from 'context/LanguageProvider';
import {useTranslation} from 'react-i18next';
import {
  CLIENT_STORAGE_PDF_CONFIG_KEY,
  CLIENT_STORAGE_PDF_TEMPLATE_KEY,
  DEFAULT_CLIENT_STORAGE_PDF_CONFIG_STATE,
} from 'utils/constants';
import {ServiceCompanyNumberType} from 'models/service-company';
import {ViewInvoice} from './ViewInvoice';

interface Props {
  getCurrentPageTitle?: (title: string) => void;
}

export const InvoiceDetails = ({getCurrentPageTitle}: Props) => {
  const {id: invoiceId} = useParams();
  const {user} = useUserSession();
  const {t} = useTranslation();
  const {data: invoice, isLoading, isFetched} = useInvoiceDetail(invoiceId);
  const {data: invoiceActivities, isLoading: isLoadingInvoiceActivities} =
    useInvoiceActivities({invoiceId: invoiceId ?? ''});
  const {language} = useContext(LanguageContext);

  const serviceCompanyId = user?.userAccount.serviceCompany.id || '';

  const {
    data: companyNextNumber,
    refetch: refetchCompanyNextNumber,
    isLoading: isLoadingCompanyNextNumber,
  } = useCompanyNextNumber(
    {
      type: ServiceCompanyNumberType.INVOICE,
    },
    serviceCompanyId,
  );

  const {
    data: clientStorageDataPdfConfig,
    isLoading: isLoadingClientStorageDataPdfConfig,
  } = useQueryClientStorageData({
    serviceCompanyId,
    params: {key: CLIENT_STORAGE_PDF_CONFIG_KEY},
  });

  const pdfConfig = useMemo(
    () =>
      clientStorageDataPdfConfig?.value
        ? JSON.parse(clientStorageDataPdfConfig.value)
        : DEFAULT_CLIENT_STORAGE_PDF_CONFIG_STATE,
    [clientStorageDataPdfConfig?.value],
  );

  const {
    data: clientStorageDataTemplate,
    isLoading: isLoadingClientStorageDataTemplate,
  } = useQueryClientStorageData({
    serviceCompanyId,
    params: {key: CLIENT_STORAGE_PDF_TEMPLATE_KEY},
  });

  const {headerInfo, footerInfo} = useMemo(() => {
    const parsedData = JSON.parse(clientStorageDataTemplate?.value || '{}');
    return {
      headerInfo: parsedData.header,
      footerInfo: parsedData.footer,
    };
  }, [clientStorageDataTemplate?.value]);

  const {data: headerUrl = {}, isLoading: isLoadingHeaderUrl} = useDownloadUrl(
    headerInfo?.path ? [headerInfo.path] : [],
    undefined,
    serviceCompanyId,
  );

  const {data: footerUrl = {}, isLoading: isLoadingFooterUrl} = useDownloadUrl(
    footerInfo?.path ? [footerInfo.path] : [],
    undefined,
    serviceCompanyId,
  );

  useLayoutEffect(() => {
    if (getCurrentPageTitle) {
      getCurrentPageTitle(`${t('Invoice Details')}`);
    }
  }, [language]);

  if (
    isLoading ||
    isLoadingInvoiceActivities ||
    isLoadingCompanyNextNumber ||
    isLoadingClientStorageDataPdfConfig ||
    isLoadingClientStorageDataTemplate ||
    isLoadingHeaderUrl ||
    isLoadingFooterUrl
  ) {
    return <Progress />;
  }
  return isFetched && invoice ? (
    <ViewInvoice
      invoice={{
        ...invoice,
        subject: invoice.subject === 'Regular' ? 'Invoice' : invoice.subject,
      }}
      invoiceActivities={invoiceActivities!}
      companyNextNumber={companyNextNumber!}
      refetchCompanyNextNumber={refetchCompanyNextNumber}
      pdfConfig={pdfConfig}
      headerInfo={headerInfo}
      footerInfo={footerInfo}
      headerUrl={
        headerUrl && headerInfo?.path ? headerUrl[headerInfo.path] : ''
      }
      footerUrl={
        footerUrl && footerInfo?.path ? footerUrl[footerInfo.path] : ''
      }
    />
  ) : (
    <EmptySection label="Sorry, we couldn't find the invoice." />
  );
};

export default InvoiceDetails;

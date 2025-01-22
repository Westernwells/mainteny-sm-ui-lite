import {useParams} from 'react-router-dom';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {
  useQuotationActivities,
  useQuotationDetails,
} from 'hooks/reactQuery/useQuotation';
import {useQueryClientStorageData} from 'hooks/useClientStorage';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {Progress} from 'components/Progress';
import {EmptySection} from 'components/EmptySection';
import {PdfGenerationStatus} from 'models/misc';
import {
  DEFAULT_CLIENT_STORAGE_PDF_CONFIG_STATE,
  CLIENT_STORAGE_PDF_CONFIG_KEY,
  CLIENT_STORAGE_PDF_TEMPLATE_KEY,
} from 'utils/constants';
import {useEffect, useLayoutEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {ViewQuotation} from './ViewQuotation';

interface Props {
  getCurrentPageTitle?: (title: string) => void;
}

export const QuotationDetails = ({getCurrentPageTitle}: Props) => {
  const {id: quotationId} = useParams();
  const {user} = useUserSession();

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

  const {
    data: downloadUrl,
    isLoading: isLoadingDownloadUrl,
    refetch: refetchDownloadUrl,
  } = useDownloadUrl(
    isFetched && quotation?.additionalInfo.pdfPath
      ? [quotation.additionalInfo.pdfPath]
      : [],
  );

  const serviceCompanyId = user?.userAccount.serviceCompany.id || '';

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

  if (
    isIdle ||
    isLoading ||
    isLoadingQuotationActivities ||
    isLoadingClientStorageDataPdfConfig ||
    isLoadingClientStorageDataTemplate ||
    isLoadingHeaderUrl ||
    isLoadingFooterUrl
  ) {
    return <Progress />;
  }

  return isFetched && quotation ? (
    <ViewQuotation
      downloadUrl={downloadUrl ? Object.values(downloadUrl)[0] : ''}
      refetchDownloadUrl={refetchDownloadUrl}
      quotation={quotation}
      quotationActivities={quotationActivities!}
      isLoadingDownloadUrl={isLoadingDownloadUrl}
      pdfConfig={pdfConfig}
      headerInfo={headerInfo}
      footerInfo={footerInfo}
      headerUrl={headerUrl ? headerUrl[headerInfo.path] : ''}
      footerUrl={footerUrl ? footerUrl[footerInfo.path] : ''}
    />
  ) : (
    <EmptySection label="Sorry, we couldn't find the quotation." />
  );
};

export default QuotationDetails;

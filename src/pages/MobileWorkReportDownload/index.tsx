import {useTranslation} from 'react-i18next';
import queryString from 'query-string';
import {useLocation} from 'react-router-dom';

import {pdf} from '@react-pdf/renderer';
import WorkReportTemplate from 'components/pdf-templates/WorkReportTemplate';
import {useEffect, useMemo, useState} from 'react';
import {axiosClient} from 'utils/axios-utils';
import {useGetUserAccount} from 'hooks/reactQuery/useUserAccount';

import usePrepareWorkReportData from 'hooks/usePrepareWorkReportData';
import {Box, Typography} from '@mui/material';
import {CustomTranslationOptions} from 'pages/CompanyDetails/BasicInformation';
import i18n from 'i18n';
import {useQueryClientStorageData} from 'hooks/useClientStorage';
import {
  CLIENT_STORAGE_PDF_CONFIG_KEY,
  DEFAULT_CLIENT_STORAGE_PDF_CONFIG_STATE,
} from 'utils/constants';
import {companyLanguageContextMap} from 'utils/language';
import {getJobTypeGivenName} from 'utils/service-order-utils';
import {
  useCompanyJobTypes,
  useOldCompanyJobTypes,
} from 'hooks/reactQuery/useCompanies';
import {useUserSession} from 'hooks/reactQuery/useUserSession';

interface RNWindow extends Window {
  ReactNativeWebView?: {
    postMessage?: (str: string) => void;
  };
  receiveData: (data: {[key: string]: string}) => void;
}

export const MobileWorkReportDownload = () => {
  const {t} = useTranslation();
  const {user} = useUserSession();
  const {data: jobTypes = []} = useCompanyJobTypes(
    user?.userAccount.serviceCompany.id!,
  );
  const {data: oldJobTypes} = useOldCompanyJobTypes(
    user?.userAccount.serviceCompany.id!,
  );

  // Filter out oldJobTypes that already exist in jobTypes based on the 'name' property
  const filteredOldJobTypes = oldJobTypes?.filter(
    (oldJobType) =>
      !jobTypes?.some((jobType) => jobType.name === oldJobType.name),
  );

  // Combine jobTypes and the filtered oldJobTypes
  const allJobTypes = [...(jobTypes || []), ...(filteredOldJobTypes || [])];

  const {search} = useLocation();
  const {
    token: QSToken,
    userId: QSUserId,
    serviceOrderId: QSServiceOrderId,
  } = queryString.parse(search);
  const [token, setToken] = useState(QSToken);
  const [userId, setUserId] = useState(QSUserId);
  const [serviceOrderId, setServiceOrderId] = useState(QSServiceOrderId);
  const [shouldFetchNow, setShouldFetchNow] = useState(false);
  const {data: userResponse} = useGetUserAccount(userId as string, {
    enabled: !!userId && shouldFetchNow,
    refetchOnWindowFocus: false,
  });
  const [base64, setBase64] = useState('');
  const isAllDataReceived = !!token && !!serviceOrderId && !!userId;

  const {
    company,
    serviceOrder,
    report,
    technicianSignatureImage,
    customerSignatureImage,
    convertedImages,
    headerInfo,
    headerUrl,
    footerInfo,
    footerUrl,
    isAllSuccess,
    isError,
    technicianName,
  } = usePrepareWorkReportData({
    serviceOrderId: serviceOrderId as string,
    userView: userResponse,
  });
  const {data: clientStorageDataPdfConfig} = useQueryClientStorageData({
    serviceCompanyId: company?.id!,
    params: {key: CLIENT_STORAGE_PDF_CONFIG_KEY},
  });
  const pdfConfig = clientStorageDataPdfConfig?.value
    ? JSON.parse(clientStorageDataPdfConfig?.value)
    : DEFAULT_CLIENT_STORAGE_PDF_CONFIG_STATE;
  const {t: translateCompanyLanguage} = useTranslation('translation', {
    lng: companyLanguageContextMap[company?.language as string],
  } as CustomTranslationOptions);

  const translate = useMemo(
    () => (key: string, options?: {context: string}) => {
      if (company?.language) {
        return translateCompanyLanguage(key, options);
      }

      return t(key, options);
    },
    [company?.language],
  );

  const generateWorkReportPdf = async () => {
    // Necessary for mobile otherwise mobile always picks english
    if (company?.language) {
      i18n.changeLanguage(company?.language);
    }

    const blob = await pdf(
      <WorkReportTemplate
        pdfConfigClientStorage={pdfConfig}
        userInfo={userResponse?.userAccount}
        selectedLng={company?.language}
        translate={translate}
        serviceOrder={serviceOrder}
        report={report}
        technicianSignatureImage={technicianSignatureImage}
        customerSignatureImage={customerSignatureImage}
        workReportPictures={convertedImages}
        headerPath={headerUrl?.[headerInfo?.path]!}
        headerInfo={headerInfo}
        footerPath={footerUrl?.[footerInfo?.path]!}
        footerInfo={footerInfo}
        technicianName={technicianName}
        serviceOrderType={getJobTypeGivenName(serviceOrder?.type, allJobTypes)}
      />,
    ).toBlob();

    const reader = new FileReader();
    reader.onloadend = function () {
      setBase64(reader.result as string);

      // Communicate the base64 to the mobile app
      if ((window as never as RNWindow)?.ReactNativeWebView?.postMessage) {
        (window as never as RNWindow).ReactNativeWebView?.postMessage?.(
          reader.result as string,
        );
      }
    };
    reader.readAsDataURL(blob);
  };

  const reportError = () => {
    if ((window as never as RNWindow)?.ReactNativeWebView?.postMessage) {
      // It is important to prefix the error with "Error:" because in mobile we check if the message is an error using this word
      // It will be removed in the app so user won't see this word
      (window as never as RNWindow).ReactNativeWebView?.postMessage?.(
        'Error: An error occurred during work report download',
      );
    }
  };

  useEffect(() => {
    // Define the function that will receive data from the WebView
    (window as never as RNWindow).receiveData = (data) => {
      setUserId(data.userId);
      setServiceOrderId(data.serviceOrderId);
    };
  }, []);

  useEffect(() => {
    const qs = queryString.parse(search);

    setToken(qs.token);
    setUserId(qs.userId);
    setServiceOrderId(qs.serviceOrderId);
  }, [search]);

  useEffect(() => {
    // If query params contains valid keys then continue
    if (isAllDataReceived) {
      axiosClient.defaults.headers.common.Authorization = `Bearer ${token}`;
      setShouldFetchNow(true);
    } else {
      setShouldFetchNow(false);
    }
  }, [isAllDataReceived]);

  useEffect(() => {
    // Only generate PDF when all data is successfully fetched
    if (isAllSuccess) {
      generateWorkReportPdf();
    }

    if (isError) {
      reportError();
    }
  }, [isAllSuccess, isError]);

  // Doesn't matter what we return here. Users will never see this
  // This is returned only for visual clue of what's happening during development
  return (
    <Box p={4}>
      {!isAllDataReceived && (
        <Typography variant="h2">Waiting for data to receive</Typography>
      )}
      {!isAllSuccess && !isError && isAllDataReceived && (
        <Typography variant="h2">Preparing to download</Typography>
      )}
      {!!base64 && <Typography variant="h2">Base64 generated</Typography>}
      {!!isError && <Typography variant="h2">Error</Typography>}
    </Box>
  );
};

export default MobileWorkReportDownload;

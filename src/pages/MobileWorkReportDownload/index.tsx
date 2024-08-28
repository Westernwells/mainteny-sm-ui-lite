import {useTranslation} from 'react-i18next';
import queryString from 'query-string';
import {useLocation, useNavigate} from 'react-router-dom';

import {pdf} from '@react-pdf/renderer';
import WorkReportTemplate from 'components/pdf-templates/WorkReportTemplate';
import {useEffect, useState} from 'react';
import {axiosClient} from 'utils/axios-utils';
import {useGetUserAccount} from 'hooks/reactQuery/useUserAccount';

import usePrepareWorkReportData from 'hooks/usePrepareWorkReportData';

interface RNWindow {
  ReactNativeWebView?: {
    postMessage?: (str: string) => void;
  };
}

export const MobileWorkReportDownload = () => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {search} = useLocation();
  const {token, id, serviceOrderId} = queryString.parse(search);
  const [shouldFetchNow, setShouldFetchNow] = useState(false);
  const {data: userResponse} = useGetUserAccount(id as string, {
    enabled: !!id && shouldFetchNow,
    refetchOnWindowFocus: false,
  });
  const [base64, setBase64] = useState('');

  const {
    company,
    serviceOrder,
    report,
    schedule,
    technicianSignatureImage,
    customerSignatureImage,
    convertedImages,
    headerInfo,
    headerUrl,
    footerInfo,
    footerUrl,
    isAllSuccess,
    isError,
  } = usePrepareWorkReportData({
    serviceOrderId: serviceOrderId as string,
    userView: userResponse,
  });

  const generateWorkReportPdf = async () => {
    const blob = await pdf(
      <WorkReportTemplate
        userInfo={userResponse?.userAccount}
        selectedLng={company?.language}
        translate={t}
        serviceOrder={serviceOrder}
        report={report}
        schedule={schedule}
        technicianSignatureImage={technicianSignatureImage}
        customerSignatureImage={customerSignatureImage}
        workReportPictures={convertedImages}
        headerPath={headerUrl?.[headerInfo?.path]!}
        headerInfo={headerInfo}
        footerPath={footerUrl?.[footerInfo?.path]!}
        footerInfo={footerInfo}
      />,
    ).toBlob();

    const reader = new FileReader();
    reader.onloadend = function () {
      setBase64(reader.result as string);

      // Communicate the base64 to the mobile app
      if ((window as RNWindow)?.ReactNativeWebView?.postMessage) {
        (window as RNWindow).ReactNativeWebView?.postMessage?.(
          reader.result as string,
        );
      }
    };
    reader.readAsDataURL(blob);
  };

  const reportError = () => {
    if ((window as RNWindow)?.ReactNativeWebView?.postMessage) {
      // It is important to prefix the error with "Error:" because in mobile we check if the message is an error using this word
      // It will be removed in the app so user won't see this word
      (window as RNWindow).ReactNativeWebView?.postMessage?.(
        'Error: An error occurred during work report download',
      );
    }
  };

  useEffect(() => {
    // If query params contains valid keys then continue otherwise redirect back to login
    if (token && id && serviceOrderId) {
      axiosClient.defaults.headers.common.Authorization = `Bearer ${token}`;
      setShouldFetchNow(true);
    } else {
      navigate('/login');
    }
  }, []);

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
    <div>
      {!isAllSuccess && !isError && <p>Preparing to download</p>}
      {!!base64 && <p>Base64 generated</p>}
      {!!isError && <p>Error</p>}
    </div>
  );
};

export default MobileWorkReportDownload;

import {UserView} from 'models/user';
import {useEffect, useMemo, useState} from 'react';
import {getSignatureKeys} from 'utils/service-order-utils';
import {getTechnicianName} from 'utils/employee';
import {useServiceOrderDetails} from './reactQuery/useServiceOrder';
import {useCompanyById} from './reactQuery/useCompanies';
import {useDownloadUrl} from './reactQuery/useDownloadUrl';
import useFetchAndConvertImage from './useFetchAndConvertImage';
import {useQueryClientStorageData} from './useClientStorage';
import useMultiImagesURLToBase64 from './useMultiImagesURLToBase64';
import {useGetTechniciansByEmployeeId} from './reactQuery/useTechnician';

interface Props {
  serviceOrderId: string;
  userView?: UserView;
}

const usePrepareWorkReportData = ({serviceOrderId, userView}: Props) => {
  const {
    data: serviceOrder,
    isSuccess: isServiceOrderSuccess,
    isError: isServiceOrderError,
  } = useServiceOrderDetails(serviceOrderId, {
    enabled: !!userView && !!serviceOrderId,
    refetchOnWindowFocus: false,
    useErrorBoundary: false,
  });
  const serviceCompanyId = userView?.userAccount.serviceCompany.id;
  const {
    data: company,
    isSuccess: isCompanySuccess,
    isError: isCompanyError,
  } = useCompanyById(serviceCompanyId, undefined, {
    refetchOnWindowFocus: false,
    useErrorBoundary: false,
  });

  const report = useMemo(
    () =>
      serviceOrder?.reports?.find(
        (item) => item.technicianId === userView?.userData.employeeId,
      ),
    [serviceOrder],
  );
  const schedule = serviceOrder?.schedules.find(
    (s) => s.technician?.id === report?.technicianId,
  );
  const {data: fetchedTechnician} = useGetTechniciansByEmployeeId(
    report?.technicianId || '',
  );

  const technicianName = getTechnicianName(schedule, fetchedTechnician);

  const signatureKeys = getSignatureKeys(
    serviceOrder,
    report,
    serviceCompanyId,
  );

  const {data: downloadUrls = {}, isError: isSignaturesError} = useDownloadUrl(
    report?.signatures?.map((item) => item.fileResource.uri) ?? [],
    {
      enabled: !!report?.signatures?.length && !!serviceCompanyId,
      refetchOnWindowFocus: false,
      useErrorBoundary: false,
    },
    serviceCompanyId,
  );
  const techSignPath = downloadUrls[signatureKeys.TECHNICIAN];
  const custSignPath = downloadUrls[signatureKeys.CUSTOMER];
  const technicianSignatureImage = useFetchAndConvertImage(techSignPath);

  const technicianSignatureSuccess = !techSignPath
    ? true
    : !!techSignPath && !!technicianSignatureImage;

  const customerSignatureImage = useFetchAndConvertImage(
    downloadUrls[signatureKeys.CUSTOMER],
  );
  const customerSignatureSuccess = !custSignPath
    ? true
    : !!custSignPath && !!customerSignatureImage;

  const {
    data: imageDownloadUrls = {},
    isSuccess: isAttachmentDownloadSuccess,
    isError: isAttachmentDownloadError,
  } = useDownloadUrl(
    report?.attachments?.map((item) => item.fileResource.uri) ?? [],
    {
      enabled: !!report?.attachments,
      refetchOnWindowFocus: false,
      useErrorBoundary: false,
    },
    serviceCompanyId,
  );

  const [shouldFetchImages, setShouldFetchImages] = useState(false);
  const {convertedImages, isImageLoading} = useMultiImagesURLToBase64(
    imageDownloadUrls,
    {enabled: shouldFetchImages},
  );

  const {
    data: clientStorageData,
    isSuccess: isClientStorageSuccess,
    isError: isClientStorageError,
  } = useQueryClientStorageData({
    serviceCompanyId: company?.id!,
    params: {key: 'pdf-template'},
    options: {
      refetchOnWindowFocus: false,
      useErrorBoundary: false,
    },
  });

  const headerInfo = JSON.parse(clientStorageData?.value || '{}').header;
  const footerInfo = JSON.parse(clientStorageData?.value || '{}').footer;

  const {
    data: headerUrl,
    isSuccess: isHeaderDownloadSuccess,
    isError: isHeaderDownloadError,
  } = useDownloadUrl(
    headerInfo?.path ? [headerInfo.path] : [],
    {refetchOnWindowFocus: false, useErrorBoundary: false},
    serviceCompanyId,
  );

  const {
    data: footerUrl,
    isSuccess: isFooterDownloadSuccess,
    isError: isFooterDownloadError,
  } = useDownloadUrl(
    footerInfo?.path ? [footerInfo.path] : [],
    {refetchOnWindowFocus: false, useErrorBoundary: false},
    serviceCompanyId,
  );

  const isHeaderAndFooterDone = () => {
    if (!isClientStorageSuccess) {
      return false;
    }

    let footerDone = isFooterDownloadSuccess;
    let headerDone = isHeaderDownloadSuccess;

    if (!footerInfo?.path) {
      footerDone = true;
    }

    if (!headerInfo?.path) {
      headerDone = true;
    }

    return footerDone && headerDone;
  };

  const isAllSuccess =
    isServiceOrderSuccess &&
    isCompanySuccess &&
    technicianSignatureSuccess &&
    customerSignatureSuccess &&
    isAttachmentDownloadSuccess &&
    !isImageLoading &&
    isClientStorageSuccess &&
    shouldFetchImages &&
    isHeaderAndFooterDone();

  const isError =
    isAttachmentDownloadError ||
    isServiceOrderError ||
    isCompanyError ||
    isSignaturesError ||
    isClientStorageError ||
    isHeaderDownloadError ||
    isFooterDownloadError;

  useEffect(() => {
    if (isAttachmentDownloadSuccess) {
      setShouldFetchImages(true);
    }
  }, [isAttachmentDownloadSuccess]);

  return {
    serviceOrder,
    company,
    report,
    schedule,
    technicianSignatureImage,
    customerSignatureImage,
    convertedImages,
    headerUrl,
    headerInfo,
    footerUrl,
    footerInfo,
    isAllSuccess,
    isError,
    technicianName,
  };
};

export default usePrepareWorkReportData;

import {useContext, useEffect, useRef, useState} from 'react';
import {pdf} from '@react-pdf/renderer';
import {useSnackbar} from 'hooks/useSnackbar';
import {SnackbarKey} from 'notistack';
import {
  fetchDownloadUrls,
  useDownloadFileWithCustomName,
} from 'hooks/reactQuery/useDownloadUrl';
import PathImage from 'assets/images/Path.svg';
import {Box, Typography} from '@mui/material';
import {Currency} from 'models/misc';
import {
  ServiceOrderSubArticleRecord,
  ServiceOrderView,
} from 'models/service-order';
import {UserAccount} from 'models/user';
import JobOverviewPdfTemplate from 'pages/ServiceOrderDetails/Tabs/Overview/JobOverviewPdfTemplate';
import {
  CLIENT_STORAGE_PDF_CONFIG_KEY,
  CLIENT_STORAGE_PDF_TEMPLATE_KEY,
  DEFAULT_CLIENT_STORAGE_PDF_CONFIG_STATE,
} from 'utils/constants';
import {
  getJobTypeGivenName,
  serviceOrderItemToServiceOrderItemRecord,
} from 'utils/service-order-utils';
import {PdfStylesContext} from 'context/PdfStylesProvider';
import {useQueryClientStorageData} from './useClientStorage';
import {
  useCompanyById,
  useCompanyJobTypes,
  useOldCompanyJobTypes,
} from './reactQuery/useCompanies';
import {useUserSession} from './reactQuery/useUserSession';
import {
  useServiceOrderAmountDetailQuery,
  useServiceOrderDetails,
  useServiceOrderSubItems,
} from './reactQuery/useServiceOrder';
import {useQuotationDetails} from './reactQuery/useQuotation';

type UseCreateAndSetPdfBlobUrlProps = {
  serviceOrder: ServiceOrderView;
  userInfo?: UserAccount;
  currentCurrency: Currency;
  translate: (key: string, options?: {context: string}) => string;
  selectedLng?: string;
  fileName: string;
};

export const useCreateAndSetPdfBlobUrl = ({
  serviceOrder,
  userInfo,
  currentCurrency,
  translate,
  selectedLng,
  fileName,
}: UseCreateAndSetPdfBlobUrlProps) => {
  const quotationId = serviceOrder?.additionalInfo?.quotationId;
  const {user} = useUserSession();
  const {data: company} = useCompanyById(user?.userAccount.serviceCompany.id);

  const {data: jobTypes = []} = useCompanyJobTypes(
    user?.userAccount.serviceCompany.id!,
  );
  const {data: oldJobTypes} = useOldCompanyJobTypes(
    user?.userAccount.serviceCompany.id!,
  );

  const {refetch: refetchOrder} = useServiceOrderDetails(serviceOrder?.id, {
    enabled: false,
  });

  const {refetch: refetchQuotation} = useQuotationDetails(quotationId, {
    enabled: false,
  });

  const {refetch: refetchSubItems} = useServiceOrderSubItems(serviceOrder?.id, {
    enabled: false,
  });

  const {refetch: refetchAmountDetail} = useServiceOrderAmountDetailQuery(
    serviceOrder?.id,
    {enabled: false},
  );

  const {fontStyles, primaryColor, secondaryColor} =
    useContext(PdfStylesContext);

  // Filter out oldJobTypes that already exist in jobTypes based on the 'name' property
  const filteredOldJobTypes = oldJobTypes?.filter(
    (oldJobType) =>
      !jobTypes?.some((jobType) => jobType.name === oldJobType.name),
  );

  // Combine jobTypes and the filtered oldJobTypes
  const allJobTypes = [...(jobTypes || []), ...(filteredOldJobTypes || [])];
  const [filePathToDownload, setFilePathToDownload] = useState('');
  const {enqueueSnackbar, closeSnackbar, showError} = useSnackbar();
  const snackBarRef = useRef<SnackbarKey | null>(null);
  const {data: clientStorageDataPdfConfig} = useQueryClientStorageData({
    serviceCompanyId: serviceOrder?.serviceCompany?.id,
    params: {key: CLIENT_STORAGE_PDF_CONFIG_KEY},
  });
  const pdfConfig = clientStorageDataPdfConfig?.value
    ? JSON.parse(clientStorageDataPdfConfig?.value)
    : DEFAULT_CLIENT_STORAGE_PDF_CONFIG_STATE;

  const {refetch: refetchClientStorageData} = useQueryClientStorageData({
    serviceCompanyId: company?.id!,
    params: {key: CLIENT_STORAGE_PDF_TEMPLATE_KEY},
    options: {enabled: false},
  });

  const {downloadFile} = useDownloadFileWithCustomName(
    fileName,
    filePathToDownload,
  );

  const generatePdfBlobUrl = async () => {
    const {data: rawTpl} = await refetchClientStorageData();
    const tpl = rawTpl?.value
      ? JSON.parse(rawTpl.value)
      : DEFAULT_CLIENT_STORAGE_PDF_CONFIG_STATE;
    const {header: headerInfo, footer: footerInfo} = tpl;

    const urls = await fetchDownloadUrls(
      [headerInfo.path, footerInfo.path],
      serviceOrder.serviceCompany.id,
    );
    const headerPath = urls[headerInfo.path]!;
    const footerPath = urls[footerInfo.path]!;

    const [subItemsResult, amountResult, serviceOrderResult] =
      await Promise.all([
        refetchSubItems(),
        refetchAmountDetail(),
        refetchOrder(),
      ]);

    let freshQuotation;
    if (quotationId) {
      const {data} = await refetchQuotation();
      freshQuotation = data;
    }

    const freshServiceOrder = serviceOrderResult.data;
    const freshSubItems = subItemsResult.data;
    const freshAmountDetail = amountResult.data;

    const freshSubItemsMap = Object.entries(freshSubItems ?? {}).reduce(
      (acc, [parentId, subs]) => {
        acc[parentId] = subs.map((s) => ({...s, parentId}));
        return acc;
      },
      {} as Record<string, ServiceOrderSubArticleRecord[]>,
    );

    const freshItems =
      freshServiceOrder?.articles.map((item) =>
        serviceOrderItemToServiceOrderItemRecord(item, freshSubItemsMap),
      ) || [];

    const blob = await pdf(
      <JobOverviewPdfTemplate
        pdfConfigClientStorage={pdfConfig}
        userInfo={userInfo}
        currentCurrency={currentCurrency}
        serviceOrder={freshServiceOrder}
        quotation={freshQuotation}
        selectedLng={selectedLng}
        translate={translate}
        headerInfo={headerInfo}
        footerInfo={footerInfo}
        headerPath={headerPath!}
        footerPath={footerPath!}
        serviceOrderType={getJobTypeGivenName(
          freshServiceOrder?.type,
          allJobTypes,
        )}
        fontStyles={fontStyles}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        serviceOrderAmountDetail={freshAmountDetail}
        serviceOrderItems={freshItems}
      />,
    ).toBlob();

    const blobURL = URL.createObjectURL(blob);
    setFilePathToDownload(blobURL);
  };

  const createAndSetPdfBlobUrl = async () => {
    try {
      snackBarRef.current = enqueueSnackbar(
        <Box display="flex" padding="0" alignItems="center">
          <img alt="Path" src={PathImage} />
          <Typography paddingLeft="0.5em" variant="body2">
            {translate('PDF generation is in progress. Please wait...')}
          </Typography>
        </Box>,
        {
          variant: 'info',
          autoHideDuration: null,
        },
      );
      await generatePdfBlobUrl();
    } catch (error) {
      showError(error);
    }
  };

  useEffect(() => {
    if (filePathToDownload && snackBarRef.current) {
      closeSnackbar(snackBarRef.current);
      snackBarRef.current = null;
      downloadFile();
      setFilePathToDownload('');
    }
  }, [filePathToDownload]);

  return {
    createAndSetPdfBlobUrl,
  };
};

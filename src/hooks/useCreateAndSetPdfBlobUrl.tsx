import {useState, useRef, useEffect} from 'react';
import {pdf} from '@react-pdf/renderer';
import {useSnackbar} from 'hooks/useSnackbar';
import {SnackbarKey} from 'notistack';
import {useDownloadFileWithCustomName} from 'hooks/reactQuery/useDownloadUrl';
import PathImage from 'assets/images/Path.svg';
import {Box, Typography} from '@mui/material';
import {Currency, HeaderFooterInfoData} from 'models/misc';
import {QuotationView} from 'models/quotation';
import {ServiceOrderView} from 'models/service-order';
import {UserAccount} from 'models/user';
import JobOverviewPdfTemplate from 'pages/ServiceOrderDetails/Tabs/Overview/JobOverviewPdfTemplate';
import {
  CLIENT_STORAGE_PDF_CONFIG_KEY,
  DEFAULT_CLIENT_STORAGE_PDF_CONFIG_STATE,
} from 'utils/constants';
import {getJobTypeGivenName} from 'utils/service-order-utils';
import {useQueryClientStorageData} from './useClientStorage';
import {useCompanyJobTypes} from './reactQuery/useCompanies';
import {useUserSession} from './reactQuery/useUserSession';

type UseCreateAndSetPdfBlobUrlProps = {
  serviceOrder: ServiceOrderView;
  quotation?: QuotationView;
  userInfo?: UserAccount;
  currentCurrency: Currency;
  headerInfo: HeaderFooterInfoData;
  headerPath: string;
  footerInfo: HeaderFooterInfoData;
  footerPath: string;
  translate: (key: string, options?: {context: string}) => string;
  selectedLng?: string;
  fileName: string;
};

export const useCreateAndSetPdfBlobUrl = ({
  serviceOrder,
  quotation,
  userInfo,
  currentCurrency,
  headerInfo,
  headerPath,
  footerInfo,
  footerPath,
  translate,
  selectedLng,
  fileName,
}: UseCreateAndSetPdfBlobUrlProps) => {
  const {user} = useUserSession();
  const {data: jobTypes = []} = useCompanyJobTypes(
    user?.userAccount.serviceCompany.id!,
  );
  const [filePathToDownload, setFilePathToDownload] = useState('');
  const {enqueueSnackbar, closeSnackbar, showError} = useSnackbar();
  const snackBarRef = useRef<SnackbarKey | null>(null);
  const {data: clientStorageDataPdfConfig} = useQueryClientStorageData({
    serviceCompanyId: serviceOrder.serviceCompany.id,
    params: {key: CLIENT_STORAGE_PDF_CONFIG_KEY},
  });
  const pdfConfig = clientStorageDataPdfConfig?.value
    ? JSON.parse(clientStorageDataPdfConfig?.value)
    : DEFAULT_CLIENT_STORAGE_PDF_CONFIG_STATE;

  const {downloadFile} = useDownloadFileWithCustomName(
    fileName,
    filePathToDownload,
  );

  const generatePdfBlobUrl = async () => {
    const blob = await pdf(
      <JobOverviewPdfTemplate
        pdfConfigClientStorage={pdfConfig}
        userInfo={userInfo}
        currentCurrency={currentCurrency}
        serviceOrder={serviceOrder}
        quotation={quotation}
        selectedLng={selectedLng}
        translate={translate}
        headerInfo={headerInfo}
        headerPath={headerPath}
        footerInfo={footerInfo}
        footerPath={footerPath}
        serviceOrderType={getJobTypeGivenName(serviceOrder.type, jobTypes)}
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

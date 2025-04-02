import {useContext, useEffect, useMemo, useRef, useState} from 'react';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import GradingIcon from '@mui/icons-material/Grading';
import FactCheck from '@mui/icons-material/FactCheck';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import {TabsBody} from 'components/TabsBody';
import {Tabs} from 'components/Tab';
import {Progress} from 'components/Progress';
import {
  usePostServiceOrderConfirmationPublish,
  useServiceOrderDetails,
} from 'hooks/reactQuery/useServiceOrder';
import {
  useDownloadFileWithCustomName,
  useDownloadUrl,
} from 'hooks/reactQuery/useDownloadUrl';
import {useParams, useSearchParams} from 'react-router-dom';
import {formatSearchParams} from 'utils/utils';
import {Box, Typography} from '@mui/material';
import {useTranslation, UseTranslationOptions} from 'react-i18next';
import {useSnackbar} from 'hooks/useSnackbar';
import PathImage from 'assets/images/Path.svg';
import {SnackbarKey} from 'notistack';
import {useCurrentCurrency} from 'utils/currency';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {pdf} from '@react-pdf/renderer';
import {
  useQuotationDetails,
  useQuotationSubItems,
} from 'hooks/reactQuery/useQuotation';
import {
  useCompanyById,
  useCompanyJobTypes,
  useOldCompanyJobTypes,
} from 'hooks/reactQuery/useCompanies';
import {useQueryClientStorageData} from 'hooks/useClientStorage';
import {
  CLIENT_STORAGE_PDF_CONFIG_KEY,
  DEFAULT_CLIENT_STORAGE_PDF_CONFIG_STATE,
} from 'utils/constants';
import {companyLanguageContextMap} from 'utils/language';
import {getJobTypeGivenName} from 'utils/service-order-utils';
import QuotationPdfTemplate from 'components/pdf-templates/QuotationPdfTemplate';
import {QuotationSubItemRecord} from 'models/quotation';
import {quotationItemToQuotationItemRecord} from 'utils/quotation';
import {PdfStylesContext} from 'context/PdfStylesProvider';
import {CheckList} from './Tabs/Checklist';
import {WorkReport} from './Tabs/WorkReport';
import {Overview} from './Tabs/Overview';
import JobOverviewPdfTemplate from './Tabs/Overview/JobOverviewPdfTemplate';
import SupplierInvoices from './Tabs/SupplierInvoices';

const tabItems = [
  {
    label: 'Overview',
    icon: <ManageSearchIcon />,
  },
  {
    label: 'Work Report',
    icon: <GradingIcon />,
  },
  {
    label: 'Checklist',
    icon: <FactCheck />,
  },
  {
    label: 'Supplier Invoices',
    icon: <ReceiptLongIcon />,
  },
];

type CustomTranslationOptions = UseTranslationOptions<'translation'> & {
  lng?: string;
};

export const ServiceOrderDetails = () => {
  const [tabValue, setTabValue] = useState(0);
  const {id: serviceOrderId} = useParams();
  const [queryParams, setQueryParams] = useSearchParams();
  const {data: serviceOrder, isLoading} =
    useServiceOrderDetails(serviceOrderId);
  const {enqueueSnackbar, showError, closeSnackbar} = useSnackbar();
  const {t} = useTranslation();
  const {user} = useUserSession();

  const {fontStyles, primaryColor, secondaryColor} =
    useContext(PdfStylesContext);

  const currentCurrency = useCurrentCurrency();
  const overviewPdfSnackBarRef = useRef<SnackbarKey | null>(null);

  const {data: quotationSubItems, isLoading: isQuotationSubItemsLoading} =
    useQuotationSubItems(serviceOrder?.additionalInfo?.quotationId);

  const subItemsMap: Record<string, QuotationSubItemRecord[]> = Object.entries(
    quotationSubItems ?? {},
  ).reduce((acc, [parentId, subItems]) => {
    acc[parentId] = subItems.map((subItem) => ({
      ...subItem,
      parentId,
    }));
    return acc;
  }, {} as Record<string, QuotationSubItemRecord[]>);

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

  const {data: quotation} = useQuotationDetails(
    serviceOrder?.additionalInfo.quotationId,
  );
  const [filePathToDownload, setFilePathToDownload] = useState('');

  const filePaths = useMemo(
    () => (filePathToDownload ? [filePathToDownload] : []),
    [filePathToDownload],
  );

  const {data: fileDownloadURLs = {}} = useDownloadUrl(filePaths, {
    refetchOnWindowFocus: false,
  });

  const {downloadFile} = useDownloadFileWithCustomName(
    serviceOrder?.number,
    filePathToDownload,
  );

  const {mutateAsync: postServiceOrderConfirmationPublish} =
    usePostServiceOrderConfirmationPublish();

  const {data: company} = useCompanyById(user?.userAccount.serviceCompany.id);
  const {t: translateCompanyLanguage} = useTranslation('translation', {
    lng: companyLanguageContextMap[company?.language as string],
  } as CustomTranslationOptions);

  const {data: clientStorageDataPdfConfig} = useQueryClientStorageData({
    serviceCompanyId: company?.id!,
    params: {key: CLIENT_STORAGE_PDF_CONFIG_KEY},
  });
  const pdfConfig = clientStorageDataPdfConfig?.value
    ? JSON.parse(clientStorageDataPdfConfig?.value)
    : DEFAULT_CLIENT_STORAGE_PDF_CONFIG_STATE;

  const translate = useMemo(
    () => (key: string, options?: {context: string}) => {
      if (company?.language) {
        return translateCompanyLanguage(key, options);
      }

      return t(key, options);
    },
    [company?.language],
  );

  const {data: clientStorageData} = useQueryClientStorageData({
    serviceCompanyId: company?.id!,
    params: {key: 'pdf-template'},
  });

  const headerInfo = JSON.parse(clientStorageData?.value || '{}').header;
  const footerInfo = JSON.parse(clientStorageData?.value || '{}').footer;

  const {data: headerUrl = {}} = useDownloadUrl(
    headerInfo?.path ? [headerInfo.path] : [],
    undefined,
    company?.id,
  );

  const {data: footerUrl = {}} = useDownloadUrl(
    footerInfo?.path ? [footerInfo.path] : [],
    undefined,
    company?.id,
  );

  const generatePreviewPdfBlobUrl = async () => {
    const transformedQuotationItems =
      quotation?.items.map((item) =>
        quotationItemToQuotationItemRecord(item, subItemsMap),
      ) || [];

    const blob =
      serviceOrder?.additionalInfo.quotationId && quotation
        ? await pdf(
            <QuotationPdfTemplate
              pdfConfigClientStorage={pdfConfig}
              userInfo={user?.userAccount}
              currentCurrency={currentCurrency}
              quotation={quotation}
              selectedLng={company?.language}
              translate={translate}
              headerPath={headerUrl[headerInfo?.path]}
              headerInfo={headerInfo}
              footerPath={footerUrl[footerInfo?.path]}
              footerInfo={footerInfo}
              isJobOverview
              serviceOrderType={getJobTypeGivenName(
                serviceOrder?.type,
                allJobTypes,
              )}
              quotationItems={transformedQuotationItems}
              fontStyles={fontStyles}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
            />,
          ).toBlob()
        : await pdf(
            <JobOverviewPdfTemplate
              pdfConfigClientStorage={pdfConfig}
              userInfo={user?.userAccount}
              currentCurrency={currentCurrency}
              serviceOrder={serviceOrder}
              quotation={quotation}
              selectedLng={company?.language}
              translate={translate}
              headerPath={headerUrl[headerInfo?.path]}
              headerInfo={headerInfo}
              footerPath={footerUrl[footerInfo?.path]}
              footerInfo={footerInfo}
              serviceOrderType={getJobTypeGivenName(
                serviceOrder?.type,
                allJobTypes,
              )}
              fontStyles={fontStyles}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
            />,
          ).toBlob();
    const blobURL = URL.createObjectURL(blob);
    setFilePathToDownload(blobURL);
  };

  const generateWorkOverview = async () => {
    try {
      overviewPdfSnackBarRef.current = enqueueSnackbar(
        <Box display="flex" padding="0em" margin="0em" alignItems="center">
          <img alt={t('Path Image')} src={PathImage} />{' '}
          <Typography margin="0em" paddingLeft="0.5em" variant="body2">
            {t('PDF generation is in progress. Please wait...')}
          </Typography>
        </Box>,
        {
          variant: 'info',
          autoHideDuration: null,
        },
      );

      await generatePreviewPdfBlobUrl();

      await postServiceOrderConfirmationPublish({
        serviceOrder: serviceOrderId as string,
        data: {
          email: '',
          emails: [],
          subject: '',
          content: '',
        },
      });
    } catch (e) {
      showError(e);
    }
  };

  useEffect(() => {
    if (!Object.keys(fileDownloadURLs || {}).length) {
      return;
    }

    if (overviewPdfSnackBarRef.current) {
      closeSnackbar(overviewPdfSnackBarRef.current);
      overviewPdfSnackBarRef.current = null;
    }
  }, [fileDownloadURLs]);

  useEffect(() => {
    const currentParams = Object.fromEntries([...queryParams]);
    if (currentParams.tab) setTabValue(Number(currentParams.tab));

    return () => {
      if (overviewPdfSnackBarRef.current) {
        closeSnackbar(overviewPdfSnackBarRef.current);
        overviewPdfSnackBarRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (filePathToDownload) {
      downloadFile();
      setFilePathToDownload('');
    }
  }, [filePathToDownload]);

  if (isLoading || isQuotationSubItemsLoading) {
    return <Progress />;
  }

  return (
    <Tabs
      showActionBtn={tabValue === 0}
      btnLabel="Download Job Overview"
      actionBtnVariant="outlined"
      hideDivider
      actionButtonIcon={<FileDownloadIcon />}
      btnOnClick={generateWorkOverview}
      actionButtonStyles={{background: 'transparent'}}
      tabItems={tabItems}
      currentIndex={tabValue}
      onChange={(index) => {
        setQueryParams(
          formatSearchParams({tab: index.toString()}, queryParams),
        );
        setTabValue(index);
      }}>
      <TabsBody
        value={tabValue}
        index={0}
        containerStyle={{height: 2, marginTop: 3}}>
        <Overview serviceOrder={serviceOrder!} />
      </TabsBody>
      <TabsBody value={tabValue} index={1} containerStyle={{marginTop: 3}}>
        <WorkReport serviceOrder={serviceOrder!} />
      </TabsBody>
      <TabsBody
        value={tabValue}
        index={2}
        containerStyle={{height: '1px', overflow: 'auto', marginTop: 3}}>
        <CheckList serviceOrder={serviceOrder!} />
      </TabsBody>
      <TabsBody
        value={tabValue}
        index={3}
        containerStyle={{height: '1px', overflow: 'auto', marginTop: 3}}>
        <SupplierInvoices serviceOrderId={serviceOrder?.id!} />
      </TabsBody>
    </Tabs>
  );
};

export default ServiceOrderDetails;

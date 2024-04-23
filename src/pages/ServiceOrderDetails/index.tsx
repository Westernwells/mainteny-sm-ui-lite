import {useEffect, useMemo, useRef, useState} from 'react';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import GradingIcon from '@mui/icons-material/Grading';
import FactCheck from '@mui/icons-material/FactCheck';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
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
import {companyLanguageContextMap, formatSearchParams} from 'utils/utils';
import {Box, Typography} from '@mui/material';
import {UseTranslationOptions, useTranslation} from 'react-i18next';
import {useSnackbar} from 'hooks/useSnackbar';
import PathImage from 'assets/images/Path.svg';
import {SnackbarKey} from 'notistack';
import {useCurrentCurrency} from 'utils/currency';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {pdf} from '@react-pdf/renderer';
import useLogoDimensions from 'hooks/useLogoDimensions';
import useLogoImage from 'hooks/useLogoImage';
import {useQuotationDetails} from 'hooks/reactQuery/useQuotation';
import {useCompanyById} from 'hooks/reactQuery/useCompanies';
import {CheckList} from './Tabs/Checklist';
import {WorkReport} from './Tabs/WorkReport';
import {Overview} from './Tabs/Overview';
import JobOverviewPdfTemplate from './Tabs/Overview/JobOverviewPdfTemplate';

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
  const currentCurrency = useCurrentCurrency();
  const overviewPdfSnackBarRef = useRef<SnackbarKey | null>(null);
  const {data: quotation} = useQuotationDetails(
    serviceOrder?.additionalInfo.quotationId,
  );
  const [filePathToDownload, setFilePathToDownload] = useState('');
  const imageUrl = useLogoImage(user);

  const logoDimensions = useLogoDimensions(imageUrl);

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

  const translate = useMemo(
    () => (key: string) => {
      if (company?.language) {
        return translateCompanyLanguage(key);
      }

      return t(key);
    },
    [company?.language],
  );

  const generatePreviewPdfBlobUrl = async () => {
    const blob = await pdf(
      <JobOverviewPdfTemplate
        userInfo={user?.userAccount}
        currentCurrency={currentCurrency}
        logoSrc={imageUrl}
        serviceOrder={serviceOrder}
        logoDimensions={logoDimensions}
        quotation={quotation}
        selectedLng={company?.language}
        translate={translate}
      />,
    ).toBlob();
    const blobURL = URL.createObjectURL(blob);
    setFilePathToDownload(blobURL);
  };

  const generateWorkOverview = async () => {
    try {
      downloadFile();
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

      generatePreviewPdfBlobUrl();

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
    generatePreviewPdfBlobUrl();
  }, [imageUrl]);

  if (isLoading) {
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
    </Tabs>
  );
};

export default ServiceOrderDetails;

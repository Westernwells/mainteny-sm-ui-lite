import {useEffect, useMemo, useRef, useState} from 'react';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import GradingIcon from '@mui/icons-material/Grading';
import FactCheck from '@mui/icons-material/FactCheck';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import {TabsBody} from 'components/TabsBody';
import {Tabs} from 'components/Tab';
import {Progress} from 'components/Progress';
import {PdfGenerationStatus} from 'models/misc';
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
import {useTranslation} from 'react-i18next';
import {useSnackbar} from 'hooks/useSnackbar';
import PathImage from 'assets/images/Path.svg';
import {SnackbarKey} from 'notistack';
import {CheckList} from './Tabs/Checklist';
import {WorkReport} from './Tabs/WorkReport';
import {Overview} from './Tabs/Overview';

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

export const ServiceOrderDetails = () => {
  const [tabValue, setTabValue] = useState(0);
  const {id: serviceOrderId} = useParams();
  const [queryParams, setQueryParams] = useSearchParams();
  const {data: serviceOrder, isLoading} =
    useServiceOrderDetails(serviceOrderId);
  const isJobOverviewPdfGenerated =
    serviceOrder?.additionalInfo.confirmationInfo?.pdfGenerationStatus ===
    PdfGenerationStatus.DONE;
  const {enqueueSnackbar, showError, closeSnackbar} = useSnackbar();
  const {t} = useTranslation();
  const overviewPdfSnackBarRef = useRef<SnackbarKey | null>(null);
  const [filePathToDownload, setFilePathToDownload] = useState('');

  const filePaths = useMemo(
    () => (filePathToDownload ? [filePathToDownload] : []),
    [filePathToDownload],
  );

  const {data: fileDownloadURLs = {}} = useDownloadUrl(filePaths, {
    refetchOnWindowFocus: false,
  });

  const {mutateAsync: postServiceOrderConfirmationPublish} =
    usePostServiceOrderConfirmationPublish();

  const downloadWorkOverview = () => {
    const pdfPath = isJobOverviewPdfGenerated
      ? (serviceOrder?.additionalInfo.confirmationInfo?.pdfPath as string)
      : '';
    if (pdfPath) {
      setFilePathToDownload(pdfPath);
    }
  };

  const {downloadFile} = useDownloadFileWithCustomName(
    serviceOrder?.number,
    filePathToDownload,
  );

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
    if (
      serviceOrder?.additionalInfo.confirmationInfo?.pdfGenerationStatus ===
        PdfGenerationStatus.DONE &&
      overviewPdfSnackBarRef.current
    ) {
      downloadWorkOverview();
    }
  }, [serviceOrder]);

  useEffect(() => {
    if (!Object.keys(fileDownloadURLs || {}).length) {
      return;
    }

    downloadFile();

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

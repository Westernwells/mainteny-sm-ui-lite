import {useEffect, useState} from 'react';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import GradingIcon from '@mui/icons-material/Grading';
import FactCheck from '@mui/icons-material/FactCheck';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import {TabsBody} from 'components/TabsBody';
import {Tabs} from 'components/Tab';
import {Progress} from 'components/Progress';
import {PdfGenerationStatus} from 'models/misc';
import {useServiceOrderDetails} from 'hooks/reactQuery/useServiceOrder';
import {useDownloadUrl} from 'hooks/reactQuery/useDownloadUrl';
import {useParams, useSearchParams} from 'react-router-dom';
import {formatSearchParams} from 'utils/utils';
import {Overview} from './Tabs/Overview';
import {WorkReport} from './Tabs/WorkReport';
import {CheckList} from './Tabs/Checklist';

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

  const isWorkReportPdfGenerated =
    serviceOrder?.report?.additionalInfo.pdfGenerationStatus ===
    PdfGenerationStatus.DONE;

  const {data: workReportPdfDownloadUrl = {}} = useDownloadUrl(
    isWorkReportPdfGenerated
      ? [serviceOrder?.report!.additionalInfo.pdfPath]
      : [],
  );

  const downloadWorkReport = () => {
    const url = isWorkReportPdfGenerated
      ? serviceOrder?.report!.additionalInfo.pdfPath
      : '';
    window.open(workReportPdfDownloadUrl[url], '_blank');
  };

  useEffect(() => {
    const currentParams = Object.fromEntries([...queryParams]);
    if (currentParams.tab) setTabValue(Number(currentParams.tab));
  }, []);

  if (isLoading) {
    return <Progress />;
  }

  return (
    <Tabs
      showActionBtn={tabValue === 1}
      btnLabel="Download Work Report"
      actionBtnVariant="outlined"
      actionButtonIcon={<FileDownloadIcon />}
      btnOnClick={downloadWorkReport}
      actionButtonStyles={{background: 'transparent'}}
      disableBtnAction={!isWorkReportPdfGenerated}
      tabItems={tabItems}
      currentIndex={tabValue}
      onChange={(index) => {
        setQueryParams(
          formatSearchParams({tab: index.toString()}, queryParams),
        );
        setTabValue(index);
      }}>
      <TabsBody value={tabValue} index={0} containerStyle={{height: 2}}>
        <Overview serviceOrder={serviceOrder!} />
      </TabsBody>
      <TabsBody value={tabValue} index={1}>
        <WorkReport
          serviceOrder={serviceOrder!}
          downloadWorkReport={
            isWorkReportPdfGenerated ? downloadWorkReport : null
          }
        />
      </TabsBody>
      <TabsBody
        value={tabValue}
        index={2}
        containerStyle={{height: '1px', overflow: 'auto'}}>
        <CheckList serviceOrder={serviceOrder!} />
      </TabsBody>
    </Tabs>
  );
};

export default ServiceOrderDetails;

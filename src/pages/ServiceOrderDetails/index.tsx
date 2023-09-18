import {useEffect, useState} from 'react';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import GradingIcon from '@mui/icons-material/Grading';
import FactCheck from '@mui/icons-material/FactCheck';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import {TabsBody} from 'components/TabsBody';
import {Tabs} from 'components/Tab';
import {PdfGenerationStatus} from 'models/misc';
import {useServiceOrderReport} from 'hooks/reactQuery/useServiceOrder';
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
  const {data: serviceOrderReportSource} = useServiceOrderReport({
    serviceOrderId: typeof serviceOrderId === 'string' ? serviceOrderId : [],
  });

  const workReport = serviceOrderReportSource?.[0];

  const isWorkReportPdfGenerated =
    workReport?.additionalInfo.pdfGenerationStatus === PdfGenerationStatus.DONE;

  const {data: workReportPdfDownloadUrl = {}} = useDownloadUrl(
    isWorkReportPdfGenerated ? [workReport!.additionalInfo.pdfPath] : [],
  );

  const downloadWorkReport = () => {
    const url = isWorkReportPdfGenerated
      ? workReport!.additionalInfo.pdfPath
      : '';
    window.open(workReportPdfDownloadUrl[url], '_blank');
  };

  useEffect(() => {
    const currentParams = Object.fromEntries([...queryParams]);
    if (currentParams.tab) setTabValue(Number(currentParams.tab));
  }, []);

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
        <Overview orderId={serviceOrderId} />
      </TabsBody>
      <TabsBody value={tabValue} index={1}>
        <WorkReport
          orderId={serviceOrderId}
          downloadWorkReport={
            isWorkReportPdfGenerated ? downloadWorkReport : null
          }
        />
      </TabsBody>
      <TabsBody
        value={tabValue}
        index={2}
        containerStyle={{height: '1px', overflow: 'auto'}}>
        <CheckList orderId={serviceOrderId} />
      </TabsBody>
    </Tabs>
  );
};

export default ServiceOrderDetails;

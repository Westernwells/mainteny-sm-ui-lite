import {useState} from 'react';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import GradingIcon from '@mui/icons-material/Grading';
import {TabsBody} from 'components/TabsBody';
import {Tabs} from 'components/Tab';
import ListAltIcon from '@mui/icons-material/ListAlt';
import {useParams} from 'react-router';
import {Overview} from './Tabs/Overview';
import {WorkReport} from './Tabs/WorkReport';

const tabItems = [
  {
    label: 'Overview',
    icon: <ManageSearchIcon />,
  },
  {
    label: 'Work report',
    icon: <GradingIcon />,
  },
  {
    label: 'Invoices',
    icon: <ListAltIcon />,
  },
];

export const ServiceOrderDetails = () => {
  const [tabValue, setTabValue] = useState(0);
  const {id: serviceOrderId} = useParams();

  return (
    <Tabs
      tabItems={tabItems}
      currentIndex={tabValue}
      onChange={(index) => {
        setTabValue(index);
      }}>
      <TabsBody value={tabValue} index={0} containerStyle={{height: 2}}>
        <Overview orderId={serviceOrderId} />
      </TabsBody>
      <TabsBody value={tabValue} index={1}>
        <WorkReport serviceOrderId={serviceOrderId} />
      </TabsBody>
    </Tabs>
  );
};

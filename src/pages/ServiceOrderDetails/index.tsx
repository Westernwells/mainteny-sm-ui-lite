import {useState} from 'react';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import GradingIcon from '@mui/icons-material/Grading';
import FactCheck from '@mui/icons-material/FactCheck';
import {TabsBody} from 'components/TabsBody';
import {Tabs} from 'components/Tab';
import {useParams} from 'react-router';
import {Overview} from './Tabs/Overview';
import {WorkReport} from './Tabs/WorkReport';
import {Checklist} from './Tabs/Checklist';

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
    label: 'Checklist',
    icon: <FactCheck />,
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
        <WorkReport orderId={serviceOrderId} />
      </TabsBody>
      <TabsBody
        value={tabValue}
        index={2}
        containerStyle={{height: '1px', overflow: 'auto'}}>
        <Checklist orderId={serviceOrderId} />
      </TabsBody>
    </Tabs>
  );
};

import {useState} from 'react';
import {TabsBody} from 'components/TabsBody';
import {Tabs} from 'components/Tab';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ListAltIcon from '@mui/icons-material/ListAlt';
import {ServiceOrderScheduleTab} from './Tabs/ServiceOrderScheduleTab';

const tabItems = [
  {
    label: 'Schedule',
    icon: <CalendarTodayIcon />,
  },
  {
    label: 'Units',
    icon: <ListAltIcon />,
  },
];

export const ServiceOrders = () => {
  const [tabValue, setTabValue] = useState(0);

  return (
    <Tabs
      hideBackIcon
      tabItems={tabItems}
      currentIndex={tabValue}
      onChange={(index) => setTabValue(index)}>
      <TabsBody value={tabValue} index={0}>
        <ServiceOrderScheduleTab />
      </TabsBody>
      <TabsBody value={tabValue} index={1}>
        {null}
      </TabsBody>
    </Tabs>
  );
};

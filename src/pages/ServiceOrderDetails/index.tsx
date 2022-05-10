import {useState} from 'react';
import {TabsBody} from 'components/TabsBody';
import {Tabs} from 'components/Tab';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ListAltIcon from '@mui/icons-material/ListAlt';
import {Overview} from './Tabs/Overview';

const tabItems = [
  {
    label: 'Overview',
    icon: <CalendarTodayIcon />,
  },
  {
    label: 'Spare Parts',
    icon: <ListAltIcon />,
  },
  {
    label: 'Invoices',
    icon: <ListAltIcon />,
  },
];

export const ServiceOrderDetails = () => {
  const [tabValue, setTabValue] = useState(0);

  return (
    <Tabs
      tabItems={tabItems}
      currentIndex={tabValue}
      tabStyle={{ml: '5em'}}
      // pageTitle="Service Orders"  // TODO Separate label and title
      backBtnLabel="Service Orders"
      // renderWidget={renderWidget(tabValue)}
      onChange={(index) => {
        setTabValue(index);
      }}>
      <TabsBody value={tabValue} index={0} containerStyle={{height: 2}}>
        <Overview />
      </TabsBody>
      <TabsBody value={tabValue} index={1}>
        null
      </TabsBody>
    </Tabs>
  );
};

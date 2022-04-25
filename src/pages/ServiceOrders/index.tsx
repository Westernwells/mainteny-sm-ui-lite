import {useState} from 'react';
import {TabsBody} from 'components/TabsBody';
import {Tabs} from 'components/Tab';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ListAltIcon from '@mui/icons-material/ListAlt';
import {Widget} from 'components/Widget';
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
  const [search, setSearch] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  return (
    <Tabs
      hideBackIcon
      tabItems={tabItems}
      currentIndex={tabValue}
      renderWidget={
        <Widget
          searchPlaceholder=""
          getSearchValue={(val: string) => setSearch(val)}
          setShowFilter={setShowFilter}
          showFilter={showFilter}
          btnLabel="New Order"
          showNewBtn
          hideViewOption
        />
      }
      onChange={(index) => {
        setTabValue(index);
        setSearch('');
      }}>
      <TabsBody value={tabValue} index={0}>
        <ServiceOrderScheduleTab searchQuery={search} />
      </TabsBody>
      <TabsBody value={tabValue} index={1}>
        {null}
      </TabsBody>
    </Tabs>
  );
};

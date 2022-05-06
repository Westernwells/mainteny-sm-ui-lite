import {useState} from 'react';
import {TabsBody} from 'components/TabsBody';
import {Tabs} from 'components/Tab';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ListAltIcon from '@mui/icons-material/ListAlt';
import {Widget} from 'components/Widget';
import {ServiceOrderScheduleTab} from './Tabs/ServiceOrderScheduleTab';
import {ServiceOrderList} from './Tabs/ServiceOrderList.tsx';

const tabItems = [
  {
    label: 'Schedule',
    icon: <CalendarTodayIcon />,
  },
  {
    label: 'List',
    icon: <ListAltIcon />,
  },
];

export const ServiceOrders = () => {
  const [tabValue, setTabValue] = useState(0);
  const [showScheduleFilter, setShowScheduleFilter] = useState(false);
  const [showListFilter, setShowListFilter] = useState(false);
  const [listSearch, setListSearch] = useState('');

  const renderScheduleWidget = () => (
    <Widget
      searchPlaceholder=""
      setShowFilter={setShowScheduleFilter}
      showFilter={showScheduleFilter}
      btnLabel="New Order"
      showNewBtn
      hideViewOption
      hideSearchInput
    />
  );

  const renderListWidget = () => (
    <Widget
      searchPlaceholder="Search order type, customer, address"
      getSearchValue={(search) => setListSearch(search)}
      setShowFilter={setShowListFilter}
      showFilter={showListFilter}
      btnLabel="New Order"
      showNewBtn
      hideViewOption
    />
  );

  const renderWidget = (tabIndex: number) => {
    switch (tabIndex) {
      case 0:
        return renderScheduleWidget();
      case 1:
        return renderListWidget();
      default:
        return renderScheduleWidget();
    }
  };

  return (
    <Tabs
      hideBackIcon
      tabItems={tabItems}
      currentIndex={tabValue}
      pageTitle="Service Orders"
      renderWidget={renderWidget(tabValue)}
      onChange={(index) => {
        setTabValue(index);
      }}>
      <TabsBody value={tabValue} index={0}>
        <ServiceOrderScheduleTab
          setShowFilter={setShowScheduleFilter}
          showFilter={showScheduleFilter}
        />
      </TabsBody>
      <TabsBody value={tabValue} index={1}>
        <ServiceOrderList
          setShowFilter={setShowListFilter}
          showFilter={showListFilter}
          searchQuery={listSearch}
        />
      </TabsBody>
    </Tabs>
  );
};

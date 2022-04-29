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
    label: 'List',
    icon: <ListAltIcon />,
  },
];

export const ServiceOrders = () => {
  const [tabValue, setTabValue] = useState(0);
  // const [showFilter, setShowFilter] = useState(false);
  const [showScheduleFilter, setShowScheduleFilter] = useState(false);
  // const [scheduleFilter, setScheduleFilter] = useState();

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

  const renderListWidget = () => <div />;

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
        {null}
      </TabsBody>
    </Tabs>
  );
};

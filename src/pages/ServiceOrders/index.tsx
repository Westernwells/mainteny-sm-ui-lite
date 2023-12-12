import {useRef} from 'react';
import {TabsBody} from 'components/TabsBody';
import {Tabs} from 'components/Tab';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ListAltIcon from '@mui/icons-material/ListAlt';
import {useNavigate} from 'react-router-dom';
import {Mixpanel} from 'mixpanel/mixpanel';
import {mixpanelEvents} from 'mixpanel/constants';
import {useQueryState} from 'hooks/useQueryState';
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
  const [tabValue, setTabValue] = useQueryState('tab', {
    defaultValue: 0,
    reset: true,
    parserOptions: {parseNumbers: true},
  });
  const navigate = useNavigate();

  const track = (cb: () => void) => {
    Mixpanel.identifyAndTrack(mixpanelEvents.NEW_ORDER_BUTTON_CLICKED);
    cb();
  };

  const menu = useRef([
    {
      label: 'Emergency',
      action: () => track(() => navigate('/orders/new?type=emergency')),
    },
    {
      label: 'Callout',
      action: () => track(() => navigate('/orders/new?type=callout')),
    },
    {
      label: 'Repair',
      action: () => track(() => navigate('/orders/new?type=repair')),
    },
    {
      label: 'Maintenance',
      action: () => track(() => navigate('/orders/new?type=regular')),
    },
    {
      label: 'Inspection',
      action: () => track(() => navigate('/orders/new?type=inspection')),
    },
    {
      label: 'Installation',
      action: () => track(() => navigate('/orders/new?type=new_installation')),
    },
    {
      label: 'Modernization',
      action: () => track(() => navigate('/orders/new?type=modernization')),
    },
    {
      label: 'General',
      action: () => track(() => navigate('/orders/new?type=general')),
    },
  ]).current;

  return (
    <Tabs
      hideBackIcon
      tabItems={tabItems}
      showMenuActionBtn
      menu={menu}
      btnLabel="New Job"
      currentIndex={tabValue}
      pageTitle="Service Jobs"
      onChange={(index) => setTabValue(index)}>
      <TabsBody value={tabValue} index={0}>
        <ServiceOrderScheduleTab />
      </TabsBody>
      <TabsBody value={tabValue} index={1}>
        <ServiceOrderList />
      </TabsBody>
    </Tabs>
  );
};

export default ServiceOrders;

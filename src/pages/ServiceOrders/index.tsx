import {useEffect, useRef, useState} from 'react';
import {TabsBody} from 'components/TabsBody';
import {Tabs} from 'components/Tab';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ListAltIcon from '@mui/icons-material/ListAlt';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {formatSearchParams} from 'utils/utils';
import {Mixpanel} from 'mixpanel/mixpanel';
import {mixpanelEvents} from 'mixpanel/constants';
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
  const [queryParams, setQueryParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const currentParams = Object.fromEntries([...queryParams]);
    if (currentParams.tab) setTabValue(Number(currentParams.tab));
  }, []);

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

  useEffect(() => {
    const currentParams = Object.fromEntries([...queryParams]);
    if (currentParams.tab) setTabValue(Number(currentParams.tab));
  }, []);

  return (
    <Tabs
      hideBackIcon
      tabItems={tabItems}
      showMenuActionBtn
      menu={menu}
      btnLabel="New Job"
      currentIndex={tabValue}
      pageTitle="Service Jobs"
      onChange={(index) => {
        setQueryParams(
          formatSearchParams({tab: index.toString()}, queryParams),
        );
        setTabValue(index);
      }}>
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

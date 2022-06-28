import {useEffect, useRef, useState} from 'react';
import {TabsBody} from 'components/TabsBody';
import {Tabs} from 'components/Tab';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ListAltIcon from '@mui/icons-material/ListAlt';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {formatSearchParams} from 'utils/utils';
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

  const menu = useRef([
    {label: 'Emergency', action: () => navigate('/orders/new?type=emergency')},
    {label: 'Callout', action: () => navigate('/orders/new?type=callout')},
    {label: 'Repair', action: () => navigate('/orders/new?type=repair')},
    {label: 'Maintenance', action: () => navigate('/orders/new?type=regular')},
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
      btnLabel="New Order"
      currentIndex={tabValue}
      pageTitle="Service Orders"
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

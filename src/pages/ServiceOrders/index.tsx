import {TabsBody} from 'components/TabsBody';
import Tabs from 'components/Tabs';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import SettingsIcon from '@mui/icons-material/Settings';
import RefreshIcon from '@mui/icons-material/Refresh';
import YoutubeSearchedForIcon from '@mui/icons-material/YoutubeSearchedFor';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import UploadIcon from '@mui/icons-material/Upload';
import HandymanIcon from '@mui/icons-material/Handyman';
import {useNavigate} from 'react-router-dom';
import {useQueryState} from 'hooks/useQueryState';
import {ServiceOrderType} from 'models/service-order';
import {
  serviceOrderTypeColor,
  serviceOrderTypeToString,
} from 'utils/service-order-utils';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import React from 'react';
import PageContainer from 'components/PageContainer';
import TabsWrapper from 'components/TabsWrapper';
import {MenuBtnProps} from 'models/misc';
import {ServiceOrderList} from './Tabs/ServiceOrderList.tsx';
import {ServiceOrderScheduleTab} from './Tabs/ServiceOrderScheduleTab';

const tabItems = [
  {
    label: 'List',
    icon: <ListAltIcon />,
  },
  {
    label: 'Schedule',
    icon: <CalendarTodayIcon />,
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
    cb();
  };

  const menu: MenuBtnProps[] = [
    {
      label: serviceOrderTypeToString(ServiceOrderType.EMERGENCY),
      action: () => track(() => navigate('/orders/new?type=emergency')),
      icon: (
        <ReportProblemIcon
          sx={{color: serviceOrderTypeColor(ServiceOrderType.EMERGENCY)}}
        />
      ),
    },
    {
      label: serviceOrderTypeToString(ServiceOrderType.CALLOUT),
      action: () => track(() => navigate('/orders/new?type=callout')),
      icon: (
        <PhoneInTalkIcon
          sx={{color: serviceOrderTypeColor(ServiceOrderType.CALLOUT)}}
        />
      ),
    },
    {
      label: serviceOrderTypeToString(ServiceOrderType.REPAIR),
      action: () => track(() => navigate('/orders/new?type=repair')),
      icon: (
        <SettingsIcon
          sx={{color: serviceOrderTypeColor(ServiceOrderType.REPAIR)}}
        />
      ),
    },
    {
      label: serviceOrderTypeToString(ServiceOrderType.REGULAR),
      action: () => track(() => navigate('/orders/new?type=regular')),
      icon: (
        <RefreshIcon
          sx={{color: serviceOrderTypeColor(ServiceOrderType.REGULAR)}}
        />
      ),
    },
    {
      label: serviceOrderTypeToString(ServiceOrderType.INSPECTION),
      action: () => track(() => navigate('/orders/new?type=inspection')),
      icon: (
        <YoutubeSearchedForIcon
          sx={{color: serviceOrderTypeColor(ServiceOrderType.INSPECTION)}}
        />
      ),
    },
    {
      label: serviceOrderTypeToString(ServiceOrderType.NEW_INSTALLATION),
      action: () => track(() => navigate('/orders/new?type=new_installation')),
      icon: (
        <BuildCircleIcon
          sx={{color: serviceOrderTypeColor(ServiceOrderType.NEW_INSTALLATION)}}
        />
      ),
    },
    {
      label: serviceOrderTypeToString(ServiceOrderType.MODERNIZATION),
      action: () => track(() => navigate('/orders/new?type=modernization')),
      icon: (
        <UploadIcon
          sx={{color: serviceOrderTypeColor(ServiceOrderType.MODERNIZATION)}}
        />
      ),
    },
    {
      label: serviceOrderTypeToString(ServiceOrderType.GENERAL),
      action: () => track(() => navigate('/orders/new?type=general')),
      icon: (
        <HandymanIcon
          sx={{color: serviceOrderTypeColor(ServiceOrderType.GENERAL)}}
        />
      ),
    },
    {
      label: serviceOrderTypeToString(ServiceOrderType.OPERATION),
      action: () => track(() => navigate('/orders/new?type=operation')),
      icon: (
        <RemoveRedEyeIcon
          sx={{color: serviceOrderTypeColor(ServiceOrderType.OPERATION)}}
        />
      ),
    },
  ];

  return (
    <PageContainer gap={3}>
      <TabsWrapper
        hideBackIcon
        tabItems={tabItems}
        showMenuActionBtn
        menu={menu}
        btnLabel="New Job"
        currentIndex={tabValue}
        pageTitle="Service Jobs"
        onChange={(index) => setTabValue(index)}
        shouldWrap={tabValue === 1}>
        {tabValue === 0 && (
          <Tabs
            tabItems={tabItems}
            currentIndex={tabValue}
            onChange={(index) => setTabValue(index)}
          />
        )}
        <TabsBody value={tabValue} index={0}>
          <ServiceOrderList menu={menu} />
        </TabsBody>
        <TabsBody value={tabValue} index={1}>
          <ServiceOrderScheduleTab />
        </TabsBody>
      </TabsWrapper>
    </PageContainer>
  );
};

export default ServiceOrders;

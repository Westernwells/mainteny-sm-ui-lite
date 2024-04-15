import {TabsBody} from 'components/TabsBody';
import {Tabs} from 'components/Tab';
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
import {useTranslation} from 'react-i18next';
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
  const {t} = useTranslation();

  const track = (cb: () => void) => {
    cb();
  };

  const menu = [
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
      label: t(serviceOrderTypeToString(ServiceOrderType.GENERAL), {
        context: 'other',
      }),
      action: () => track(() => navigate('/orders/new?type=general')),
      icon: (
        <HandymanIcon
          sx={{color: serviceOrderTypeColor(ServiceOrderType.GENERAL)}}
        />
      ),
    },
  ];

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

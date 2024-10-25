import {TabsBody} from 'components/TabsBody';
import Tabs from 'components/Tabs';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ListAltIcon from '@mui/icons-material/ListAlt';
import {useNavigate} from 'react-router-dom';
import {useQueryState} from 'hooks/useQueryState';
import {serviceOrderTypeToString} from 'utils/service-order-utils';
import PageContainer from 'components/PageContainer';
import TabsWrapper from 'components/TabsWrapper';
import {MenuBtnProps} from 'models/misc';
import {useCompanyJobTypes} from 'hooks/reactQuery/useCompanies';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import PhoneInTalkOutlinedIcon from '@mui/icons-material/PhoneInTalkOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LoopOutlinedIcon from '@mui/icons-material/LoopOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import MemoryOutlinedIcon from '@mui/icons-material/MemoryOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import HandymanOutlinedIcon from '@mui/icons-material/HandymanOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import WbIncandescentOutlinedIcon from '@mui/icons-material/WbIncandescentOutlined';
import WeekendOutlinedIcon from '@mui/icons-material/WeekendOutlined';
import WifiTetheringOutlinedIcon from '@mui/icons-material/WifiTetheringOutlined';
import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
import ZoomOutMapOutlinedIcon from '@mui/icons-material/ZoomOutMapOutlined';
import TextsmsOutlinedIcon from '@mui/icons-material/TextsmsOutlined';
import WaterDamageOutlinedIcon from '@mui/icons-material/WaterDamageOutlined';
import WatchOutlinedIcon from '@mui/icons-material/WatchOutlined';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import VolumeDownOutlinedIcon from '@mui/icons-material/VolumeDownOutlined';
import VideoCameraFrontOutlinedIcon from '@mui/icons-material/VideoCameraFrontOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import TwoWheelerOutlinedIcon from '@mui/icons-material/TwoWheelerOutlined';
import UmbrellaOutlinedIcon from '@mui/icons-material/UmbrellaOutlined';
import ElevatorOutlinedIcon from '@mui/icons-material/ElevatorOutlined';
import {ServiceOrderList} from './Tabs/ServiceOrderList.tsx';
import {ServiceOrderScheduleTab} from './Tabs/ServiceOrderScheduleTab';

export const iconMapping = {
  LoopOutlinedIcon,
  WarningAmberOutlinedIcon,
  SettingsOutlinedIcon,
  PhoneInTalkOutlinedIcon,
  BuildOutlinedIcon,
  MemoryOutlinedIcon,
  SearchOutlinedIcon,
  RemoveRedEyeOutlinedIcon,
  HandymanOutlinedIcon,
  WbIncandescentOutlinedIcon,
  WeekendOutlinedIcon,
  WifiTetheringOutlinedIcon,
  WorkOutlineOutlinedIcon,
  ZoomOutMapOutlinedIcon,
  TextsmsOutlinedIcon,
  WaterDamageOutlinedIcon,
  WatchOutlinedIcon,
  VpnKeyOutlinedIcon,
  VolumeDownOutlinedIcon,
  VideoCameraFrontOutlinedIcon,
  VerifiedUserOutlinedIcon,
  TwoWheelerOutlinedIcon,
  UmbrellaOutlinedIcon,
  ElevatorOutlinedIcon,
  HelpOutlineOutlinedIcon,
};

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
  const {user} = useUserSession();

  const {data: jobTypes} = useCompanyJobTypes(
    user?.userAccount.serviceCompany.id!,
  );

  const menu: MenuBtnProps[] =
    jobTypes?.map((jobType) => {
      const IconComponent =
        iconMapping[jobType.icon as keyof typeof iconMapping] ||
        'HelpOutlineOutlinedIcon';

      return {
        label:
          serviceOrderTypeToString(jobType.name) === '-'
            ? jobType.name
            : serviceOrderTypeToString(jobType.name),
        action: () => navigate(`/orders/new?type=${jobType.name}`),
        icon: <IconComponent />,
      };
    }) || [];

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

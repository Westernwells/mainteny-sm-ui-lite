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
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import {
  useCompanyJobTypes,
  useOldCompanyJobTypes,
} from 'hooks/reactQuery/useCompanies';
import {useUserSession} from 'hooks/reactQuery/useUserSession';

const iconMapping = {
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
  CloseOutlinedIcon,
};

interface Props {
  serviceOrderType?: string;
  style?: {[key: string]: string | number};
  size?: 'inherit' | 'large' | 'medium' | 'small';
}

export const ServiceOrderIcons = ({serviceOrderType, style, size}: Props) => {
  const {user} = useUserSession();

  const {data: jobTypes} = useCompanyJobTypes(
    user?.userAccount.serviceCompany.id!,
  );

  const {data: oldJobTypes} = useOldCompanyJobTypes(
    user?.userAccount.serviceCompany.id!,
  );

  const sanitizedServiceOrderType = serviceOrderType?.startsWith(
    'SERVICE_ORDER_',
  )
    ? serviceOrderType.replace('SERVICE_ORDER_', '')
    : serviceOrderType;

  const activeJobType = jobTypes?.find(
    (jobType) => jobType.name === sanitizedServiceOrderType,
  );

  const iconName =
    activeJobType?.icon ??
    oldJobTypes?.find(
      (oldJobType) =>
        oldJobType.name.toLowerCase() ===
        sanitizedServiceOrderType?.toLowerCase(),
    )?.icon;

  const IconComponent = iconName
    ? iconMapping[iconName as keyof typeof iconMapping]
    : null;

  if (IconComponent) {
    return <IconComponent fontSize={size} sx={{...style}} />;
  }

  return null;
};

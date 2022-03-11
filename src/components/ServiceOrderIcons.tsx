import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import SyncIcon from '@mui/icons-material/Sync';
import {ServiceOrderType} from '../models/service-order';
import {ReactComponent as EmergencyIcon} from '../assets/icons/Emergency.svg';
import {ReactComponent as RegularIcon} from '../assets/icons/Regular.svg';
import {ReactComponent as CalloutIcon} from '../assets/icons/Callout.svg';

interface Props {
  serviceOrderType?: ServiceOrderType;
  style?: {[key: string]: string | number};
}
export const ServiceOrderIcons = ({serviceOrderType, style}: Props) => {
  switch (serviceOrderType) {
    case ServiceOrderType.REPAIR:
      return <SettingsOutlinedIcon sx={{color: '#ED6C02', ...style}} />;
    case ServiceOrderType.REGULAR:
      return <RegularIcon style={{...style}} />;
    case ServiceOrderType.EMERGENCY:
      return <EmergencyIcon style={style} />;
    case ServiceOrderType.CALLOUT:
      return <CalloutIcon style={style} />;
    default:
      return null;
  }
};

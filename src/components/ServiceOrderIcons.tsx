import useTheme from '@mui/material/styles/useTheme';
import LoopIcon from '@mui/icons-material/Loop';
import WifiCallingIcon from '@mui/icons-material/WifiCalling';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import {amber, grey} from '@mui/material/colors';
import SettingsIcon from '@mui/icons-material/Settings';
import YoutubeSearchedForIcon from '@mui/icons-material/YoutubeSearchedFor';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import UploadIcon from '@mui/icons-material/Upload';
import HandymanIcon from '@mui/icons-material/Handyman';
import {ServiceOrderType} from '../models/service-order';

interface Props {
  serviceOrderType?: ServiceOrderType;
  style?: {[key: string]: string | number};
  size?: 'inherit' | 'large' | 'medium' | 'small';
}
export const ServiceOrderIcons = ({serviceOrderType, style, size}: Props) => {
  const theme = useTheme();
  switch (serviceOrderType) {
    case ServiceOrderType.REPAIR:
      return (
        <SettingsIcon fontSize={size} sx={{color: amber[800], ...style}} />
      );
    case ServiceOrderType.REGULAR:
      return <LoopIcon fontSize={size} color="secondary" sx={{...style}} />;
    case ServiceOrderType.EMERGENCY:
      return (
        <ReportProblemIcon fontSize={size} color="error" sx={{...style}} />
      );
    case ServiceOrderType.CALLOUT:
      return (
        <WifiCallingIcon fontSize={size} sx={{color: grey[800], ...style}} />
      );
    case ServiceOrderType.INSPECTION:
      return (
        <YoutubeSearchedForIcon
          fontSize={size}
          sx={{color: theme.palette.primary.main, ...style}}
        />
      );
    case ServiceOrderType.NEW_INSTALLATION:
      return (
        <BuildCircleIcon
          fontSize={size}
          sx={{color: theme.palette.secondary.dark, ...style}}
        />
      );
    case ServiceOrderType.MODERNIZATION:
      return (
        <UploadIcon
          fontSize={size}
          sx={{color: theme.palette.primary.main, ...style}}
        />
      );
    case ServiceOrderType.GENERAL:
      return (
        <HandymanIcon
          fontSize={size}
          sx={{color: theme.palette.primary.main, ...style}}
        />
      );
    default:
      return null;
  }
};

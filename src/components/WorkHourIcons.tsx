import useTheme from '@mui/material/styles/useTheme';
import LoopIcon from '@mui/icons-material/Loop';
import WifiCallingIcon from '@mui/icons-material/WifiCalling';
import ModelTrainingIcon from '@mui/icons-material/ModelTraining';
import TimelapseIcon from '@mui/icons-material/Timelapse';
import CoffeeIcon from '@mui/icons-material/Coffee';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import SickIcon from '@mui/icons-material/Sick';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import YoutubeSearchedForIcon from '@mui/icons-material/YoutubeSearchedFor';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import UploadIcon from '@mui/icons-material/Upload';
import HandymanIcon from '@mui/icons-material/Handyman';
import {grey} from '@mui/material/colors';
import SettingsIcon from '@mui/icons-material/Settings';
import {WorkHoursType} from 'models/workHours';

interface Props {
  workHourType?: WorkHoursType;
  style?: {[key: string]: string | number};
  size?: 'inherit' | 'large' | 'medium' | 'small';
}
export const WorkHourIcons = ({workHourType, style, size}: Props) => {
  const theme = useTheme();
  switch (workHourType) {
    case WorkHoursType.REPAIR:
      return <SettingsIcon fontSize={size} sx={{color: '#FFB547', ...style}} />;
    case WorkHoursType.REGULAR:
      return <LoopIcon fontSize={size} color="secondary" sx={{...style}} />;
    case WorkHoursType.EMERGENCY:
      return (
        <ReportProblemIcon fontSize={size} color="error" sx={{...style}} />
      );
    case WorkHoursType.CALLOUT:
      return (
        <WifiCallingIcon fontSize={size} sx={{color: '#0D3C61', ...style}} />
      );
    case WorkHoursType.INSPECTION:
      return (
        <YoutubeSearchedForIcon
          fontSize={size}
          sx={{color: theme.palette.primary.main, ...style}}
        />
      );
    case WorkHoursType.NEW_INSTALLATION:
      return (
        <BuildCircleIcon
          fontSize={size}
          sx={{color: theme.palette.secondary.dark, ...style}}
        />
      );
    case WorkHoursType.MODERNIZATION:
      return (
        <UploadIcon
          fontSize={size}
          sx={{color: theme.palette.primary.main, ...style}}
        />
      );
    case WorkHoursType.GENERAL:
      return (
        <HandymanIcon
          fontSize={size}
          sx={{color: theme.palette.primary.main, ...style}}
        />
      );
    case WorkHoursType.OTHERS:
      return (
        <DesignServicesIcon fontSize={size} sx={{color: grey[700], ...style}} />
      );
    case WorkHoursType.TRAINING:
      return (
        <ModelTrainingIcon fontSize={size} sx={{color: '#396495', ...style}} />
      );
    case WorkHoursType.OFFICE_HOURS:
      return (
        <TimelapseIcon fontSize={size} sx={{color: '#4CAF50', ...style}} />
      );
    case WorkHoursType.SICK_LEAVE:
      return <SickIcon fontSize={size} sx={{color: '#8F9BB3', ...style}} />;
    case WorkHoursType.HOLIDAY:
      return <WbSunnyIcon fontSize={size} sx={{color: '#FFB547', ...style}} />;
    case WorkHoursType.BREAK:
      return <CoffeeIcon fontSize={size} sx={{color: '#00A0CC', ...style}} />;

    default:
      return null;
  }
};

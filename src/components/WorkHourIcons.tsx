import ModelTrainingIcon from '@mui/icons-material/ModelTraining';
import TimelapseIcon from '@mui/icons-material/Timelapse';
import CoffeeIcon from '@mui/icons-material/Coffee';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import SickIcon from '@mui/icons-material/Sick';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import {grey} from '@mui/material/colors';
import {WorkHoursType} from 'models/workHours';

interface Props {
  workHourType?: WorkHoursType;
  style?: {[key: string]: string | number};
  size?: 'inherit' | 'large' | 'medium' | 'small';
}
export const WorkHourIcons = ({workHourType, style, size}: Props) => {
  switch (workHourType) {
    case WorkHoursType.OTHERS:
      return (
        <DesignServicesIcon fontSize={size} sx={{color: grey[700], ...style}} />
      );
    case WorkHoursType.TRAINING:
      return (
        <ModelTrainingIcon fontSize={size} sx={{color: '#396495', ...style}} />
      );
    case WorkHoursType.OFFICE_HOURS:
    case WorkHoursType.OFFICE_WORK:
    case WorkHoursType.FIELD_WORK:
      return (
        <TimelapseIcon fontSize={size} sx={{color: '#00D68F', ...style}} />
      );
    case WorkHoursType.SICK_LEAVE:
      return <SickIcon fontSize={size} sx={{color: '#8F9BB3', ...style}} />;
    case WorkHoursType.HOLIDAY:
      return <WbSunnyIcon fontSize={size} sx={{color: '#FFB547', ...style}} />;
    case WorkHoursType.VACATION:
      return <WbSunnyIcon fontSize={size} sx={{color: '#FFB547', ...style}} />;
    case WorkHoursType.BREAK:
      return <CoffeeIcon fontSize={size} sx={{color: '#00A0CC', ...style}} />;
    default:
      return null;
  }
};

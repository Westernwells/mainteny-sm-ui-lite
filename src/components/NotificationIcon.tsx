import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import SettingsIcon from '@mui/icons-material/Settings';
import {MessageType} from 'models/notification';
import {CalendarToday} from '@mui/icons-material';
import useTheme from '@mui/material/styles/useTheme';

interface Props {
  messageType?: MessageType;
  style?: {[key: string]: string | number};
  size?: 'inherit' | 'large' | 'medium' | 'small';
}

export const NotificationIcon = ({messageType, style, size}: Props) => {
  const theme = useTheme();
  switch (messageType) {
    case MessageType.EMERGENCY_ORDER_ACCEPTED:
      return (
        <SettingsIcon
          fontSize={size}
          sx={{color: theme.palette.primary.light, ...style}}
        />
      );
    case MessageType.NON_TECHNICIAN_ASSIGNMENT_FOR_SERVICE_ORDER:
      return (
        <ReportProblemIcon
          fontSize={size}
          sx={{color: theme.palette.error.light, ...style}}
        />
      );
    case MessageType.TECHNICIAN_JOB_SCHEDULE_UPDATED:
      return (
        <CalendarToday
          fontSize={size}
          sx={{color: theme.palette.primary.light, ...style}}
        />
      );
    default:
      return null;
  }
};

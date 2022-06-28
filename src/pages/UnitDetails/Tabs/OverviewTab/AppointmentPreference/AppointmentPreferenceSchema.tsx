import {CardProps} from 'components/CardProps';
import PermContactCalendarIcon from '@mui/icons-material/PermContactCalendar';
import CachedIcon from '@mui/icons-material/Cached';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import FlagIcon from '@mui/icons-material/Flag';
import useTheme from '@mui/material/styles/useTheme';
import {ElevatorProperty} from 'models/elevator';

export enum AppointmentPreferenceKey {
  appointmentDaysOfWeek = 'appointmentDaysOfWeek',
  openingHours = 'openingHours',
  requiresAppointment = 'requiresAppointment',
  requiresAppointmentNotification = 'requiresAppointmentNotification',
  appointmentNotificationDueInDays = 'appointmentNotificationDueInDays',
}

interface Props {
  label: string;
  property: ElevatorProperty;
}

export const AppointmentPreferenceSchema = ({label, property}: Props) => {
  const theme = useTheme();
  const renderSection = () => {
    switch (label) {
      case AppointmentPreferenceKey.appointmentDaysOfWeek:
        return (
          <CardProps
            icon={
              <PermContactCalendarIcon sx={{color: theme.palette.info.dark}} />
            }
            label="DAYS OF THE WEEK"
            bodyText={property.value}
            iconBackground={theme.palette.info.outlinedHoverBg}
            containerStyles={{mt: '0.5em'}}
            iconMaxHeight="3em"
          />
        );
      case AppointmentPreferenceKey.openingHours:
        return (
          <CardProps
            icon={<CachedIcon sx={{color: theme.palette.info.dark}} />}
            label="OPENING HOURS"
            bodyText={property.value}
            iconBackground={theme.palette.info.outlinedHoverBg}
            containerStyles={{mt: '0.5em'}}
            iconMaxHeight="3em"
          />
        );
      case AppointmentPreferenceKey.requiresAppointment:
        return (
          <CardProps
            icon={<CalendarTodayIcon sx={{color: theme.palette.info.dark}} />}
            label="REQUIRES APPOINTMENT"
            bodyText={property.value}
            iconBackground={theme.palette.info.outlinedHoverBg}
            containerStyles={{mt: '0.5em'}}
            iconMaxHeight="3em"
          />
        );
      case AppointmentPreferenceKey.requiresAppointmentNotification:
        return (
          <CardProps
            icon={
              <AccessTimeFilledIcon sx={{color: theme.palette.info.dark}} />
            }
            label="REQUIRES NOTIFICATION"
            bodyText={property.value}
            iconBackground={theme.palette.info.outlinedHoverBg}
            containerStyles={{mt: '0.5em'}}
            iconMaxHeight="3em"
          />
        );
      case AppointmentPreferenceKey.appointmentNotificationDueInDays:
        return (
          <CardProps
            icon={<FlagIcon sx={{color: theme.palette.info.dark}} />}
            label="NOTIFICATION DUE"
            bodyText={property.value}
            iconBackground={theme.palette.info.outlinedHoverBg}
            containerStyles={{mt: '0.5em'}}
            iconMaxHeight="3em"
          />
        );
      default:
        return null;
    }
  };
  return renderSection();
};

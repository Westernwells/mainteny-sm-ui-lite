import {CardProps} from 'components/CardProps';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import NotificationsIcon from '@mui/icons-material/Notifications';
import useTheme from '@mui/material/styles/useTheme';
import {ElevatorView} from 'models/elevator';
import {useTranslation} from 'react-i18next';

interface Props {
  label: string;
  elevator: ElevatorView;
  daysOfWeek: string;
  openingHours: string;
}

export const AppointmentShema = ({
  label,
  daysOfWeek,
  openingHours,
  elevator,
}: Props) => {
  const theme = useTheme();
  const {t} = useTranslation();

  const renderSection = () => {
    switch (label) {
      case 'daysOfWeek':
        return (
          <CardProps
            icon={<ViewWeekIcon sx={{color: theme.palette.primary.light}} />}
            label="Days of the week"
            bodyText={daysOfWeek}
            iconMaxHeight="3em"
            containerStyles={{alignItems: 'center'}}
          />
        );
      case 'openingHours':
        return (
          <CardProps
            icon={
              <TimerOutlinedIcon sx={{color: theme.palette.primary.light}} />
            }
            label="Opening hours"
            bodyText={openingHours}
            iconMaxHeight="3em"
            containerStyles={{alignItems: 'center'}}
          />
        );
      case 'requiresAppointment':
        return (
          <CardProps
            icon={
              <AssignmentTurnedInIcon
                sx={{color: theme.palette.primary.light}}
              />
            }
            label="Requires appointment"
            bodyText={
              elevator.additionalInfo?.customerAppointment?.requiresAppointment
                ? t('Yes')
                : t('No')
            }
            iconMaxHeight="3em"
            containerStyles={{alignItems: 'center'}}
          />
        );
      case 'requiresNotification':
        return (
          <CardProps
            icon={
              <NotificationsIcon sx={{color: theme.palette.primary.light}} />
            }
            label="Requires notification"
            bodyText={
              elevator.additionalInfo.customerAppointment?.shouldNotifyCustomer
                ? t('Yes')
                : t('No')
            }
            iconMaxHeight="3em"
            containerStyles={{alignItems: 'center'}}
          />
        );
      case 'notificationDue':
        return (
          <CardProps
            icon={
              <NotificationsIcon sx={{color: theme.palette.primary.light}} />
            }
            label="Notification due"
            bodyText={
              elevator?.additionalInfo?.customerAppointment
                ?.appointmentNotificationDue
                ? `${
                    elevator?.additionalInfo?.customerAppointment
                      ?.appointmentNotificationDue
                  } ${t(
                    elevator?.additionalInfo?.customerAppointment
                      ?.appointmentNotificationDue > 1
                      ? 'days'
                      : 'day',
                  )}`
                : '-'
            }
            iconMaxHeight="3em"
            containerStyles={{alignItems: 'center'}}
          />
        );

      default:
        return null;
    }
  };
  return renderSection();
};

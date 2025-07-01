import {CardProps} from 'components/CardProps';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import NotificationsIcon from '@mui/icons-material/Notifications';
import {ReactComponent as AlertInfoIcon} from 'assets/icons/AlertInfo.svg';
import useTheme from '@mui/material/styles/useTheme';
import {ElevatorSimpleView, ElevatorView} from 'models/elevator';
import {useTranslation} from 'react-i18next';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import {Box, Typography} from '@mui/material';
import Link from '@mui/material/Link';

interface Props {
  label: string;
  elevator: ElevatorView | ElevatorSimpleView;
  daysOfWeek: string;
  openingHours: string;
}

export const AppointmentSchema = ({
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
      case 'contactPerson':
        return (
          <CardProps
            icon={
              <PersonOutlinedIcon
                style={{color: theme.palette.primary.light}}
              />
            }
            label="Contact person"
            bodyText={
              elevator.additionalInfo.customerAppointment?.contactPerson ? (
                <Box sx={{display: 'flex', flexDirection: 'column'}}>
                  <Typography variant="body2" sx={{fontWeight: 600}}>
                    {`${elevator.additionalInfo.customerAppointment?.contactPerson.userAccount.firstName} ${elevator.additionalInfo.customerAppointment?.contactPerson.userAccount.lastName}`}
                  </Typography>
                  {elevator.additionalInfo.customerAppointment?.contactPerson
                    .userAccount.contact?.email && (
                    <Link
                      href={`mailto:${elevator.additionalInfo.customerAppointment?.contactPerson.userAccount.contact.email}`}
                      underline="hover"
                      variant="body2"
                      sx={{
                        display: 'block',
                        fontWeight: '400',
                        color: theme.palette.info.main,
                      }}>
                      {
                        elevator.additionalInfo.customerAppointment
                          ?.contactPerson.userAccount.contact.email
                      }
                    </Link>
                  )}
                  {elevator.additionalInfo.customerAppointment?.contactPerson
                    .userAccount.contact?.phone && (
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 400,
                        color: theme.palette.text.primary,
                      }}>
                      {
                        elevator.additionalInfo.customerAppointment
                          ?.contactPerson.userAccount.contact.phone
                      }
                    </Typography>
                  )}
                </Box>
              ) : (
                '-'
              )
            }
            iconMaxHeight="3em"
            containerStyles={{alignItems: 'center'}}
          />
        );

      case 'description':
        return (
          <CardProps
            icon={
              <AlertInfoIcon style={{color: theme.palette.primary.light}} />
            }
            label="Description"
            bodyText={
              elevator.additionalInfo.customerAppointment?.description || '-'
            }
            iconMaxHeight="3em"
            containerStyles={{alignItems: 'center'}}
            hasMaxWidth={false}
          />
        );
      default:
        return null;
    }
  };
  return renderSection();
};

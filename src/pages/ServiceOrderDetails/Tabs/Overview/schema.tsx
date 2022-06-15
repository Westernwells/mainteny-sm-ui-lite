/* eslint-disable */
import ConstructionIcon from '@mui/icons-material/Construction';
import PeopleIcon from '@mui/icons-material/People';
import InfoIcon from '@mui/icons-material/Info';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FlagIcon from '@mui/icons-material/Flag';
import PersonIcon from '@mui/icons-material/Person';
import HomeIcon from '@mui/icons-material/Home';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import Grid3x3Icon from '@mui/icons-material/Grid3x3';
import ElevatorIcon from '@mui/icons-material/Elevator';
import PermContactCalendarIcon from '@mui/icons-material/PermContactCalendar';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import TimerIcon from '@mui/icons-material/Timer';
import TimelapseIcon from '@mui/icons-material/Timelapse';
import {
  ServiceOrder,
  ServiceOrderStatus,
  ServiceOrderView,
} from 'models/service-order';
import {serviceOrderStatusToString} from 'utils/service-order-utils';
import {convertMinsToHM, formatDate, toDate} from 'utils/datetime';
// import useTheme from '@mui/material/styles/useTheme';
import {theme} from 'theme';
import {CardProps} from 'components/CardProps';
interface OrderInfoProps {
  serviceOrderDetails: ServiceOrderView;
  label: string;
}

export const OrderInfo = ({serviceOrderDetails, label}: OrderInfoProps) => {
  // const theme = useTheme();
  const renderSection = () => {
    switch (label) {
      case 'customer':
        return (
          <CardProps
            icon={<PeopleIcon sx={{color: theme.palette.info.dark}} />}
            label="CUSTOMER"
            bodyText={serviceOrderDetails.elevator.propertyOwner.name || '-'}
            iconBackground={theme.palette.info.outlinedHoverBg}
            containerStyles={{mt: '0.5em'}}
            iconMaxHeight="3em"
          />
        );
      case 'unitNumber':
        return (
          <CardProps
            icon={<Grid3x3Icon sx={{color: theme.palette.info.dark}} />}
            label="UNIT NUMBER"
            bodyText={serviceOrderDetails.elevator.number || '-'}
            iconBackground={theme.palette.info.outlinedHoverBg}
            containerStyles={{mt: '0.5em'}}
            iconMaxHeight="3em"
          />
        );
      case 'unitAddress':
        return (
          <CardProps
            icon={<HomeIcon sx={{color: theme.palette.info.dark}} />}
            label="UNIT ADDRESS"
            bodyText={serviceOrderDetails.elevator.address.fullName || '-'}
            iconBackground={theme.palette.info.outlinedHoverBg}
            containerStyles={{mt: '0.5em'}}
            iconMaxHeight="3em"
          />
        );
      case 'dueDate':
        return (
          <CardProps
            icon={<FlagIcon sx={{color: theme.palette.info.dark}} />}
            label="DUE DATE"
            bodyText={
              formatDate(new Date(serviceOrderDetails.dueDate), 'dd.MM.yyyy') ||
              '-'
            }
            iconBackground={theme.palette.info.outlinedHoverBg}
            containerStyles={{mt: '0.5em'}}
            iconMaxHeight="3em"
          />
        );
      case 'schedule':
        return (
          <CardProps
            icon={<TimelapseIcon sx={{color: theme.palette.info.dark}} />}
            label="SCHEDULE"
            bodyText={
              serviceOrderDetails.schedules &&
              serviceOrderDetails.schedules.length
                ? `${formatDate(
                    toDate(serviceOrderDetails.schedules[0].startTime),
                    'dd.MM.yyyy',
                  )},${formatDate(
                    toDate(serviceOrderDetails.schedules[0].startTime),
                    'HH:mm',
                  )}`
                : '-'
            }
            iconBackground={theme.palette.info.outlinedHoverBg}
            containerStyles={{mt: '0.5em'}}
            iconMaxHeight="3em"
          />
        );
      case 'technicians':
        return (
          <CardProps
            icon={<ManageAccountsIcon sx={{color: theme.palette.info.dark}} />}
            label="TECHNICIAN"
            bodyText={
              serviceOrderDetails.schedules &&
              serviceOrderDetails.schedules.length
                ? serviceOrderDetails.schedules
                    .map(
                      (item) =>
                        `${item.technician.userAccount.firstName} ${item.technician.userAccount.lastName}`,
                    )
                    .join(', ')
                : '-'
            }
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

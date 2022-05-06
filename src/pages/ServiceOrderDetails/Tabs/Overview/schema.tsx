import ConstructionIcon from '@mui/icons-material/Construction';
import useTheme from '@mui/material/styles/useTheme';
import PeopleIcon from '@mui/icons-material/People';
import InfoIcon from '@mui/icons-material/Info';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FlagIcon from '@mui/icons-material/Flag';
import PersonIcon from '@mui/icons-material/Person';
import HomeIcon from '@mui/icons-material/Home';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import ElevatorIcon from '@mui/icons-material/Elevator';
import PermContactCalendarIcon from '@mui/icons-material/PermContactCalendar';
import TimerIcon from '@mui/icons-material/Timer';
import {ServiceOrder, ServiceOrderStatus} from 'models/service-order';
import {getServiceOrderStatusText} from 'utils/service-order-utils';
import {convertMinsToHM, formatDate} from 'utils/datetime';

export const orderInfo = (serviceOrderDetails: ServiceOrder) => {
  const theme = useTheme();
  return {
    type: {
      label: 'ORDER TYPE',
      value: serviceOrderDetails.type,
      icon: <ConstructionIcon sx={{color: theme.palette.info.dark}} />,
    },
    people: {
      label: 'CUSTOMER',
      value: serviceOrderDetails.elevator.propertyOwner.address.fullName,
      icon: <PeopleIcon sx={{color: theme.palette.info.dark}} />,
    },
    status: {
      label: 'STATUS',
      value: getServiceOrderStatusText(serviceOrderDetails.status),
      icon: <InfoIcon sx={{color: theme.palette.info.dark}} />,
    },
    createdOn: {
      label: 'CREATED ON',
      value: formatDate(serviceOrderDetails.meta.createdAt, 'dd.MM.yyyy'),
      icon: <CalendarTodayIcon sx={{color: theme.palette.info.dark}} />,
    },
    dueDate: {
      label: 'DUE DATE',
      value: formatDate(new Date(serviceOrderDetails.dueDate), 'dd.MM.yyyy'),
      icon: <FlagIcon sx={{color: theme.palette.info.dark}} />,
    },
    technician: {
      label: 'TECHNICIAN',
      value: serviceOrderDetails.schedules
        .map(
          (schedule) =>
            `${schedule.technician.userAccount.firstName} ${schedule.technician.userAccount.firstName}`,
        )
        .join(','),
      icon: <PersonIcon sx={{color: theme.palette.info.dark}} />,
    },
  };
};


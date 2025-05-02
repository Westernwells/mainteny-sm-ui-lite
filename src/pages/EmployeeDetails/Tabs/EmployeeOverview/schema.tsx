import {t} from 'i18next';
import HomeIcon from '@mui/icons-material/Home';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined';
import EmailIcon from '@mui/icons-material/Email';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import Grid3x3Icon from '@mui/icons-material/Grid3x3';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import {Typography} from '@mui/material';
import {capitalize, convertToText} from 'utils/utils';
import {theme} from 'theme';
import {UserView} from 'models/user';
import {formatServiceName} from 'utils/work-hours-utils';
import {TimeWindowRecord} from 'models/misc';

export const employeeDetailSchema = (employee: UserView) => {
  const orderTypes =
    employee.userData.additionalInfo?.assignedServiceOrderTypes;

  const formatOrderNames = () => {
    const formatOrderText =
      orderTypes &&
      orderTypes.length > 0 &&
      orderTypes.map((item) => t(formatServiceName(item) ?? ''));
    if (formatOrderText) {
      return capitalize(formatOrderText);
    }
    return '-';
  };

  const renderShiftTime = (time: TimeWindowRecord[]) => {
    const formatShiftTime = time.map(
      (item: TimeWindowRecord) =>
        `${t(convertToText(item.type))} ${item.fromTime} - ${item.toTime}`,
    );
    return capitalize(formatShiftTime);
  };

  return {
    phone: {
      label: 'PHONE',
      value: employee.userAccount.contact.phone,
      icon: <LocalPhoneIcon sx={{color: theme.palette.info.dark}} />,
    },
    employeeId: {
      label: 'Employee ID',
      value: employee.userData.externalId || '-',
      icon: <Grid3x3Icon sx={{color: theme.palette.info.dark}} />,
    },
    assignedOrderTypes: {
      label: 'ASSIGNED ORDER TYPES',
      value:
        employee && employee.userData.additionalInfo && orderTypes?.length
          ? formatOrderNames()
          : '-',
      icon: <CalendarTodayIcon sx={{color: theme.palette.info.dark}} />,
    },
    email: {
      label: 'EMAIL',
      value: employee.userAccount.contact.email,
      icon: <EmailIcon sx={{color: theme.palette.info.dark}} />,
    },

    team: {
      label: 'Team',
      value: employee.userData.team || '-',
      icon: <ManageAccountsIcon sx={{color: theme.palette.info.dark}} />,
    },
    address: {
      label: 'ADDRESS',
      value: employee.userData.address?.fullName || '-',
      icon: <HomeIcon sx={{color: theme.palette.info.dark}} />,
    },
    shiftTime: {
      label: 'SHIFT TIME',
      value:
        employee && employee.userData.workingHours?.length
          ? renderShiftTime(employee.userData.workingHours)
          : '-',
      icon: <TimerOutlinedIcon sx={{color: theme.palette.info.dark}} />,
    },
    totalYearlyVacationDaysAllowed: {
      label: 'YEARLY VACATION DAYS',
      value:
        employee &&
        employee.userData.additionalInfo?.totalYearlyVacationDaysAllowed ? (
          <Typography sx={{fontSize: '14px', lineHeight: '20px'}}>
            {employee.userData.additionalInfo?.totalYearlyVacationDaysAllowed}
          </Typography>
        ) : (
          '-'
        ),
      icon: <WbSunnyOutlinedIcon sx={{color: theme.palette.info.dark}} />,
    },
  };
};

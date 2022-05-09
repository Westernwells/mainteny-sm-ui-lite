import Box from '@mui/material/Box';
import HomeIcon from '@mui/icons-material/Home';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import EmailIcon from '@mui/icons-material/Email';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import {EmployeesView} from 'models/employee';
import {convertToText} from 'utils/utils';
import {ServiceOrderIcons} from 'components/ServiceOrderIcons';
import {ServiceOrderTypeText} from 'components/ServiceOrderTypeText';
import {theme} from 'theme';

export const employeeDetailSchema = (employee: EmployeesView) => ({
  phone: {
    label: 'PHONE NUMBER',
    value: employee.userAccount.contact.phone,
    icon: <LocalPhoneIcon sx={{color: theme.palette.info.dark}} />,
  },
  address: {
    label: 'ADDRESS',
    value: employee.address?.fullName || '-',
    icon: <HomeIcon sx={{color: theme.palette.info.dark}} />,
  },
  shiftTime: {
    // TODO: display order shift time in a tooltip
    label: 'SHIFT TIME',
    value:
      employee && employee.workingHours?.length
        ? `${convertToText(employee.workingHours[0].type)} ${
            employee.workingHours[0].fromTime
          } - ${employee.workingHours[0].toTime}`
        : '-',
    icon: <TimerOutlinedIcon sx={{color: theme.palette.info.dark}} />,
  },
  email: {
    label: 'EMAIL',
    value: employee.userAccount.contact.email,
    icon: <EmailIcon sx={{color: theme.palette.info.dark}} />,
  },
  assignedOrderTypes: {
    label: 'ASSIGNED ORDER TYPES',
    value:
      employee &&
      employee.additionalInfo &&
      employee.additionalInfo.assignedServiceOrderTypes?.length ? (
        <Box display="flex">
          {employee.additionalInfo?.assignedServiceOrderTypes?.map(
            (orderType, index) => (
              <Box display="flex" mr="0.4em" key={index}>
                <Box mr="0.4em">
                  <ServiceOrderIcons
                    serviceOrderType={orderType}
                    size="small"
                  />
                </Box>
                <Box mt="0.05em">
                  <ServiceOrderTypeText
                    variant="body2"
                    serviceOrderType={orderType}
                    capitalizeText
                  />
                </Box>
              </Box>
            ),
          )}
        </Box>
      ) : (
        '-'
      ),
    icon: <CalendarTodayIcon sx={{color: theme.palette.info.dark}} />,
  },
});

import {useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import {BasicDetailsCard} from 'components/BasicDetailsCard';

import {CardProps} from 'components/CardProps';
import useTheme from '@mui/material/styles/useTheme';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import HomeIcon from '@mui/icons-material/Home';
import EmailIcon from '@mui/icons-material/Email';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import {EmployeesView} from 'models/employee';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import {capitalize} from 'utils/utils';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

interface Props {
  employee?: EmployeesView;
}

interface BasicDetailsValue {
  label: string;
  value: string;
  icon: JSX.Element;
}

interface BasicDetails {
  phone: BasicDetailsValue;
  shiftTime: BasicDetailsValue;
  address: BasicDetailsValue;
  email: BasicDetailsValue;
  assignedOrderTypes: BasicDetailsValue;
}

export const EmployeeOverview = ({employee}: Props) => {
  const theme = useTheme();
  const [basicDetails, setBasicDetails] = useState<BasicDetails>();

  useEffect(() => {
    if (employee) {
      setBasicDetails({
        ...basicDetails,
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
          label: 'SHIFT TIME',
          value:
            employee && employee.workingHours?.length
              ? `${capitalize([employee.workingHours[0].type])} ${
                  employee.workingHours[0].fromTime
                }-${employee.workingHours[0].toTime}`
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
          value: 'Emergency',
          icon: <CalendarTodayIcon sx={{color: theme.palette.info.dark}} />,
        },
      });
    }
  }, [employee]);

  const renderBasicDetails = () => (
    <BasicDetailsCard
      minHeight="11rem"
      headerStyles={{pb: '0'}}
      containerStyles={{}}
      header="">
      <Grid container>
        <Grid item xs={2}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              height: '100%',
              width: '80%',
            }}>
            <Box
              sx={{width: '100%', display: 'flex', justifyContent: 'center'}}>
              <Box>
                <Avatar
                  alt=""
                  src=""
                  variant="circular"
                  sx={{
                    width: '80px',
                    height: '80px',
                    aspectRatio: '1',
                  }}
                />
                <Box>
                  <Typography variant="subtitle1">
                    {employee
                      ? `${employee?.userAccount.firstName}  ${employee?.userAccount.lastName}`
                      : ''}
                  </Typography>
                  <Typography variant="subtitle2" color="textSecondary">
                    {employee
                      ? `${capitalize(employee?.userAccount.roles)}`
                      : ''}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Divider
              orientation="vertical"
              sx={{background: '#F3F5F6'}}
              flexItem
            />
          </Box>
        </Grid>
        <Grid item xs={10}>
          <Box display="flex" flexWrap="wrap" mt="-1em">
            {basicDetails &&
              Object.keys(basicDetails).map((item, index) => (
                <CardProps
                  key={`${index}`}
                  label={basicDetails[item as keyof BasicDetails].label}
                  bodyTextVariant="body2"
                  icon={basicDetails[item as keyof BasicDetails].icon}
                  containerStyles={{mr: '2em', mt: '1em', width: '30%'}}
                  iconBackground={theme.palette.info.outlinedHoverBg}
                  iconMaxHeight="3rem"
                  bodyText={basicDetails[item as keyof BasicDetails].value}
                />
              ))}
          </Box>
        </Grid>
      </Grid>
      <Box display="flex" justifyContent="flex-end">
        {/* TODO: @Suraj, please update this to use an actual button */}
        <Typography>Edit</Typography>
      </Box>
    </BasicDetailsCard>
  );
  return <Box>{renderBasicDetails()}</Box>;
};

import {useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import {InfoCard} from 'components/InfoCard';
import {CardProps} from 'components/CardProps';
import useTheme from '@mui/material/styles/useTheme';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import EditIcon from '@mui/icons-material/Edit';

import {Progress} from 'components/Progress';
import {BasicDetailsValue} from 'models/misc';
import {UserView} from 'models/user';
import {EditEmployee} from './EditEmployee';
import {employeeDetailSchema} from './schema';
import EmployeeAvatar from './EmployeeAvatar';
import EmployeeAbsence from './EmployeeAbsence';
import EmployeeWorkHours from './EmployeeWorkHours';

interface Props {
  employee?: UserView;
  isLoading: boolean;
  openWorkHoursTab: () => void;
}

export const EmployeeOverview = ({
  employee,
  isLoading,
  openWorkHoursTab,
}: Props) => {
  const theme = useTheme();
  const [basicDetails, setBasicDetails] =
    useState<{[key: string]: BasicDetailsValue}>();
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    if (employee) {
      setBasicDetails(employeeDetailSchema(employee));
    }
  }, [employee]);

  if (isLoading) {
    return <Progress />;
  }

  const userData = employee?.userData;
  const userAccount = employee?.userAccount;

  const renderBasicDetails = () => (
    <Grid container columnSpacing={2} rowSpacing={2}>
      <Grid item xs={12}>
        <InfoCard
          header={
            <Typography variant="subtitle1">Basic Information</Typography>
          }
          containerStyles={{flexGrow: 1}}
          headerStyles={{mt: '0.5em'}}
          handleAction={() => setOpenDialog(true)}
          headerActionIcon={<EditIcon />}
          showHeaderBackground>
          <Grid container>
            <Grid item xs={2}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  height: '100%',
                  width: '80%',
                }}>
                <EmployeeAvatar
                  firstName={userAccount?.firstName || ''}
                  lastName={userAccount?.lastName || ''}
                  roles={userAccount?.roles || ''}
                  isOnline={userData?.isOnline || false}
                />
                <Divider
                  orientation="vertical"
                  sx={{background: '#F3F5F6'}}
                  flexItem
                />
              </Box>
            </Grid>
            <Grid item xs={10}>
              <Box display="flex" flexWrap="wrap">
                {basicDetails &&
                  Object.values(basicDetails).map((item, index) => (
                    <CardProps
                      key={index}
                      label={item.label}
                      icon={item.icon}
                      containerStyles={{mr: '2em', mt: '1em', width: '30%'}}
                      iconBackground={theme.palette.info.outlinedHoverBg}
                      iconMaxHeight="3rem"
                      bodyText={item.value}
                    />
                  ))}
              </Box>
            </Grid>
          </Grid>

          {employee && (
            <EditEmployee
              employee={employee}
              openDialog={openDialog}
              onClose={() => setOpenDialog(false)}
            />
          )}
        </InfoCard>
      </Grid>
      <EmployeeWorkHours action={openWorkHoursTab} />
      <EmployeeAbsence />
    </Grid>
  );
  return <Box>{renderBasicDetails()}</Box>;
};

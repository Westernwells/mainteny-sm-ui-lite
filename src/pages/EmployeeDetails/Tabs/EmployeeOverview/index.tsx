import {useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import {InfoCard} from 'components/InfoCard';
import {CardProps} from 'components/CardProps';
import useTheme from '@mui/material/styles/useTheme';
import {EmployeesView} from 'models/employee';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import {capitalize} from 'utils/utils';
import {Progress} from 'components/Progress';
import {BasicDetailsValue} from 'models/misc';
import {Button} from 'components/Button';
import {EditEmployee} from './EditEmployee';
import {employeeDetailSchema} from './schema';

interface Props {
  employee?: EmployeesView;
  isLoading: boolean;
}

export const EmployeeOverview = ({employee, isLoading}: Props) => {
  const theme = useTheme();
  const [basicDetails, setBasicDetails] =
    useState<{[key: string]: BasicDetailsValue}>();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    if (employee) {
      setBasicDetails(employeeDetailSchema(employee));
    }
  }, [employee]);

  if (isLoading) {
    return <Progress />;
  }

  const renderBasicDetails = () => (
    <InfoCard>
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
              sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}>
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
                <Typography variant="subtitle1" textAlign="center">
                  {employee
                    ? `${employee?.userAccount.firstName}  ${employee?.userAccount.lastName}`
                    : ''}
                </Typography>
                <Typography
                  variant="subtitle2"
                  color="textSecondary"
                  textAlign="center">
                  {employee ? `${capitalize(employee?.userAccount.roles)}` : ''}
                </Typography>
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
          <Box display="flex" flexWrap="wrap">
            {basicDetails &&
              Object.values(basicDetails).map((item, index) => (
                <CardProps
                  key={`${index}`}
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
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          color: theme.palette.info.dark,
          cursor: 'pointer',
        }}>
        <Button
          buttonProps={{
            onClick: () => setIsDrawerOpen(true),
          }}>
          <Typography variant="subtitle2">Edit</Typography>
        </Button>
      </Box>
      {employee && (
        <EditEmployee
          employee={employee}
          open={isDrawerOpen}
          setOpen={setIsDrawerOpen}
        />
      )}
    </InfoCard>
  );
  return <Box>{renderBasicDetails()}</Box>;
};

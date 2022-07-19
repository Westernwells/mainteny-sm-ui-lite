import useTheme from '@mui/material/styles/useTheme';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import ReportProblemOutlined from '@mui/icons-material/ReportProblemOutlined';
import Refresh from '@mui/icons-material/Refresh';
import {AddAnything} from './AddAnything';
import {TopCard} from './TopCard';
import {TechniciansWorking} from './TechniciansWorking';
import {AppointmentsToBeScheduled} from './AppointmentsToBeScheduled';
import {OpenQuotations} from './OpenQuotations';
import {InvoiceDrafts} from './InvoiceDrafts';
import {FieldActivities} from './FieldActivities';

export const Dashboard = () => {
  const theme = useTheme();
  return (
    <>
      <Grid container justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h3">Hi Nico Eggert!</Typography>
          <Typography variant="subtitle1" color={theme.palette.text.secondary}>
            There are{' '}
            <Typography variant="subtitle1" color="#01a0cc" component="span">
              72 orders
            </Typography>{' '}
            to be finished today
          </Typography>
        </Box>
        <AddAnything />
      </Grid>
      <Grid container py="2rem" spacing={2}>
        <Grid item xs={12} xl={9}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} lg={3}>
              <TopCard title="Completed Today" value="19/72" subValue="26%" />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <TopCard title="Monthly" value="189/1340" />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <TopCard
                title="Overdue"
                value="34"
                icon={ReportProblemOutlined}
                iconColor={theme.palette.error.main}
                iconBackgroundColor={theme.palette.error.outlinedHoverBg}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <TopCard
                title="Active units"
                value="2147"
                icon={Refresh}
                iconColor={theme.palette.secondary.dark}
                iconBackgroundColor={theme.palette.info.outlinedHoverBg}
              />
            </Grid>
            <Grid item xs={12} lg={6}>
              <TechniciansWorking />
            </Grid>
            <Grid item xs={12} lg={6}>
              <AppointmentsToBeScheduled />
            </Grid>
            <Grid item xs={12} lg={6}>
              <OpenQuotations />
            </Grid>
            <Grid item xs={12} lg={6}>
              <InvoiceDrafts />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} xl={3}>
          <FieldActivities />
        </Grid>
      </Grid>
    </>
  );
};

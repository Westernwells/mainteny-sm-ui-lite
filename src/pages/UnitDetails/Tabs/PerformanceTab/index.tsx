import useTheme from '@mui/material/styles/useTheme';
import Grid from '@mui/material/Grid';
import {StatsSection} from './StatsSection';
import {PerformanceAnalytics} from './PerformanceAnalytics';
import {UnitDetails} from './UnitDetails';
import {Battery} from './Battery';
import {CabinDoorRolls} from './CabinDoorRolls';
import {RollsShaftDoor} from './RollsShaftDoor';

export const PerformanceTab = () => {
  const theme = useTheme();

  return (
    <>
      <Grid
        container
        gap={1}
        alignItems="stretch"
        justifyContent="space-between"
        py="1rem">
        {/* Unit Detials */}
        <Grid item lg={6.8}>
          <UnitDetails />
        </Grid>
        <Grid item lg={5}>
          <StatsSection />
        </Grid>
      </Grid>

      <Grid
        container
        gap={1}
        sx={{
          justifyContent: 'space-evenly',
          alignItems: 'stretch',
          [theme.breakpoints.up('md')]: {
            justifyContent: 'space-between',
          },
        }}>
        {/* Battery section */}
        <Grid item xs={5} lg={2.8}>
          <Battery />
        </Grid>

        {/* Cabin Door Rolls (EOL) section */}
        <Grid item xs={5} lg={2.5}>
          <CabinDoorRolls />
        </Grid>

        {/* Rolls Shaft Door section */}
        <Grid item xs={5} lg={2.8}>
          <RollsShaftDoor />
        </Grid>

        {/* Performance Analytics section */}
        <Grid item xs={5} lg={3.5}>
          <PerformanceAnalytics />
        </Grid>
      </Grid>
    </>
  );
};

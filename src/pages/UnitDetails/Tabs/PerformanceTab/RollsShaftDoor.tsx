import {Grid, Typography} from '@mui/material';
import useTheme from '@mui/material/styles/useTheme';
import {InfoCard} from 'components/InfoCard';
import {LinearProgressWithLabel} from './LinearProgressWithLabel';

export const RollsShaftDoor = () => {
  const theme = useTheme();
  return (
    <InfoCard
      containerStyles={{
        height: '100%',
        [theme.breakpoints.up('md')]: {
          minHeight: '15.5rem',
        },
      }}
      header={
        <Typography variant="subtitle2" color={theme.palette.action.active}>
          Rolls Shaft Door
        </Typography>
      }
      showHeaderBackground>
      <Grid container gap={3}>
        <Grid item xs={12}>
          <Typography
            variant="body1"
            color={theme.palette.text.primary}
            pb="1.5rem">
            1. Clockwise
          </Typography>
          <LinearProgressWithLabel value={40} />
        </Grid>
        <Grid item xs={12}>
          <Typography
            variant="body1"
            color={theme.palette.text.primary}
            pb="1.5rem">
            2. Anti-clockwise
          </Typography>
          <LinearProgressWithLabel value={90} />
        </Grid>
      </Grid>
    </InfoCard>
  );
};

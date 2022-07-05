import {Grid, Typography} from '@mui/material';
import useTheme from '@mui/material/styles/useTheme';
import {InfoCard} from 'components/InfoCard';
import {CircularProgressWithLabel} from './CircularProgressWithLabel';

export const CabinDoorRolls = () => {
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
          Cabin Door Rolls (EOL)
        </Typography>
      }
      showHeaderBackground>
      <Grid container>
        <Grid
          item
          xs={12}
          display="flex"
          justifyContent="center"
          alignItems="center">
          <CircularProgressWithLabel
            value={80}
            containerStyle={{
              width: '100%',
              height: '100%',
              justifyContent: 'center',
            }}
            sx={{
              justifyContent: 'center',
              width: '60% !important',
              height: '100% !important',
              transform: 'rotate(-145deg) !important',
            }}
          />
        </Grid>
      </Grid>
    </InfoCard>
  );
};

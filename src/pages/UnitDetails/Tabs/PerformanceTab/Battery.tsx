import {Grid, Typography} from '@mui/material';
import useTheme from '@mui/material/styles/useTheme';
import {InfoCard} from 'components/InfoCard';
import {useTranslation} from 'react-i18next';
import {LinearProgressWithLabel} from './LinearProgressWithLabel';

export const Battery = () => {
  const {t} = useTranslation();
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
          {t('Battery')}
        </Typography>
      }
      showHeaderBackground>
      <Grid container gap={3}>
        <Grid item xs={12}>
          <Typography
            variant="body1"
            color={theme.palette.text.primary}
            pb="1.5rem">
            {t('Cell Health')}
          </Typography>
          <LinearProgressWithLabel value={20} />
        </Grid>
        <Grid item xs={12}>
          <Typography
            variant="body1"
            color={theme.palette.text.primary}
            pb="1.5rem">
            {t('Emergency Battery Level')}
          </Typography>
          <LinearProgressWithLabel value={70} />
        </Grid>
      </Grid>
    </InfoCard>
  );
};

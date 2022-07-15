import {
  Cached,
  DoorSliding,
  Equalizer,
  EventAvailable,
  Flourescent,
  Forward10,
  History,
  PermContactCalendar,
} from '@mui/icons-material';
import {Divider, Grid, Typography} from '@mui/material';
import useTheme from '@mui/material/styles/useTheme';
import {CardProps} from 'components/CardProps';
import {InfoCard} from 'components/InfoCard';
import {StatusChip} from 'components/StatusChip';
import {addDays} from 'date-fns';
import {useFormatDate} from 'hooks/useFormatDate';
import {useTranslation} from 'react-i18next';

export const UnitDetails = () => {
  const formatDate = useFormatDate();
  const theme = useTheme();
  const {t} = useTranslation();

  return (
    <InfoCard
      containerStyles={{
        [theme.breakpoints.up('md')]: {
          minHeight: '24.5rem',
          height: '100%',
        },
      }}
      header={
        <Typography variant="subtitle2" color={theme.palette.action.active}>
          {t('Unit Details')}
        </Typography>
      }
      showHeaderBackground>
      <Grid
        container
        justifyContent="space-between"
        alignItems="center"
        spacing={4}>
        <Grid item xs={4}>
          <StatusChip label="Running" color="success" size="medium" />
        </Grid>
        <Grid item xs={4}>
          <CardProps
            icon={<PermContactCalendar sx={{color: theme.palette.info.dark}} />}
            label="LAST VISIT"
            bodyText={formatDate(addDays(new Date(), -3))}
            iconBackground={theme.palette.info.outlinedHoverBg}
            containerStyles={{mt: '0.5em'}}
            iconMaxHeight="3rem"
          />
        </Grid>
        <Grid item xs={4}>
          <CardProps
            icon={<Cached sx={{color: theme.palette.info.dark}} />}
            label="LAST INSPECTION"
            bodyText={formatDate(addDays(new Date(), -1))}
            iconBackground={theme.palette.info.outlinedHoverBg}
            containerStyles={{mt: '0.5em'}}
            iconMaxHeight="3rem"
          />
        </Grid>
        <Grid item xs={12}>
          <Divider color={theme.palette.primary.outlinedHoverBg} />
        </Grid>
        <Grid item xs={4}>
          <CardProps
            icon={<EventAvailable sx={{color: theme.palette.info.dark}} />}
            label="Ø AVAILABILITY"
            bodyText="98%"
            bodyTextVariant="body1"
            iconBackground={theme.palette.info.outlinedHoverBg}
            containerStyles={{mt: '0.5em'}}
            iconMaxHeight="3rem"
          />
        </Grid>
        <Grid item xs={4}>
          <CardProps
            icon={<Forward10 sx={{color: theme.palette.info.dark}} />}
            label="Ø RUNTIME/DAY"
            bodyText="1:04 h"
            bodyTextVariant="body1"
            iconBackground={theme.palette.info.outlinedHoverBg}
            containerStyles={{mt: '0.5em'}}
            iconMaxHeight="3rem"
          />
        </Grid>
        <Grid item xs={4}>
          <CardProps
            icon={<History sx={{color: theme.palette.info.dark}} />}
            label="Ø RUNS/DAY"
            bodyText="68382411"
            bodyTextVariant="body1"
            iconBackground={theme.palette.info.outlinedHoverBg}
            containerStyles={{mt: '0.5em'}}
            iconMaxHeight="3rem"
          />
        </Grid>
        <Grid item xs={4}>
          <CardProps
            icon={<DoorSliding sx={{color: theme.palette.info.dark}} />}
            label="Ø DOOR OPENS/DAY"
            bodyText="101"
            bodyTextVariant="body1"
            iconBackground={theme.palette.info.outlinedHoverBg}
            containerStyles={{mt: '0.5em'}}
            iconMaxHeight="3rem"
          />
        </Grid>
        <Grid item xs={4}>
          <CardProps
            icon={<Flourescent sx={{color: theme.palette.info.dark}} />}
            label="CURRENT FLOOR"
            bodyText="4"
            bodyTextVariant="body1"
            iconBackground={theme.palette.info.outlinedHoverBg}
            containerStyles={{mt: '0.5em'}}
            iconMaxHeight="3rem"
          />
        </Grid>
        <Grid item xs={4}>
          <CardProps
            icon={<Equalizer sx={{color: theme.palette.info.dark}} />}
            label="Ø AIR QUALITY"
            bodyText="92%"
            bodyTextVariant="body1"
            iconBackground={theme.palette.info.outlinedHoverBg}
            containerStyles={{mt: '0.5em'}}
            iconMaxHeight="3rem"
          />
        </Grid>
      </Grid>
    </InfoCard>
  );
};

import {useCallback} from 'react';
import {InfiniteData} from 'react-query';
import {useTranslation} from 'react-i18next';
import {format} from 'date-fns';
import {uniq} from 'lodash';
import {Link as RouterLink} from 'react-router-dom';
import useTheme from '@mui/material/styles/useTheme';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import {Engineering, LocationOn, Tag} from '@mui/icons-material';
import {IdStateType, Resource, State} from 'models/misc';
import {ServiceCompanyActivity} from 'models/service-company';
import {ServiceOrder} from 'models/service-order';
import {InfoCard} from 'components/InfoCard';
import {CardProps} from 'components/CardProps';
import {useEntitiesStates} from 'hooks/reactQuery/useEntity';
import {getFieldActivityColor, getFieldActivityTitle} from 'utils/dashboard';
import {FieldActivitiesSkeleton} from './FieldActivitiesSkeleton';

const iconContainerStyles = {
  mr: '0.5rem',
  borderRadius: '0.25rem',
  width: '2.5rem',
  height: '2.5rem',
  alignItems: 'center',
};

export const FieldActivities = ({
  activities,
  inViewRef,
  isFetchingNextActivitiesPage,
}: {
  activities: InfiniteData<Resource<ServiceCompanyActivity<ServiceOrder>>>;
  inViewRef: (node?: Element | null | undefined) => void;
  isFetchingNextActivitiesPage: boolean;
}) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const {data: entitiesStates} = useEntitiesStates({
    // making ids array unique to avoid duplicated api calls and use cache
    id: uniq(
      activities.pages
        .map((page) => page.data.map((activity) => activity.data.elevator.id))
        .flat(),
    ),
    type: IdStateType.ELEVATOR,
  });
  const isElevatorDeleted = useCallback(
    (elevatorId: string) =>
      entitiesStates?.find((entityState) => entityState.id === elevatorId)
        ?.state === State.DELETED,
    [entitiesStates],
  );

  return (
    <InfoCard
      containerStyles={{
        height: '100%',
        [theme.breakpoints.up('md')]: {
          minHeight: '19.125rem',
        },
      }}
      bodyContainerStyle={{
        paddingBottom: '0px !important',
        maxHeight: '45rem',
        overflowY: 'auto',
      }}
      header={
        <Typography variant="subtitle1">{t('Field Activities')}</Typography>
      }
      headerStyles={{
        py: '0.25rem',
        px: '0.5rem',
      }}
      showHeaderBackground>
      <Timeline sx={{padding: 0, marginTop: 0}}>
        {activities.pages.map((page) =>
          page.data.map((activity) => {
            const technician =
              activity.data.schedules?.[0]?.technician.userAccount;
            const technicianName = technician
              ? `${technician.firstName ?? ''} ${technician.lastName ?? ''}`
              : '-';
            return (
              <TimelineItem
                ref={inViewRef}
                key={activity.id}
                sx={{
                  '::before': {
                    display: 'none',
                  },
                }}>
                <TimelineSeparator>
                  <TimelineDot
                    sx={{
                      bgcolor: getFieldActivityColor(activity.type),
                      boxShadow: 'none',
                    }}
                  />
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent>
                  <Typography variant="body1" display="inline">
                    {t(getFieldActivityTitle(activity.type))}
                  </Typography>
                  <Typography
                    variant="caption"
                    display="inline"
                    pl="8px"
                    color="text.secondary">
                    {format(new Date(activity.createdAt), 'dd.MM.yyyy, HH:mm')}h
                  </Typography>
                  <Grid container spacing={2} pt="0.75rem">
                    <Grid item xs={6}>
                      <CardProps
                        icon={<Tag sx={{color: theme.palette.info.dark}} />}
                        label={t('JOB ID')}
                        bodyText={activity.data.number}
                        iconBackground={theme.palette.info.outlinedHoverBg}
                        iconContainerStyles={iconContainerStyles}
                        iconMaxHeight="3rem"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <CardProps
                        icon={
                          <Engineering sx={{color: theme.palette.info.dark}} />
                        }
                        label={t('TECHNICIAN')}
                        bodyText={technicianName}
                        iconBackground={theme.palette.info.outlinedHoverBg}
                        iconContainerStyles={iconContainerStyles}
                        iconMaxHeight="3rem"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <CardProps
                        icon={
                          <LocationOn sx={{color: theme.palette.info.dark}} />
                        }
                        label={t('UNIT ADDRESS')}
                        bodyText={
                          isElevatorDeleted(activity.data.elevator.id) ? (
                            <Typography variant="body2">
                              {activity.data.elevator.address.fullName}
                            </Typography>
                          ) : (
                            <Link
                              component={RouterLink}
                              to={`/units/details/${activity.data.elevator.id}`}
                              underline="hover"
                              variant="body2"
                              color={theme.palette.info.dark}>
                              {activity.data.elevator.address.fullName}
                            </Link>
                          )
                        }
                        iconBackground={theme.palette.info.outlinedHoverBg}
                        iconContainerStyles={iconContainerStyles}
                        iconMaxHeight="3rem"
                      />
                    </Grid>
                  </Grid>
                </TimelineContent>
              </TimelineItem>
            );
          }),
        )}
        {isFetchingNextActivitiesPage && <FieldActivitiesSkeleton length={1} />}
      </Timeline>
    </InfoCard>
  );
};

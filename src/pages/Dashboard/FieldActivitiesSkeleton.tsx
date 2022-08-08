import Skeleton from '@mui/material/Skeleton';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';

export const FieldActivitiesSkeleton = ({length = 10}: {length?: number}) => (
  <>
    {Array(length)
      .fill(0)
      .map((_, index) => (
        <TimelineItem
          key={index}
          sx={{
            '::before': {
              display: 'none',
            },
          }}>
          <TimelineSeparator>
            <TimelineDot
              sx={{
                boxShadow: 'none',
              }}
            />
            <TimelineConnector />
          </TimelineSeparator>
          <TimelineContent>
            <Typography variant="body1" display="inline">
              <Skeleton variant="text" width="12rem" height={21} />
            </Typography>
            <Grid container spacing={2} pt="0.75rem">
              <Grid item xs={6}>
                <Skeleton variant="rectangular" width="7.5rem" height={60} />
              </Grid>
              <Grid item xs={6}>
                <Skeleton variant="rectangular" width="7.5rem" height={60} />
              </Grid>
              <Grid item xs={12}>
                <Skeleton variant="rectangular" width="80%" height={60} />
              </Grid>
            </Grid>
          </TimelineContent>
        </TimelineItem>
      ))}
  </>
);

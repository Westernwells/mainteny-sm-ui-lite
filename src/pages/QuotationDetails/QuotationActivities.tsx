import {useTranslation} from 'react-i18next';
import {format} from 'date-fns';
import useTheme from '@mui/material/styles/useTheme';
import Typography from '@mui/material/Typography';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import {QuotationActivityView} from 'models/quotation';
import {InfoCard} from 'components/InfoCard';
import {getQuotationActivityTitle} from 'utils/quotation';

export const QuotationActivities = ({
  activities,
}: {
  activities: QuotationActivityView[];
}) => {
  const {t} = useTranslation();
  const theme = useTheme();

  return (
    <InfoCard
      bodyContainerStyle={{
        paddingBottom: '0px !important',
        overflowY: 'auto',
      }}
      header={
        <Typography variant="subtitle1">{t('Quotation history')}</Typography>
      }
      headerStyles={{
        py: '0.25rem',
        px: '0.5rem',
      }}
      showHeaderBackground>
      <Timeline sx={{padding: 0, marginTop: 0}}>
        {activities.map((activity) => (
          <TimelineItem
            key={activity.id}
            sx={{
              '::before': {
                display: 'none',
              },
            }}>
            <TimelineSeparator>
              <TimelineDot
                sx={{
                  bgcolor: theme.palette.grey[400],
                  boxShadow: 'none',
                }}
              />
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              <Typography variant="subtitle1">
                {t(getQuotationActivityTitle(activity.type))}
              </Typography>
              <Typography variant="subtitle2">
                {format(
                  new Date(activity.meta.createdAt),
                  'dd.MM.yyyy - HH:mm',
                )}
                h
              </Typography>
              <Typography variant="subtitle2">{activity.text}</Typography>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </InfoCard>
  );
};

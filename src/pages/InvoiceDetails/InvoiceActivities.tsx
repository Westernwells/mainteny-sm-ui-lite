import {useTranslation} from 'react-i18next';
import {format} from 'date-fns';
import Typography from '@mui/material/Typography';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import {InvoiceActivityView} from 'models/invoice';
import {InfoCard} from 'components/InfoCard';
import {getInvoiceActivityColor, getInvoiceActivityTitle} from 'utils/invoice';

export const InvoiceActivities = ({
  activities,
}: {
  activities: InvoiceActivityView[];
}) => {
  const {t} = useTranslation();

  return (
    <InfoCard
      bodyContainerStyle={{
        paddingBottom: '0px !important',
        overflowY: 'auto',
      }}
      header={
        <Typography variant="subtitle1">{t('Invoice history')}</Typography>
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
                  bgcolor: getInvoiceActivityColor(activity.type),
                  boxShadow: 'none',
                }}
              />
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              <Typography variant="subtitle1">
                {getInvoiceActivityTitle(activity.type)}
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

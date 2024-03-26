import {useMemo} from 'react';
import {Link as RouterLink, useParams} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {format} from 'date-fns';
import {theme} from 'theme';
import Typography from '@mui/material/Typography';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import Link from '@mui/material/Link';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {
  InvoiceActivityOverdueNoticeSentData,
  InvoiceActivityType,
  InvoiceActivityView,
  InvoiceView,
  MyInvoiceActivityView,
  Payment,
} from 'models/invoice';
import {
  getInvoiceActivityDescription,
  getInvoiceActivityTitle,
} from 'utils/invoice';
import {PageCard} from 'components/PageCard';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';

export const InvoiceActivities = ({
  activities,
  invoice,
}: {
  activities: InvoiceActivityView[];
  invoice: InvoiceView;
}) => {
  const {id: invoiceId} = useParams();
  const {t} = useTranslation();

  const activitiesWithOverdueNoticeCount = useMemo(() => {
    let overdueNoticeCount = 0;

    return activities.map((item) => {
      if (item.type === InvoiceActivityType.OVERDUE_NOTICE_SENT) {
        const data = JSON.parse(
          item.data,
        ) as InvoiceActivityOverdueNoticeSentData;
        overdueNoticeCount += 1;
        return {
          ...item,
          overdueNoticeId: data.overdueNoticeId,
          count: overdueNoticeCount,
        };
      }
      if (item.type === InvoiceActivityType.PAYMENT_RECEIVED) {
        const data = JSON.parse(item.data) as Payment;
        return {
          ...item,
          amount: data?.amount,
        };
      }
      return item;
    });
  }, [activities]);

  return (
    <PageCard
      headerLabel={t('Invoice history')}
      headerIcon={<HistoryOutlinedIcon sx={{color: '#8F9BB380'}} />}
      headerStyles={{
        py: '0.25rem',
        px: '0.5rem',
      }}>
      <Timeline sx={{padding: 0, marginTop: 0}}>
        {activitiesWithOverdueNoticeCount.map((activity) => (
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
                  bgcolor: 'white',
                  borderColor: '#BDBDBD',
                  boxShadow: 'none',
                }}
              />
              <TimelineConnector sx={{background: '#BDBDBD'}} />
            </TimelineSeparator>
            <TimelineContent sx={{marginTop: '-0.5em'}}>
              {activity.type === InvoiceActivityType.OVERDUE_NOTICE_SENT &&
              (activity as MyInvoiceActivityView).overdueNoticeId ? (
                <Link
                  component={RouterLink}
                  to={`/invoices/${invoiceId}/overdue-notice?overdueNoticeId=${
                    (activity as MyInvoiceActivityView).overdueNoticeId
                  }`}
                  underline="always"
                  variant="subtitle1"
                  target="_blank"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    color: theme.palette.text.primary,
                  }}>
                  {t(getInvoiceActivityTitle(activity.type))} {' - '}
                  {(activity as MyInvoiceActivityView).count}
                  <OpenInNewIcon
                    fontSize="small"
                    sx={{color: theme.palette.text.secondary}}
                  />
                </Link>
              ) : (
                <Typography variant="subtitle1">
                  {t(
                    getInvoiceActivityTitle(
                      activity.type,
                      activity as MyInvoiceActivityView,
                    ),
                  )}
                </Typography>
              )}

              <Typography
                variant="caption"
                sx={{color: 'text.secondary', fontSize: '0.9rem'}}>
                {format(
                  new Date(activity.meta.createdAt),
                  'dd.MM.yyyy | HH:mm',
                )}
              </Typography>
              <Typography variant="subtitle2">
                {getInvoiceActivityDescription(activity, invoice)}
              </Typography>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </PageCard>
  );
};

import {useTranslation} from 'react-i18next';
import useTheme from '@mui/material/styles/useTheme';
import Typography from '@mui/material/Typography';
import {InfoCard} from 'components/InfoCard';

export const FieldActivities = () => {
  const {t} = useTranslation();
  const theme = useTheme();
  const activities = [
    {
      id: 'random1',
      serviceCompanyId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      description: 'somde desx',
      type: 'SERVICE_ORDER_COMPLETED',
      data: 'string',
      requestId: 'string',
      createdAt: '2022-07-18T07:19:29.494Z',
    },
    {
      id: 'random2',
      serviceCompanyId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      description: 'somde desx',
      type: 'SERVICE_ORDER_SCHEDULED',
      data: 'string',
      requestId: 'string',
      createdAt: '2022-07-18T07:19:29.494Z',
    },
    {
      id: 'random8',
      serviceCompanyId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      description: 'somde desx',
      type: 'SERVICE_ORDER_TIME_EDITED',
      data: 'string',
      requestId: 'string',
      createdAt: '2022-07-18T07:19:29.494Z',
    },
    {
      id: 'random4',
      serviceCompanyId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      description: 'somde desx',
      type: 'SERVICE_ORDER_STARTED',
      data: 'string',
      requestId: 'string',
      createdAt: '2022-07-18T07:19:29.494Z',
    },
    {
      id: 'random5',
      serviceCompanyId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      description: 'somde desx',
      type: 'SERVICE_ORDER_UNSCHEDULED',
      data: 'string',
      requestId: 'string',
      createdAt: '2022-07-18T07:19:29.494Z',
    },
    {
      id: 'random6',
      serviceCompanyId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      description: 'somde desx',
      type: 'SERVICE_ORDER_UPDATED',
      data: 'string',
      requestId: 'string',
      createdAt: '2022-07-18T07:19:29.494Z',
    },
    {
      id: 'random3',
      serviceCompanyId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      description: 'somde desx',
      type: 'SERVICE_ORDER_CANCELLED',
      data: 'string',
      requestId: 'string',
      createdAt: '2022-07-18T07:19:29.494Z',
    },
    {
      id: 'random7',
      serviceCompanyId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      description: 'somde desx',
      type: 'SERVICE_ORDER_EXPIRED',
      data: 'string',
      requestId: 'string',
      createdAt: '2022-07-18T07:19:29.494Z',
    },
  ];
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
      {activities.map((activity) => (
        <pre key={activity.id}>{JSON.stringify(activity, null, 2)}</pre>
      ))}
      {/* <List disablePadding>
        {invoices.map((invoice) => (
          <ListItem
            key={invoice.id}
            sx={{py: '6px', px: '1.5rem'}}
            secondaryAction={
              <Chip
                label={invoice.status}
                size="small"
                sx={{
                  px: '0.28rem',
                  textTransform: 'capitalize',
                  color: '#fff',
                  bgcolor: theme.palette.eden.light,
                }}
              />
            }>
            <ListItemAvatar>
              <Avatar sx={{width: 28, height: 28, fontSize: '1rem'}}>
                {nameToInitials(invoice.company)}
              </Avatar>
            </ListItemAvatar>
            <ListItemText sx={{flexBasis: '25%'}}>
              {invoice.company}
            </ListItemText>
            <ListItemText>{invoice.total}</ListItemText>
          </ListItem>
        ))}
      </List> */}
    </InfoCard>
  );
};

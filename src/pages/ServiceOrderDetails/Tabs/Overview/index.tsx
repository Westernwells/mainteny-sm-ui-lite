import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import {
  useServiceOrderActivities,
  useServiceOrderDetails,
} from 'hooks/reactQuery/useServiceOrder';
import {Progress} from 'components/Progress';
import {PageCard} from 'components/PageCard';

import useTheme from '@mui/material/styles/useTheme';
import {Timeline} from 'components/Timeline';
import Typography from '@mui/material/Typography';
import ComputerIcon from '@mui/icons-material/Computer';
import PersonIcon from '@mui/icons-material/Person';
import {olStyles} from 'styles';
import {useFormatDate} from 'hooks/useFormatDate';
import {OrderInfoCard} from './OrderInfoCard';
import {Quotation} from './Quotations';
import {Invoices} from './Invoices';
import {Articles} from './Articles';
import {Description} from './Description';

interface Props {
  orderId?: string;
}

export const Overview = ({orderId}: Props) => {
  const theme = useTheme();
  const formatDate = useFormatDate();
  const {data: serviceOrderDetails, isLoading} =
    useServiceOrderDetails(orderId);
  const {data: serviceOrderActivities = []} =
    useServiceOrderActivities(orderId);

  const iconType = (icon: string) => {
    switch (icon) {
      case 'system':
        return <ComputerIcon fontSize="small" color="action" />;
      case 'people':
        return <PersonIcon fontSize="small" color="action" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return <Progress />;
  }

  return (
    <Grid
      container
      spacing={2}
      sx={{
        height: '100%',
      }}>
      <Grid
        item
        sm={12}
        md={8}
        sx={{
          [theme.breakpoints.up('md')]: {
            height: '100%',
          },
        }}>
        <Box
          sx={{
            ...olStyles.scrollbar,
            height: '100%',
            overflowY: 'scroll',
            display: 'flex',
            flexDirection: 'column',
          }}>
          <Box>
            <OrderInfoCard serviceOrderDetails={serviceOrderDetails!} />
          </Box>
          <Box mt="1em" flexGrow={1}>
            <Description
              content={serviceOrderDetails?.description}
              serviceOrderId={serviceOrderDetails?.id}
            />
          </Box>

          <Box mt="1em" flexGrow={1}>
            <Articles
              serviceOrderArticles={serviceOrderDetails?.articles}
              serviceOrderId={serviceOrderDetails?.id}
            />
          </Box>

          <Box mt="1em" flexGrow={1}>
            <Invoices serviceOrderId={serviceOrderDetails?.id} />
          </Box>

          <Box mt="1em" flexGrow={1}>
            <Quotation serviceOrder={serviceOrderDetails} />
          </Box>
        </Box>
      </Grid>

      <Grid
        item
        sm={12}
        md={4}
        sx={{
          [theme.breakpoints.up('md')]: {
            height: '100%',
          },
          width: '100%',
        }}>
        <PageCard
          headerLabel="Timeline"
          headerStyles={{pl: '0.3em'}}
          containerStyles={{
            ...olStyles.scrollbar,
            height: '100%',
            overflowY: 'scroll',
          }}>
          <Box sx={{height: '100%'}}>
            {serviceOrderActivities.map((activity, index) => {
              const dateString = new Date(activity.actionTime);
              const date = formatDate(dateString);
              const time = formatDate(dateString, 'HH:mm');
              return (
                <Timeline
                  key={index}
                  value={serviceOrderActivities.length - index}
                  hideLeftBorder={
                    !!(index === serviceOrderActivities.length - 1)
                  }
                  containerStyle={{pt: index > 0 ? '1em' : 'initial'}}
                  header={`${date} (${time})`}
                  body={activity.description}
                  footer={
                    <Typography component="div" display="flex">
                      {iconType(activity.userAccount ? 'people' : 'system')}
                      <Typography variant="caption" component="div" ml="0.5em">
                        {activity.userAccount
                          ? `${activity.userAccount.firstName} ${activity.userAccount.lastName}`
                          : 'System'}
                      </Typography>
                    </Typography>
                  }
                />
              );
            })}
          </Box>
        </PageCard>
      </Grid>
    </Grid>
  );
};

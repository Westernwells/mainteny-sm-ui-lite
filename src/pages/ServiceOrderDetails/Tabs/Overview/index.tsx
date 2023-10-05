import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import {
  useServiceOrderActivities,
  useServiceOrderArticles,
} from 'hooks/reactQuery/useServiceOrder';
import {PageCard} from 'components/PageCard';

import useTheme from '@mui/material/styles/useTheme';
import {Timeline} from 'components/Timeline';
import Typography from '@mui/material/Typography';
import ComputerIcon from '@mui/icons-material/Computer';
import PersonIcon from '@mui/icons-material/Person';
import {olStyles} from 'styles';
import {useFormatDate} from 'hooks/useFormatDate';
import {ServiceOrderView} from 'models/service-order';
import {OrderInfoCard} from './OrderInfoCard';
import {Quotation} from './Quotations';
import {Invoices} from './Invoices';
import {Articles} from './Articles';
import {Description} from './Description';

interface Props {
  serviceOrder: ServiceOrderView;
}

export const serviceOrderActivitiesLang: {[key: string]: string} = {
  EN: 'EN_US',
  DE: 'DE_DE',
};

export const Overview = ({serviceOrder}: Props) => {
  const theme = useTheme();

  const formatDate = useFormatDate();
  const {data: serviceOrderActivities = []} = useServiceOrderActivities(
    serviceOrder.id,
  );
  const {data: serviceOrderArticles} = useServiceOrderArticles(serviceOrder.id);

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
            <OrderInfoCard serviceOrderDetails={serviceOrder!} />
          </Box>
          <Box mt="1em" flexGrow={1}>
            <Description
              content={serviceOrder?.description}
              serviceOrderId={serviceOrder?.id}
            />
          </Box>

          <Box mt="1em" flexGrow={1}>
            <Articles
              serviceOrderArticles={serviceOrderArticles}
              serviceOrderId={serviceOrder?.id}
            />
          </Box>

          <Box mt="1em" flexGrow={1}>
            <Invoices serviceOrderId={serviceOrder?.id} />
          </Box>

          <Box mt="1em" flexGrow={1}>
            <Quotation serviceOrder={serviceOrder} />
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
                      {iconType(activity.creator ? 'people' : 'system')}
                      <Typography variant="caption" component="div" ml="0.5em">
                        {activity.creator
                          ? `${activity.creator.firstName} ${activity.creator.lastName}`
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

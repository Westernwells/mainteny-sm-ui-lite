import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import {
  useServiceOrderActivities,
  useServiceOrderArticles,
} from 'hooks/reactQuery/useServiceOrder';
import useTheme from '@mui/material/styles/useTheme';
import {Timeline} from 'components/Timeline';
import Typography from '@mui/material/Typography';
import {olStyles} from 'styles';
import {useFormatDate} from 'hooks/useFormatDate';
import {ServiceOrderView} from 'models/service-order';
import {InfoCard} from 'components/InfoCard';
import {useTranslation} from 'react-i18next';
import {useEffect} from 'react';
import ContactsWidget from 'pages/Contacts/ContactsWidget';
import {ContactPersonAssociationType} from 'models/contacts';
import {OrderInfoCard} from './OrderInfoCard';
import {Quotation} from './Quotations';
import {Invoices} from './Invoices';
import {Articles} from './Articles';
import {Description} from './Description';
import {Attachment} from './Attachment';

interface Props {
  serviceOrder: ServiceOrderView;
}

export const serviceOrderActivitiesLang: {[key: string]: string} = {
  EN: 'EN_US',
  DE: 'DE_DE',
};

export const Overview = ({serviceOrder}: Props) => {
  const theme = useTheme();
  const {t} = useTranslation();

  const formatDate = useFormatDate();
  const {data: serviceOrderActivities = [], refetch} =
    useServiceOrderActivities(serviceOrder.id);

  const {data: serviceOrderArticles} = useServiceOrderArticles(serviceOrder.id);

  useEffect(() => {
    if (serviceOrder.id) {
      refetch();
    }
  }, [serviceOrder]);

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
        md={9}
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
            <Articles
              serviceOrderArticles={serviceOrderArticles}
              serviceOrderId={serviceOrder?.id}
            />
          </Box>

          <Box mt="1em" flexGrow={1}>
            <Invoices
              serviceOrderId={serviceOrder.id}
              paymentStatus={serviceOrder.additionalInfo?.paymentStatus!}
            />
          </Box>

          <Box mt="1em" flexGrow={1}>
            <Quotation serviceOrder={serviceOrder} />
          </Box>

          <Box mt="1em" flexGrow={1}>
            <Description
              content={serviceOrder?.description}
              serviceOrderId={serviceOrder?.id}
            />
          </Box>
          <Box mt="1em" flexGrow={1}>
            <Attachment order={serviceOrder} />
          </Box>
          <Box mt="1em" flexGrow={1}>
            <ContactsWidget
              refId={serviceOrder?.id}
              refType={ContactPersonAssociationType.SERVICE_ORDER}
            />
          </Box>
        </Box>
      </Grid>

      <Grid
        item
        sm={12}
        md={3}
        sx={{
          [theme.breakpoints.up('md')]: {
            height: '100%',
          },
          width: '100%',
        }}>
        <InfoCard
          header={<Typography variant="subtitle1">{t('Timeline')}</Typography>}
          showHeaderBackground
          containerStyles={{
            ...olStyles.scrollbar,
            height: '100%',
            overflowY: 'scroll',
          }}
          headerStyles={{pl: '0.3em'}}>
          <Box sx={{height: '100%', paddingLeft: '0.5em'}}>
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
                  header={activity.description}
                  body={`${date} | ${time}`}
                />
              );
            })}
          </Box>
        </InfoCard>
      </Grid>
    </Grid>
  );
};

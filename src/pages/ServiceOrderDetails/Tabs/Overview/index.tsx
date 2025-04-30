import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import {useServiceOrderActivities} from 'hooks/reactQuery/useServiceOrder';
import useTheme from '@mui/material/styles/useTheme';
import {Timeline} from 'components/Timeline';
import Typography from '@mui/material/Typography';
import {olStyles} from 'styles';
import {useFormatDate} from 'hooks/useFormatDate';
import {ServiceOrderView} from 'models/service-order';
import {InfoCard} from 'components/InfoCard';
import {useTranslation} from 'react-i18next';
import {useState} from 'react';
import ContactsWidget from 'pages/Contacts/ContactsWidget';
import {ContactPersonAssociationType} from 'models/contacts';
import {JobOverviewBottomDrawer} from 'components/JobOverviewBottomDrawer';
import {ScheduleDialog} from 'pages/ServiceOrderDetails/Tabs/Overview/ScheduleDialog';
import {getDefaultTechnician, getDialogTitle} from 'utils/service-order-utils';
import {OrderInfoCard} from './OrderInfoCard';
import {Quotation} from './Quotations';
import {Invoices} from './Invoices';
import {Description} from './Description';
import {Attachment} from './Attachment';
import {AppointmentPreferences} from './AppointmentPreferences';
import {JobNotes} from './JobNotes';
import ServiceOrderPositions from './ServiceOrderPositions';

interface Props {
  serviceOrder: ServiceOrderView;
}

export const Overview = ({serviceOrder}: Props) => {
  const theme = useTheme();
  const {t} = useTranslation();
  const [openDialog, setOpenDialog] = useState(false);

  const formatDate = useFormatDate();
  const {data: serviceOrderActivities = []} = useServiceOrderActivities(
    serviceOrder?.id,
  );

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
            <OrderInfoCard
              serviceOrderDetails={serviceOrder!}
              onOpenRescheduleDialog={setOpenDialog}
            />
          </Box>

          <Box mt="1em" flexGrow={1}>
            <AppointmentPreferences order={serviceOrder} />
          </Box>

          <Box mt="1em" flexGrow={1}>
            <ServiceOrderPositions serviceOrder={serviceOrder} />
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
            <JobNotes order={serviceOrder} />
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

      <JobOverviewBottomDrawer
        serviceOrderDetails={serviceOrder}
        onOpenRescheduleDialog={setOpenDialog}
      />

      {openDialog && (
        <ScheduleDialog
          serviceOrderId={serviceOrder.id}
          serviceOrderType={serviceOrder.type}
          title={t(getDialogTitle(serviceOrder))}
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          defaultTechnicians={getDefaultTechnician(serviceOrder)}
          defaultStartDate={
            serviceOrder.schedules.length
              ? new Date(serviceOrder.schedules[0].startTime)
              : null
          }
          defaultEndDate={
            serviceOrder.schedules.length
              ? new Date(serviceOrder.schedules[0].endTime)
              : null
          }
          defaultDueDate={
            serviceOrder.dueDate ? new Date(serviceOrder.dueDate) : null
          }
          defaultCallTime={
            serviceOrder.additionalInfo?.callerInfo?.calledAt
              ? new Date(serviceOrder.additionalInfo.callerInfo.calledAt)
              : null
          }
          defaultCallerName={serviceOrder.additionalInfo?.callerInfo?.name}
          defaultPurchaseOrderNumber={
            serviceOrder.additionalInfo.purchaseOrderNumber
          }
          defaultCallerPhoneNumber={
            serviceOrder.additionalInfo?.callerInfo?.phoneNumber
          }
        />
      )}
    </Grid>
  );
};

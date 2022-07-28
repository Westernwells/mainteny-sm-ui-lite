import {useEffect} from 'react';
import {useInView} from 'react-intersection-observer';
import {addDays, endOfToday, startOfDay} from 'date-fns';
import useTheme from '@mui/material/styles/useTheme';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import ReportProblemOutlined from '@mui/icons-material/ReportProblemOutlined';
import Refresh from '@mui/icons-material/Refresh';
import {Progress} from 'components/Progress';
import {
  useAppointmentConfirmationRequiredOrders,
  useAppointmentNotification,
  useConfirmAppointment,
} from 'hooks/reactQuery/useServiceOrder';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {useQuotations} from 'hooks/reactQuery/useQuotation';
import {useInvoices} from 'hooks/reactQuery/useInvoice';
import {useQueryServiceCompanyEmployeeStatus} from 'hooks/reactQuery/useEmployee';
import {useServiceCompanyActivities} from 'hooks/reactQuery/useCompanies';
import {createEmptyResource} from 'utils/paging-utils';
import {toRestDate} from 'utils/datetime';
import {Role} from 'models/user';
import {ServiceOrderView} from 'models/service-order';
import {QuotationStatus, QuotationView} from 'models/quotation';
import {InvoiceStatus, InvoiceView} from 'models/invoice';
import {EmployeeStatusView} from 'models/employee';
import {ActivityMessageType} from 'models/service-company';
import {AddAnything} from './AddAnything';
import {TopCard} from './TopCard';
import {TechniciansWorking} from './TechniciansWorking';
import {AppointmentsToBeScheduled} from './AppointmentsToBeScheduled';
import {OpenQuotations} from './OpenQuotations';
import {InvoiceDrafts} from './InvoiceDrafts';
import {FieldActivities} from './FieldActivities';

export const Dashboard = () => {
  const theme = useTheme();
  const {ref, inView} = useInView();
  const {user} = useUserSession();
  const fullName = `${user?.userAccount.firstName} ${user?.userAccount.lastName}`;
  const {
    data: appointments = createEmptyResource<ServiceOrderView>(3),
    isLoading: isLoadingAppointments,
  } = useAppointmentConfirmationRequiredOrders({
    pageIndex: 0,
    pageSize: 3,
  });
  const appointmentNotificationMutation = useAppointmentNotification();
  const confirmAppointmentMutation = useConfirmAppointment();
  const {
    data: quotations = createEmptyResource<QuotationView>(5),
    isLoading: isLoadingQuotations,
  } = useQuotations(
    {
      pageIndex: 0,
      pageSize: 5,
      query: '',
      status: [QuotationStatus.SENT_TO_CLIENT],
    },
    {},
  );
  const {
    data: invoices = createEmptyResource<InvoiceView>(5),
    isLoading: isLoadingInvoices,
  } = useInvoices({
    pageIndex: 0,
    pageSize: 5,
    query: '',
    status: [InvoiceStatus.DRAFT],
  });
  const {
    data: technicians = createEmptyResource<EmployeeStatusView>(5),
    isLoading: isLoadingTechnicians,
  } = useQueryServiceCompanyEmployeeStatus({
    date: toRestDate(new Date()),
    pageIndex: 0,
    pageSize: 5,
    roles: [Role.TECHNICIAN],
  });
  const {
    data: activities = {
      pages: [],
      pageParams: [],
    },
    isLoading: isLoadingActivities,
    isFetchingNextPage: isFetchingNextActivitiesPage,
    hasNextPage: hasNextActivitiesPage,
    fetchNextPage: fetchNextActivitiesPage,
  } = useServiceCompanyActivities({
    start: startOfDay(addDays(new Date(), -180)).toISOString(),
    end: endOfToday().toISOString(),
    pageIndex: 0,
    pageSize: 10,
    type: [
      ActivityMessageType.SERVICE_ORDER_COMPLETED,
      ActivityMessageType.SERVICE_ORDER_SCHEDULED,
      ActivityMessageType.SERVICE_ORDER_CANCELLED,
      ActivityMessageType.SERVICE_ORDER_STARTED,
      ActivityMessageType.SERVICE_ORDER_UNSCHEDULED,
      ActivityMessageType.SERVICE_ORDER_UPDATED,
      ActivityMessageType.SERVICE_ORDER_EXPIRED,
      ActivityMessageType.SERVICE_ORDER_TIME_EDITED,
    ],
  });

  useEffect(() => {
    if (inView && hasNextActivitiesPage) {
      fetchNextActivitiesPage();
    }
  }, [inView]);

  const isLoading =
    isLoadingAppointments ||
    isLoadingQuotations ||
    isLoadingInvoices ||
    isLoadingTechnicians ||
    isLoadingActivities;

  if (isLoading) {
    return <Progress />;
  }

  return (
    <>
      <Grid container justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h3">Hi {fullName}!</Typography>
          <Typography variant="subtitle1" color={theme.palette.text.secondary}>
            There are{' '}
            <Typography variant="subtitle1" color="#01a0cc" component="span">
              72 orders
            </Typography>{' '}
            to be finished today
          </Typography>
        </Box>
        <AddAnything />
      </Grid>
      <Grid container py="2rem" spacing={2}>
        <Grid item xs={12} xl={9}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} lg={3}>
              <TopCard title="Completed Today" value="19/72" subValue="26%" />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <TopCard title="Monthly" value="189/1340" />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <TopCard
                title="Overdue"
                value="34"
                icon={ReportProblemOutlined}
                iconColor={theme.palette.error.main}
                iconBackgroundColor={theme.palette.error.outlinedHoverBg}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <TopCard
                title="Active units"
                value="2147"
                icon={Refresh}
                iconColor={theme.palette.secondary.dark}
                iconBackgroundColor={theme.palette.info.outlinedHoverBg}
              />
            </Grid>
            <Grid item xs={12} lg={6}>
              <TechniciansWorking technicians={technicians} />
            </Grid>
            <Grid item xs={12} lg={6}>
              <AppointmentsToBeScheduled
                appointments={appointments}
                appointmentNotificationMutation={
                  appointmentNotificationMutation
                }
                confirmAppointmentMutation={confirmAppointmentMutation}
              />
            </Grid>
            <Grid item xs={12} lg={6}>
              <OpenQuotations quotations={quotations} />
            </Grid>
            <Grid item xs={12} lg={6}>
              <InvoiceDrafts invoices={invoices} />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} xl={3}>
          <FieldActivities
            activities={activities}
            inViewRef={ref}
            isFetchingNextActivitiesPage={isFetchingNextActivitiesPage}
          />
        </Grid>
      </Grid>
    </>
  );
};

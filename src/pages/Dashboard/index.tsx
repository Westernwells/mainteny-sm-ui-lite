import {useEffect} from 'react';
import {useInView} from 'react-intersection-observer';
import {addDays, endOfToday, startOfDay} from 'date-fns';
import useTheme from '@mui/material/styles/useTheme';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import ReportProblemOutlined from '@mui/icons-material/ReportProblemOutlined';
import ElevatorIcon from '@mui/icons-material/Elevator';
import ContactsIcon from '@mui/icons-material/Contacts';
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
import {
  useCompanySummary,
  useServiceCompanyActivities,
} from 'hooks/reactQuery/useCompanies';
import {createEmptyResource} from 'utils/paging-utils';
import {toRestDate} from 'utils/datetime';
import {Role} from 'models/user';
import {ServiceOrderView} from 'models/service-order';
import {QuotationStatus, QuotationView} from 'models/quotation';
import {InvoiceStatus, InvoiceView} from 'models/invoice';
import {EmployeeStatusView} from 'models/employee';
import {
  ActivityMessageType,
  ServiceCompanyTimeUnit,
} from 'models/service-company';
import {useTranslation} from 'react-i18next';
import {useQueryContract} from 'hooks/reactQuery/useContract';
import {
  ContractView,
  ContractOrderField,
  ContractStatus,
} from 'models/contract';
import {Order} from 'models/misc';
import {AddAnything} from './AddAnything';
import {TopCard} from './TopCard';
import {TechniciansWorking} from './TechniciansWorking';
import {AppointmentsToBeScheduled} from './AppointmentsToBeScheduled';
import {OpenQuotations} from './OpenQuotations';
import {InvoiceDrafts} from './InvoiceDrafts';
import {FieldActivities} from './FieldActivities';

export const Dashboard = () => {
  const {t} = useTranslation();
  const theme = useTheme();
  const {ref, inView} = useInView();
  const {user} = useUserSession();
  const fullName = `${user?.userAccount.firstName} ${user?.userAccount.lastName}`;
  const {data: dailySummary, isLoading: isLoadingDailySummary} =
    useCompanySummary(
      {
        date: toRestDate(new Date()),
        timeUnit: ServiceCompanyTimeUnit.DAILY,
      },
      user?.userAccount.serviceCompany.id,
    );
  const {data: quarterlySummary, isLoading: isLoadingQuarterlySummary} =
    useCompanySummary(
      {
        date: toRestDate(new Date()),
        timeUnit: ServiceCompanyTimeUnit.QUARTERLY,
      },
      user?.userAccount.serviceCompany.id,
    );
  const {data: fullSummary, isLoading: isLoadingFullSummary} =
    useCompanySummary(
      {
        date: toRestDate(new Date()),
        timeUnit: ServiceCompanyTimeUnit.FULLY,
      },
      user?.userAccount.serviceCompany.id,
    );
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
    data: activeContract = createEmptyResource<ContractView>(10),
    isLoading: isContractLoading,
  } = useQueryContract(
    {
      order: Order.DESC,
      orderBy: ContractOrderField.CREATED_TIME,
      pageIndex: 0,
      pageSize: 25,
      query: '',
      status: [ContractStatus.VALID],
      priceStart: -9999999,
      priceEnd: 9999999,
    },
    {keepPreviousData: true},
  );

  const {
    data: expiringContract = createEmptyResource<ContractView>(10),
    isLoading: isContractExpiringLoading,
  } = useQueryContract(
    {
      order: Order.DESC,
      orderBy: ContractOrderField.CREATED_TIME,
      pageIndex: 0,
      pageSize: 25,
      query: '',
      status: [ContractStatus.EXPIRING],
      priceStart: -9999999,
      priceEnd: 9999999,
    },
    {keepPreviousData: true},
  );

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

  const dailyNumberOfCompletedOrders =
    dailySummary?.serviceOrderSummary.numberOfCompletedOrders ?? 0;
  const dailyNumberOfOrders =
    dailySummary?.serviceOrderSummary.numberOfOrders ?? 0;
  const quarterlyNumberOfCompletedOrders =
    quarterlySummary?.serviceOrderSummary.numberOfCompletedOrders ?? 0;
  const quarterlyNumberOfOrders =
    quarterlySummary?.serviceOrderSummary.numberOfOrders ?? 0;
  const fullNumberOfActiveUnits =
    fullSummary?.elevatorSummary?.numberOfActiveContractElevator ?? 0;

  useEffect(() => {
    if (inView && hasNextActivitiesPage) {
      fetchNextActivitiesPage();
    }
  }, [inView]);

  const isLoading =
    isLoadingDailySummary ||
    isLoadingQuarterlySummary ||
    isLoadingFullSummary ||
    isLoadingAppointments ||
    isLoadingQuotations ||
    isLoadingInvoices ||
    isContractLoading ||
    isContractExpiringLoading ||
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
            {t('There are')}{' '}
            <Typography variant="subtitle1" color="#01a0cc" component="span">
              {dailyNumberOfOrders} {t('jobs')}
            </Typography>{' '}
            {t('to be finished today')}
          </Typography>
        </Box>
        <AddAnything />
      </Grid>

      <Grid container py="2rem" spacing={2}>
        <Grid item xs={12} xl={12}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} lg={2.4}>
              <TopCard
                title="Completed Today"
                value={`${dailyNumberOfCompletedOrders}/${dailyNumberOfOrders}`}
                subText={`${
                  dailyNumberOfOrders > 0
                    ? (
                        (dailyNumberOfCompletedOrders / dailyNumberOfOrders) *
                        100
                      ).toFixed(2)
                    : 100
                }%`}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={2.4}>
              <TopCard
                title="Quarterly"
                value={`${quarterlyNumberOfCompletedOrders}/${quarterlyNumberOfOrders}`}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={2.4}>
              <TopCard
                title="Overdue"
                value={`${
                  quarterlySummary?.serviceOrderSummary.numberOfOverDueOrders ??
                  '0'
                }`}
                icon={ReportProblemOutlined}
                iconColor={theme.palette.error.main}
                iconBackgroundColor={theme.palette.error.outlinedHoverBg}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={2.4}>
              <TopCard
                title="Active units"
                value={`${fullNumberOfActiveUnits}`}
                icon={ElevatorIcon}
                iconColor={theme.palette.secondary.dark}
                iconBackgroundColor={theme.palette.info.outlinedHoverBg}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={2.4}>
              <TopCard
                title="Active contracts"
                value={`${activeContract.total}`}
                icon={ContactsIcon}
                iconColor={theme.palette.secondary.dark}
                iconBackgroundColor={theme.palette.info.outlinedHoverBg}
                subText={`${t('{{totalNumberOfExpiringContracts}} expiring', {
                  totalNumberOfExpiringContracts: expiringContract.total,
                })}`}
                subValue={expiringContract.total}
                url="contracts"
              />
            </Grid>
          </Grid>
        </Grid>

        <Grid item container spacing={2}>
          <Grid item container spacing={2} xs={12} lg={12} xl={9}>
            <Grid item xs={12} lg={6} xl={6}>
              <TechniciansWorking technicians={technicians} />
            </Grid>
            <Grid item xs={12} lg={6} xl={6}>
              <AppointmentsToBeScheduled
                appointments={appointments}
                appointmentNotificationMutation={
                  appointmentNotificationMutation
                }
                confirmAppointmentMutation={confirmAppointmentMutation}
              />
            </Grid>
            <Grid item xs={12} lg={6} xl={6}>
              <OpenQuotations quotations={quotations} />
            </Grid>
            <Grid item xs={12} lg={6} xl={6}>
              <InvoiceDrafts invoices={invoices} />
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
      </Grid>
    </>
  );
};

export default Dashboard;

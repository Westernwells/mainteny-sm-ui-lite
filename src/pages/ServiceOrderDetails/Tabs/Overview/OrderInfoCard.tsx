import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {InfoCard} from 'components/InfoCard';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import Grid from '@mui/material/Grid';
import {Confirm} from 'components/Confirm';
import {
  useCancelServiceOrders,
  useUnscheduleServiceOrders,
} from 'hooks/reactQuery/useServiceOrder';
import {ServiceOrderStatus, ServiceOrderView} from 'models/service-order';
import {ServiceOrderIcons} from 'components/ServiceOrderIcons';
import {StatusChip} from 'components/StatusChip';
import {
  canMarkCompleted,
  getServiceOrderStatusColor,
  serviceOrderStatusToString,
} from 'utils/service-order-utils';
import {MenuBtn} from 'components/MenuBtn';
import {ServiceOrderTypeText} from 'components/ServiceOrderTypeText';
import {useTheme} from '@mui/material';
import {EmployeesView} from 'models/employee';
import {CANCEL_ACTION} from 'models/status';
import {ScheduleDialog} from './ScheduleDialog';
import {MarkCompletedDialog} from './MarkCompletedDialog';
import {OrderInfo} from './schema';

interface Props {
  serviceOrderDetails: ServiceOrderView;
}

interface OrderInfoProps {
  serviceOrderDetails: ServiceOrderView;
  label: string;
  details: string[];
}

const customerDetailCells = ['customer', 'calledBy', 'purchaseOrderNumber'];
const unitDetailCells = ['unitAddress', 'unitNumber'];
const contractDetailCells = ['contractNumber', 'contractName', 'contractType'];
const jobDetailCells = ['technicians', 'dueDate', 'dateScheduled'];

const OrderInfoItem = ({
  serviceOrderDetails,
  label,
  details,
}: OrderInfoProps) => {
  const {t} = useTranslation();
  const theme = useTheme();
  return (
    <Grid
      item
      xs={3}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid #0F4C6414',
        paddingRight: details ? '0.5em' : '0em',

        '&:nth-last-of-type(1)': {
          borderRight: 'none',
        },
      }}>
      <Typography variant="body2" color={theme.palette.text.secondary}>
        {t(label)}
      </Typography>
      {details &&
        details.map((item, index) => (
          <Grid item key={`${item}-${index}`} sx={{mt: '0.5em'}}>
            <OrderInfo serviceOrderDetails={serviceOrderDetails} label={item} />
          </Grid>
        ))}
    </Grid>
  );
};

export const OrderInfoCard = ({serviceOrderDetails}: Props) => {
  const {t} = useTranslation();
  const {mutate: cancelServiceOrder} = useCancelServiceOrders({
    serviceOrderId: serviceOrderDetails.id,
    action: CANCEL_ACTION.CANCEL,
  });
  const {mutate: unscheduleServiceOrder} = useUnscheduleServiceOrders();

  const [openCancelConfirm, setOpenCancelConfirm] = useState(false);
  const [openUnscheduleConfirm, setOpenUnscheduleConfirm] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openMarkCompletedDialog, setOpenMarkCompletedDialog] = useState(false);

  // scheduled => perfill technicians from schedules and time
  // unscheduled => prefill the technicians from candidateTechnicians
  const defaultTechnicians = serviceOrderDetails.schedules.length
    ? serviceOrderDetails.schedules.map((s) => s.technician)
    : serviceOrderDetails.additionalInfo.candidateTechnicians?.length
    ? (serviceOrderDetails.additionalInfo
        .candidateTechnicians as unknown as EmployeesView[])
    : serviceOrderDetails.additionalInfo.candidateTechnician
    ? ([
        serviceOrderDetails.additionalInfo.candidateTechnician,
      ] as unknown as EmployeesView[])
    : null;

  const renderDialogTitle = () =>
    serviceOrderDetails.status === ServiceOrderStatus.SCHEDULED ||
    serviceOrderDetails.status === ServiceOrderStatus.IN_PROGRESS
      ? t('Reschedule Job')
      : t('Schedule Job');

  const notPending = [
    ServiceOrderStatus.INIT,
    ServiceOrderStatus.READY_TO_SCHEDULE,
    ServiceOrderStatus.SCHEDULING,
    ServiceOrderStatus.OVERDUE,
    ServiceOrderStatus.IN_PROGRESS,
  ].includes(serviceOrderDetails.status);

  const orderAction = () => {
    if (notPending) {
      const actions = [
        {
          label: t('Cancel Job'),
          action: () => setOpenCancelConfirm(true),
        },
        {
          label: t('Schedule'),
          action: () => setOpenDialog(true),
        },
      ];

      if (
        canMarkCompleted(
          serviceOrderDetails?.status,
          serviceOrderDetails?.schedules?.length || 0,
        )
      ) {
        actions.push({
          label: t('Mark Completed'),
          action: () => setOpenMarkCompletedDialog(true),
        });
      }

      if (serviceOrderDetails?.status === ServiceOrderStatus.OVERDUE) {
        actions.push({
          label: t('Unschedule'),
          action: () => setOpenUnscheduleConfirm(true),
        });
      }

      return actions;
    }

    if (
      [
        ServiceOrderStatus.SCHEDULED,
        ServiceOrderStatus.IN_PROGRESS,
        ServiceOrderStatus.TECHNICIAN_ASSIGNED,
        ServiceOrderStatus.ARTICLES_ORDERED,
        ServiceOrderStatus.PAUSED,
      ].includes(serviceOrderDetails?.status)
    ) {
      return [
        {
          label: t('Reschedule'),
          action: () => setOpenDialog(true),
        },
        {
          label: t('Unschedule'),
          action: () => setOpenUnscheduleConfirm(true),
        },
        {
          label: t('Mark Completed'),
          action: () => setOpenMarkCompletedDialog(true),
        },
        {
          label: t('Cancel Job'),
          action: () => setOpenCancelConfirm(true),
        },
      ];
    }

    return [];
  };

  const renderHeaderLeftWidget = () => (
    <Box sx={{display: 'flex'}}>
      {![ServiceOrderStatus.COMPLETED, ServiceOrderStatus.CANCELLED].includes(
        serviceOrderDetails.status,
      ) ? (
        <Box sx={{mt: -1}}>
          <MenuBtn
            sx={{p: 0, display: 'flex'}}
            disableRipple
            anchorType="iconButton"
            anchorIcon={<MoreHorizIcon sx={{color: '#231F20'}} />}
            menu={orderAction()}
          />
        </Box>
      ) : null}
    </Box>
  );

  return (
    <InfoCard
      showHeaderBackground
      containerStyles={{display: 'flex', flexDirection: 'column'}}
      header={
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
          }}>
          <Box sx={{display: 'flex', height: '100%', alignItems: 'center'}}>
            <Box sx={{alignSelf: 'center'}}>
              <ServiceOrderIcons serviceOrderType={serviceOrderDetails.type} />
            </Box>

            <Box>
              <ServiceOrderTypeText
                variant="subtitle1"
                style={{ml: '0.5em'}}
                capitalizeText
                serviceOrderType={serviceOrderDetails.type}
              />
            </Box>

            <Typography
              component="div"
              variant="caption"
              sx={{
                ml: '0.4em',
                alignSelf: 'center',
              }}>
              {`#${serviceOrderDetails.externalId}`}
            </Typography>

            <StatusChip
              color={getServiceOrderStatusColor(serviceOrderDetails.status)}
              label={serviceOrderStatusToString(serviceOrderDetails.status)}
              style={{
                marginLeft: '2em',
              }}
            />
          </Box>

          {renderHeaderLeftWidget()}
        </Box>
      }>
      <Grid container columnSpacing={4}>
        <OrderInfoItem
          label="Customer Details"
          details={customerDetailCells}
          serviceOrderDetails={serviceOrderDetails}
        />
        <OrderInfoItem
          label="Unit Details"
          details={unitDetailCells}
          serviceOrderDetails={serviceOrderDetails}
        />
        <OrderInfoItem
          label="Contract"
          details={contractDetailCells}
          serviceOrderDetails={serviceOrderDetails}
        />
        <OrderInfoItem
          label="Job"
          details={jobDetailCells}
          serviceOrderDetails={serviceOrderDetails}
        />
      </Grid>

      <Confirm
        open={openCancelConfirm}
        onConfirm={() => {
          cancelServiceOrder();
          setOpenCancelConfirm(false);
        }}
        onClose={() => setOpenCancelConfirm(false)}
        title="Confirm"
        content="Do you want to cancel the order?"
      />
      <Confirm
        open={openUnscheduleConfirm}
        onConfirm={() => {
          unscheduleServiceOrder(serviceOrderDetails.id);
          setOpenUnscheduleConfirm(false);
        }}
        onClose={() => setOpenUnscheduleConfirm(false)}
        title="Confirm"
        content="Do you want to unschedule the service job?"
      />

      <ScheduleDialog
        serviceOrderId={serviceOrderDetails.id}
        serviceOrderType={serviceOrderDetails.type}
        title={renderDialogTitle()}
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        defaultTechnicians={defaultTechnicians}
        defaultStartDate={
          serviceOrderDetails.schedules.length
            ? new Date(serviceOrderDetails.schedules[0].startTime)
            : null
        }
        defaultEndDate={
          serviceOrderDetails.schedules.length
            ? new Date(serviceOrderDetails.schedules[0].endTime)
            : null
        }
        defaultDueDate={
          serviceOrderDetails.dueDate
            ? new Date(serviceOrderDetails.dueDate)
            : null
        }
        defaultCallTime={
          serviceOrderDetails.additionalInfo?.callerInfo?.calledAt
            ? new Date(serviceOrderDetails.additionalInfo.callerInfo.calledAt)
            : null
        }
        defaultCallerName={serviceOrderDetails.additionalInfo?.callerInfo?.name}
        defaultPurchaseOrderNumber={
          serviceOrderDetails.additionalInfo.purchaseOrderNumber
        }
        defaultCallerPhoneNumber={
          serviceOrderDetails.additionalInfo?.callerInfo?.phoneNumber
        }
      />

      <MarkCompletedDialog
        serviceOrderDetails={serviceOrderDetails}
        title={t('Mark Completed')}
        open={openMarkCompletedDialog}
        onClose={() => setOpenMarkCompletedDialog(false)}
      />
    </InfoCard>
  );
};

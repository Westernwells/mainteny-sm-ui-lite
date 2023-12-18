import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {InfoCard} from 'components/InfoCard';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import Grid from '@mui/material/Grid';
import {Confirm} from 'components/Confirm';
import {
  useCancelServiceOrders,
  useUpdateServiceOrderSchedule,
  useRedispatchServiceOrders,
  useUnscheduleServiceOrders,
} from 'hooks/reactQuery/useServiceOrder';
import {
  JobScheduleType,
  ServiceOrderStatus,
  ServiceOrderView,
} from 'models/service-order';
import {ServiceOrderIcons} from 'components/ServiceOrderIcons';
import {setDateTime, toRestDateTime} from 'utils/datetime';
import {ScheduleForm} from 'pages/ServiceOrderDetails/models';
import {FormikErrors} from 'formik';
import {StatusChip} from 'components/StatusChip';
import {
  getServiceOrderStatusColor,
  serviceOrderStatusToString,
} from 'utils/service-order-utils';
import {MenuBtn} from 'components/MenuBtn';
import {ServiceOrderTypeText} from 'components/ServiceOrderTypeText';
import {olStyles} from 'styles';
import {useFormatDate} from 'hooks/useFormatDate';
import {useTheme} from '@mui/material';
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

        '&:nth-last-child(1)': {
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
  const formatDate = useFormatDate();
  const {mutate: cancelServiceOrder} = useCancelServiceOrders();
  const {mutate: unscheduleServiceOrder} = useUnscheduleServiceOrders();
  const {mutate: rescheduleServiceOrder} = useRedispatchServiceOrders(
    'Service job rescheduled successfully',
  );
  const {mutate: scheduleServiceOrder} = useUpdateServiceOrderSchedule(
    'Service job scheduled successfully',
  );
  const [openCancelConfirm, setOpenCancelConfirm] = useState(false);
  const [openUnscheduleConfirm, setOpenUnscheduleConfirm] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openMarkCompletedDialog, setOpenMarkCompletedDialog] = useState(false);
  const [switchActive, setSwitchActive] = useState(true);
  const [form, setForm] = useState<ScheduleForm>({} as ScheduleForm);
  const [formError, setFormErrors] = useState<FormikErrors<ScheduleForm>>({});
  const [formValid, setFormValid] = useState(false);

  useEffect(() => {
    if (
      switchActive &&
      form?.startTime &&
      form.endTime &&
      form.date &&
      form.technicianId
    ) {
      setFormValid(true);
    } else {
      setFormValid(false);
    }

    if (!switchActive) {
      setFormValid(true);
    }
  }, [form, switchActive]);

  const reschedule = () => {
    if (form.technicianId) {
      rescheduleServiceOrder({
        technicianId: form.technicianId,
        serviceOrderId: serviceOrderDetails.id,
      });
      setOpenDialog(false);
    }
  };

  const schedule = () => {
    const orderStartTime = toRestDateTime(
      setDateTime(form?.date!, formatDate(form.startTime as Date, 'HH:mm')!),
    );
    const orderEndTime = toRestDateTime(
      setDateTime(form?.date!, formatDate(form.endTime as Date, 'HH:mm')!),
    );

    if (form.technicianId) {
      scheduleServiceOrder({
        body: {
          endTime: orderEndTime,
          startTime: orderStartTime,
          technicianIds: [form.technicianId],
          type: JobScheduleType.FIXED,
        },
        serviceOrderId: serviceOrderDetails.id,
      });
      setOpenDialog(false);
    }
  };

  const handleSave = () => {
    if (
      serviceOrderDetails.status === ServiceOrderStatus.SCHEDULED ||
      serviceOrderDetails.status === ServiceOrderStatus.IN_PROGRESS
    ) {
      return switchActive && !Object.keys(formError).length
        ? schedule()
        : reschedule();
    }
    return schedule();
  };

  const renderDialogTitle = () =>
    serviceOrderDetails.status === ServiceOrderStatus.SCHEDULED ||
    serviceOrderDetails.status === ServiceOrderStatus.IN_PROGRESS
      ? t('Reschedule Job')
      : t('Schedule Job');

  const orderAction = () => {
    if (
      [
        ServiceOrderStatus.INIT,
        ServiceOrderStatus.READY_TO_SCHEDULE,
        ServiceOrderStatus.SCHEDULING,
        ServiceOrderStatus.EXPIRED,
      ].includes(serviceOrderDetails.status)
    ) {
      return [
        {
          label: t('Cancel Job'),
          action: () => setOpenCancelConfirm(true),
        },
        {
          label: t('Schedule'),
          action: () => setOpenDialog(true),
        },
      ];
    }

    if (
      [ServiceOrderStatus.SCHEDULED, ServiceOrderStatus.IN_PROGRESS].includes(
        serviceOrderDetails.status,
      )
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
              {`#${serviceOrderDetails.number}`}
            </Typography>

            <StatusChip
              color={getServiceOrderStatusColor(serviceOrderDetails.status)}
              label={serviceOrderStatusToString(serviceOrderDetails.status)}
              style={{
                ...olStyles.orderStatus,
                letterSpacing: 'normal',
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
          cancelServiceOrder(serviceOrderDetails.id);
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
        disableSaveBtn={!formValid}
        showSwitch={
          serviceOrderDetails.status === ServiceOrderStatus.SCHEDULED ||
          serviceOrderDetails.status === ServiceOrderStatus.IN_PROGRESS
        }
        getSwitchState={
          serviceOrderDetails.status === ServiceOrderStatus.SCHEDULED ||
          serviceOrderDetails.status === ServiceOrderStatus.IN_PROGRESS
            ? (value) => setSwitchActive(value)
            : () => setSwitchActive(true)
        }
        title={renderDialogTitle()}
        getFormValues={(value) => setForm(value)}
        getFormErrors={(errors) => setFormErrors(errors)}
        open={openDialog}
        onSave={handleSave}
        onCancel={() => setOpenDialog(false)}
        defaultTechnician={
          serviceOrderDetails.schedules.length
            ? serviceOrderDetails.schedules[0].technician
            : null
        }
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

import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {InfoCard} from 'components/InfoCard';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import Grid from '@mui/material/Grid';
// import {convertToText} from 'utils/utils';
// import {CardProps} from 'components/CardProps';
import {Confirm} from 'components/Confirm';
import {
  useCancelServiceOrders,
  useUpdateServiceOrder,
  useRedispatchServiceOrders,
  useUnscheduleServiceOrders,
} from 'hooks/reactQuery/useServiceOrder';
import {
  JobScheduleType,
  ServiceOrderStatus,
  ServiceOrderView,
} from 'models/service-order';
import {ServiceOrderIcons} from 'components/ServiceOrderIcons';
import {formatDate, setDateTime} from 'utils/datetime';
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
import {ScheduleDialog} from './ScheduleDialog';
import {MarkCompletedDialog} from './MarkCompletedDialog';
import {OrderInfo} from './schema';

interface Props {
  serviceOrderDetails: ServiceOrderView;
}

const orderInfo = [
  'customer',
  'unitNumber',
  'unitAddress',
  'dueDate',
  'schedule',
  'technicians',
];

export const OrderInfoCard = ({serviceOrderDetails}: Props) => {
  const {t} = useTranslation();
  const {mutate: cancelServiceOrder} = useCancelServiceOrders();
  const {mutate: unscheduleServiceOrder} = useUnscheduleServiceOrders();
  const {mutate: rescheduleServiceOrder} = useRedispatchServiceOrders(
    'Service order rescheduled successfully',
  );
  const {mutate: scheduleServiceOrder} = useUpdateServiceOrder(
    'Service order scheduled successfully',
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
    const orderStartTime = setDateTime(
      form?.date!,
      formatDate(form.startTime as Date, 'HH:mm')!,
    ).toISOString();
    const orderEndTime = setDateTime(
      form?.date!,
      formatDate(form.endTime as Date, 'HH:mm')!,
    ).toISOString();

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
      ? 'Reschedule Order'
      : 'Schedule Order';

  const orderAction = () => {
    if (
      [
        ServiceOrderStatus.INIT,
        ServiceOrderStatus.READY_TO_SCHEDULE,
        ServiceOrderStatus.SCHEDULING,
      ].includes(serviceOrderDetails.status)
    ) {
      return [
        {
          label: t('Cancel'),
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
          label: t('Cancel'),
          action: () => setOpenCancelConfirm(true),
        },
      ];
    }
    return [];
  };

  const renderHeaderLeftWidget = () => (
    <Box sx={{display: 'flex'}}>
      <StatusChip
        color={getServiceOrderStatusColor(serviceOrderDetails.status)}
        label={serviceOrderStatusToString(serviceOrderDetails.status)}
        style={{...olStyles.orderStatus, letterSpacing: 'normal'}}
        // maxChars={15}
      />
      {serviceOrderDetails.status !== ServiceOrderStatus.COMPLETED ? (
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
        <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
          <Box sx={{display: 'flex'}}>
            <Box sx={{display: 'flex', alignItems: 'center'}}>
              <ServiceOrderIcons serviceOrderType={serviceOrderDetails.type} />
            </Box>
            <ServiceOrderTypeText
              variant="subtitle1"
              style={{ml: '0.5em', mt: '0.1em'}}
              capitalizeText
              serviceOrderType={serviceOrderDetails.type}
            />

            <Typography
              component="div"
              variant="caption"
              sx={{
                ml: '0.4em',
                display: 'flex',
                alignItems: 'center',
                mt: '0.2em',
              }}>
              {`#${serviceOrderDetails.number}`}
            </Typography>
          </Box>

          {renderHeaderLeftWidget()}
        </Box>
      }>
      <Grid container>
        {orderInfo.map((label, index) => (
          <Grid item xs={4} key={`${label}-${index}`}>
            <OrderInfo
              serviceOrderDetails={serviceOrderDetails}
              label={label}
            />
          </Grid>
        ))}
      </Grid>

      <Confirm
        open={openCancelConfirm}
        onConfirm={() => {
          cancelServiceOrder(serviceOrderDetails.id);
          setOpenCancelConfirm(false);
        }}
        onClose={() => setOpenCancelConfirm(false)}
        title="Confirm"
        content="Do you want to cancel the service order?"
      />
      <Confirm
        open={openUnscheduleConfirm}
        onConfirm={() => {
          unscheduleServiceOrder(serviceOrderDetails.id);
          setOpenUnscheduleConfirm(false);
        }}
        onClose={() => setOpenUnscheduleConfirm(false)}
        title="Confirm"
        content="Do you want to unschedule the service order?"
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

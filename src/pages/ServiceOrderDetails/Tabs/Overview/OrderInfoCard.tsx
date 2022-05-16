import {useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {BasicDetailsCard} from 'components/BasicDetailsCard';
import EditIcon from '@mui/icons-material/Edit';
import useTheme from '@mui/material/styles/useTheme';
import Button from '@mui/material/Button';
import {convertToText} from 'utils/utils';
import {CardProps} from 'components/CardProps';
import {Confirm} from 'components/Confirm';
import {
  useCancelServiceOrders,
  useCreateServiceOrder,
  useRedispatchServiceOrders,
  useUnscheduleServiceOrders,
} from 'hooks/reactQuery/useServiceOrder';
import {
  JobScheduleType,
  ServiceOrder,
  ServiceOrderStatus,
} from 'models/service-order';
import {useTranslation} from 'react-i18next';
import {formatDate, setDateTime} from 'utils/datetime';
import {ScheduleForm} from 'pages/ServiceOrderDetails/models';
import {FormikErrors} from 'formik';
import {orderInfo as orderInfoSchema} from './schema';
import {ScheduleDialog} from './ScheduleDialog';

interface Props {
  serviceOrderDetails: ServiceOrder;
}

export const OrderInfoCard = ({serviceOrderDetails}: Props) => {
  const theme = useTheme();
  const [orderInfo, setOrderInfo] = useState(
    orderInfoSchema(serviceOrderDetails),
  );
  const {mutate: cancelServiceOrder} = useCancelServiceOrders();
  const {mutate: unscheduleServiceOrder} = useUnscheduleServiceOrders();
  const {mutate: rescheduleServiceOrder} = useRedispatchServiceOrders(
    'Service order rescheduled successfully',
  );
  const {mutate: scheduleServiceOrder} = useCreateServiceOrder(
    'Service order created successfully',
  );
  const [openCancelConfirm, setOpenCancelConfirm] = useState(false);
  const [openUnscheduleConfirm, setOpenUnscheduleConfirm] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [switchActive, setSwitchActive] = useState(true);
  const [form, setForm] = useState<ScheduleForm>({} as ScheduleForm);
  const [formError, setFormErrors] = useState<FormikErrors<ScheduleForm>>();
  const [formValid, setFormValid] = useState(false);
  const {t} = useTranslation();


  useEffect(() => {
    setOrderInfo(orderInfoSchema(serviceOrderDetails));
  }, [serviceOrderDetails]);

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
      return switchActive && !formError ? schedule() : reschedule();
    }
    return schedule();
  };

  const renderDialogTitle = () =>
    serviceOrderDetails.status === ServiceOrderStatus.SCHEDULED ||
    serviceOrderDetails.status === ServiceOrderStatus.IN_PROGRESS
      ? 'Reschedule Order'
      : 'Schedule Order';

  const renderRescheduleUnassignBtnGroup = () =>
    [ServiceOrderStatus.SCHEDULED, ServiceOrderStatus.IN_PROGRESS].includes(
      serviceOrderDetails.status,
    ) ? (
      <>
        <Button
          variant="contained"
          onClick={() => setOpenDialog(true)}
          size="small"
          sx={{px: '2.5em', mt: '1em', mr: '1em'}}>
             {t('Reschedule')}
        </Button>
        <Button
          variant="outlined"
          size="small"
          sx={{px: '2.5em', mt: '1em'}}
          onClick={() => setOpenUnscheduleConfirm(true)}>
                {t('Unschedule')}
        </Button>
      </>
    ) : null;

  const renderCancelScheduleBtnGroup = () =>
    [
      ServiceOrderStatus.INIT,
      ServiceOrderStatus.READY_TO_SCHEDULE,
      ServiceOrderStatus.SCHEDULING,
    ].includes(serviceOrderDetails.status) ? (
      <>
        <Button
          variant="text"
          size="small"
          sx={{px: '2.5em', mt: '1em'}}
          onClick={() => setOpenCancelConfirm(true)}>
              {t('Cancel')}
        </Button>
        <Button
          variant="contained"
          size="small"
          sx={{px: '2.5em', mt: '1em'}}
          onClick={() => setOpenDialog(true)}>
             {t('Schedule')}
        </Button>
      </>
    ) : null;

  return (
    <BasicDetailsCard
      containerStyles={{display: 'flex', flexDirection: 'column'}}
      header={
        <Box>
          <Typography variant="subtitle1">
            {serviceOrderDetails.number}
          </Typography>
          <Box sx={{display: 'flex'}}>
            <Typography variant="body2" sx={{mr: '0.2em'}}>
              {serviceOrderDetails.description}
            </Typography>
            <EditIcon
              style={{color: theme.palette.text.secondary}}
              fontSize="small"
            />
          </Box>
        </Box>
      }>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
        }}>
        {Object.values(orderInfo).map((item, index) => (
          <CardProps
            key={`${index}`}
            label={t(item.label)}
            icon={item.icon}
            bodyText={convertToText(item.value!)}
            containerStyles={{mb: '0.5em', width: '27%'}}
            iconMaxHeight="3rem"
            iconBackground={theme.palette.info.outlinedHoverBg}
          />
        ))}
      </Box>
      <Box sx={{display: 'flex', justifyContent: 'flex-end'}}>
        {renderCancelScheduleBtnGroup()}
        {renderRescheduleUnassignBtnGroup()}
      </Box>
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
    </BasicDetailsCard>
  );
};

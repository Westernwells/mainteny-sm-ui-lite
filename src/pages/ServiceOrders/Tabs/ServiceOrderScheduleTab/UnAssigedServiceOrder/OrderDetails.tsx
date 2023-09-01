import {SetStateAction, useEffect, useMemo, useState} from 'react';
import {isAfter} from 'date-fns';
import Box, {BoxProps} from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {ServiceOrderIcons} from 'components/ServiceOrderIcons';
import {
  JobScheduleType,
  ServiceOrderType,
  ServiceOrderView,
} from 'models/service-order';
import {Button} from 'components/Button';
import Divider from '@mui/material/Divider';
import {useTranslation} from 'react-i18next';
import {isEmpty} from 'lodash';
import {FormikErrors} from 'formik';
import {ScheduleForm} from 'pages/ServiceOrderDetails/models';
import {ScheduleDialog} from 'pages/ServiceOrderDetails/Tabs/Overview/ScheduleDialog';
import {serviceOrderTypeToString} from 'utils/service-order-utils';
import {
  useRedispatchServiceOrders,
  useUpdateServiceOrderSchedule,
} from 'hooks/reactQuery/useServiceOrder';
import {setDateTime, toRestDateTime} from 'utils/datetime';
import {useFormatDateDistance} from 'hooks/useFormatDateDistance';
import {useFormatDate} from 'hooks/useFormatDate';

interface Props extends BoxProps {
  serviceOrder: ServiceOrderView;
}

export const OrderDetails = ({serviceOrder, ...rest}: Props) => {
  const {t, i18n} = useTranslation();
  const formatDateDistance = useFormatDateDistance();
  const formatDate = useFormatDate();
  const [openDialog, setOpenDialog] = useState(false);
  const successMessage = 'Service job scheduled successfully';
  const {mutate: rescheduleServiceOrder} =
    useRedispatchServiceOrders(successMessage);
  const {mutate: scheduleServiceOrder} =
    useUpdateServiceOrderSchedule(successMessage);
  const [switchActive, setSwitchActive] = useState(true);
  const [form, setForm] = useState<ScheduleForm>({} as ScheduleForm);
  const [formError, setFormErrors] = useState<FormikErrors<ScheduleForm>>();
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
        serviceOrderId: serviceOrder.id,
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
        serviceOrderId: serviceOrder.id,
      });
      setOpenDialog(false);
    }
  };

  const handleSave = () =>
    switchActive && isEmpty(formError) ? schedule() : reschedule();

  const dueDate = useMemo(() => {
    const dueDateObj = new Date(serviceOrder.dueDate);

    // check if date is future date
    if (isAfter(dueDateObj, new Date())) {
      return `${t('Due in')} ${formatDateDistance(dueDateObj, undefined, {
        addSuffix: false,
      })}`;
    }

    return `${t('Due')} ${formatDateDistance(dueDateObj)}`;
  }, [serviceOrder.dueDate, i18n.language]);

  return (
    <Box sx={{mt: '0.625em', px: '0.5em'}} {...rest}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
        }}>
        <Box sx={{display: 'flex'}}>
          <ServiceOrderIcons
            serviceOrderType={serviceOrder.type}
            style={{width: '1.14rem', height: '1.02rem', mt: '0.1em'}}
          />
          <Typography
            variant="smallBtnText"
            color={
              serviceOrder.type === ServiceOrderType.EMERGENCY
                ? 'error'
                : 'primary'
            }
            sx={{textTransform: 'capitalize', ml: '0.5em'}}>
            {t(serviceOrderTypeToString(serviceOrder.type))}
          </Typography>
        </Box>
        <Typography variant="caption">{dueDate}</Typography>
      </Box>
      <Typography variant="body2" component="div" mt="0.5em">
        {serviceOrder.elevator.propertyOwner.name}
      </Typography>
      <Typography
        component="div"
        variant="caption"
        color="textSecondary"
        mb="0.7em">
        {serviceOrder.elevator.address.fullName}
      </Typography>

      <Button
        label={t('Assign Technician')}
        style={{px: '0.5em'}}
        buttonProps={{
          onClick: () => setOpenDialog(true),
          size: 'medium',
          fullWidth: true,
          variant: 'outlined',
          sx: {bgcolor: 'white'},
        }}
      />

      <ScheduleDialog
        disableSaveBtn={!formValid}
        showSwitch
        getSwitchState={(value: SetStateAction<boolean>) =>
          setSwitchActive(value)
        }
        title={t('Assign Technician')}
        datePickerLabel="Schedule To"
        getFormValues={(value: SetStateAction<ScheduleForm>) => setForm(value)}
        getFormErrors={(
          errors: SetStateAction<FormikErrors<ScheduleForm> | undefined>,
        ) => setFormErrors(errors)}
        open={openDialog}
        onSave={handleSave}
        onCancel={() => setOpenDialog(false)}
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
      />

      <Divider sx={{mt: '1.5em'}} />
    </Box>
  );
};

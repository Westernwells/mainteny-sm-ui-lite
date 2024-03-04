import {SetStateAction, useEffect, useMemo, useState} from 'react';
import {isAfter} from 'date-fns';
import Box, {BoxProps} from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LocationOn from '@mui/icons-material/LocationOn';
import Tag from '@mui/icons-material/Tag';
import {ServiceOrderIcons} from 'components/ServiceOrderIcons';
import {
  JobScheduleType,
  ServiceOrderStatus,
  ServiceOrderView,
} from 'models/service-order';
import {Button} from 'components/Button';
import {useTranslation} from 'react-i18next';
import {isEmpty} from 'lodash';
import {FormikErrors} from 'formik';
import {ScheduleForm} from 'pages/ServiceOrderDetails/models';
import {ScheduleDialog} from 'pages/ServiceOrderDetails/Tabs/Overview/ScheduleDialog';
import {
  serviceOrderTypeColor,
  serviceOrderTypeToString,
} from 'utils/service-order-utils';
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
  const [switchActive, setSwitchActive] = useState(false);
  const [form, setForm] = useState<ScheduleForm>({} as ScheduleForm);
  const [formError, setFormErrors] = useState<FormikErrors<ScheduleForm>>();
  const [formValid, setFormValid] = useState(false);

  useEffect(() => {
    if (!form.technicianId) {
      return setFormValid(false);
    }

    if (!switchActive && form.technicianId) {
      return setFormValid(true);
    }

    if (
      switchActive &&
      form?.startTime &&
      form.endTime &&
      form.startDate &&
      form.endDate &&
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
    let orderStartTime = null;
    let orderEndTime = null;
    if (switchActive) {
      orderStartTime = toRestDateTime(
        setDateTime(
          form?.startDate!,
          formatDate(form.startTime as Date, 'HH:mm')!,
        ),
      );

      orderEndTime = toRestDateTime(
        setDateTime(form?.endDate!, formatDate(form.endTime as Date, 'HH:mm')!),
      );
    }

    if (form.technicianId) {
      scheduleServiceOrder({
        body: {
          ...(orderEndTime && {endTime: orderEndTime}),
          ...(orderStartTime && {startTime: orderStartTime}),
          technicianIds: [form.technicianId],
          type: JobScheduleType.FIXED,
        },
        serviceOrderId: serviceOrder.id,
      });
      setOpenDialog(false);
    }
  };

  const handleSave = () => {
    if (
      serviceOrder.status === ServiceOrderStatus.SCHEDULED ||
      serviceOrder.status === ServiceOrderStatus.IN_PROGRESS
    ) {
      return switchActive && isEmpty(formError) ? schedule() : reschedule();
    }
    return schedule();
  };

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
    <Box sx={{py: 1.5, px: '1rem'}} {...rest}>
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
            color={serviceOrderTypeColor(serviceOrder.type)}
            sx={{textTransform: 'uppercase', ml: '0.5em', pt: 0.1}}>
            {t(serviceOrderTypeToString(serviceOrder.type))}
          </Typography>
        </Box>
        <Typography variant="caption">{dueDate}</Typography>
      </Box>
      <Typography
        variant="subtitle2"
        component="div"
        mt="0.5em"
        color="primary.dark">
        {serviceOrder.elevator.propertyOwner.name}
      </Typography>
      <Box display="flex" alignItems="center" py={0.25} gap={0.5}>
        <LocationOn fontSize="small" sx={{color: 'text.disabled'}} />
        <Typography variant="caption" color="textSecondary" pt={0.5}>
          {serviceOrder.elevator.address.fullName}
        </Typography>
      </Box>
      <Box display="flex" alignItems="center" py={0.25} pb={1.5} gap={0.5}>
        <Tag fontSize="small" sx={{color: 'text.disabled'}} />
        <Typography variant="caption" color="textSecondary" pt={0.5}>
          {serviceOrder.elevator.serialNumber || '-'}
        </Typography>
      </Box>

      <Button
        label={t('Assign Engineer')}
        style={{px: '0.5em'}}
        buttonProps={{
          onClick: () => setOpenDialog(true),
          size: 'medium',
          fullWidth: true,
          variant: 'outlined',
          sx: {
            bgcolor: 'transparent',
            '&:hover': {bgcolor: 'primary.dark', color: 'white'},
          },
        }}
      />

      <ScheduleDialog
        disableSaveBtn={!formValid}
        showSwitch
        validateDate={switchActive}
        switchState={switchActive}
        getSwitchState={(value: SetStateAction<boolean>) =>
          setSwitchActive(value)
        }
        title={t('Assign Engineer')}
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
    </Box>
  );
};

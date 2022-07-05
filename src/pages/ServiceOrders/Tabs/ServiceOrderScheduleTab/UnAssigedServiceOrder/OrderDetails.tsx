import {SetStateAction, useEffect, useState} from 'react';
import Box, {BoxProps} from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {ServiceOrderIcons} from 'components/ServiceOrderIcons';
import {
  JobScheduleType,
  ServiceOrderType,
  ServiceOrderView,
} from 'models/service-order';
import {Button} from 'components/Button';
import {formatDistance} from 'date-fns';
import Divider from '@mui/material/Divider';
import {useTranslation} from 'react-i18next';
import {isEmpty} from 'lodash';
import {FormikErrors} from 'formik';
import {ScheduleForm} from 'pages/ServiceOrderDetails/models';
import {ScheduleDialog} from 'pages/ServiceOrderDetails/Tabs/Overview/ScheduleDialog';
import {serviceOrderTypeToString} from 'utils/service-order-utils';
import {
  useRedispatchServiceOrders,
  useUpdateServiceOrder,
} from 'hooks/reactQuery/useServiceOrder';
import {setDateTime, formatDate as formatDateUtil} from 'utils/datetime';

interface Props extends BoxProps {
  serviceOrder: ServiceOrderView;
}

export const OrderDetails = ({serviceOrder, ...rest}: Props) => {
  const {t} = useTranslation();
  const [openDialog, setOpenDialog] = useState(false);
  const successMessage = 'Service order scheduled successfully';
  const {mutate: rescheduleServiceOrder} =
    useRedispatchServiceOrders(successMessage);
  const {mutate: scheduleServiceOrder} = useUpdateServiceOrder(successMessage);
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
    const orderStartTime = setDateTime(
      form?.date!,
      formatDateUtil(form.startTime as Date, 'HH:mm')!,
    ).toISOString();
    const orderEndTime = setDateTime(
      form?.date!,
      formatDateUtil(form.endTime as Date, 'HH:mm')!,
    ).toISOString();

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

  const formatDate = (date: string | number | Date) => {
    const formattedDate: string = formatDistance(new Date(date), new Date());

    const splitDate: string[] = formattedDate.split(' ');

    if (splitDate[0] === 'about') {
      // const finalDate: string = t(`${splitDate[0]} {{hours}} ${splitDate[2]}`, {
      //   hours: splitDate[1],
      // });
      const finalDate: string = t(`{{hours}} ${splitDate[2]}`, {
        hours: splitDate[1],
      });
      return finalDate;
    }

    const finalDate: string = t(`{{time}} ${splitDate[1]}`, {
      time: splitDate[0],
    });
    return finalDate;
  };

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
        <Typography variant="caption">
          {t('Due in')} {formatDate(serviceOrder.dueDate)}
          {/* {formatDistance(new Date(serviceOrder.dueDate), new Date()).split(" ")[0]==="about"? t(formatDistance(new Date(serviceOrder.dueDate), new Date()), {hours: formatDistance(new Date(serviceOrder.dueDate), new Date()).split("")[0]}):"hi"} */}
        </Typography>
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
          size: 'small',
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

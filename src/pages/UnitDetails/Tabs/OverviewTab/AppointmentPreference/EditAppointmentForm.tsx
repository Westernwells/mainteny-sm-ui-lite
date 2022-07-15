import {FormInput} from 'components/form/FormInput';
import {FormSelect} from 'components/form/FormSelect';
import {TimePicker} from 'components/TimePicker';
import {FormikProps} from 'formik';
import {AppointmentFormModel} from 'models/unitForm';
import {setDateTime} from 'utils/datetime';
import Grid from '@mui/material/Grid';
import {useTranslation} from 'react-i18next';
import {useFormatDate} from 'hooks/useFormatDate';

interface Props {
  formik: FormikProps<AppointmentFormModel>;
}

const daysOfWeekOptions = {
  Monday: 'Mo',
  Tuesday: 'Tu',
  Wednesday: 'We',
  Thursday: 'Th',
  Friday: 'Fr',
  Saturday: 'Sa',
  Sunday: 'Su',
};

export const EditAppointmentForm = ({formik}: Props) => {
  const formatDate = useFormatDate();
  const {t} = useTranslation();
  return (
    <Grid container spacing={2} sx={{mt: '0.5em'}} component="form">
      <Grid item sm={12}>
        <FormSelect
          labelId="daysOfWeek-label"
          label="Days of the week"
          options={Object.keys(daysOfWeekOptions).map((key) => ({
            label: key,
            value: daysOfWeekOptions[key as keyof typeof daysOfWeekOptions],
          }))}
          selectProps={{
            id: 'daysofWeekSelect',
            value: formik.values.appointmentDaysOfWeek,
            onChange: formik.handleChange,
            name: 'appointmentDaysOfWeek',
            multiple: true,
          }}
        />
      </Grid>

      <Grid item sm={12}>
        <TimePicker
          defaultTime={
            formik.values.openingHour
              ? setDateTime(new Date(), formik.values.openingHour)
              : undefined
          }
          getSelectedTime={(time) => {
            formik.setFieldValue(
              'openingHour',
              time instanceof Date && !Number.isNaN(time.valueOf())
                ? formatDate(time, 'HH:mm')
                : '',
            );
          }}
          textFieldProps={{
            label: t('Opening Hour'),
            name: 'openingHour',

            onBlur: formik.handleBlur,
          }}
        />
      </Grid>

      <Grid item sm={12}>
        <TimePicker
          defaultTime={
            formik.values.closingHour
              ? setDateTime(new Date(), formik.values.closingHour)
              : undefined
          }
          getSelectedTime={(time) => {
            formik.setFieldValue(
              'closingHour',
              time instanceof Date && !Number.isNaN(time.valueOf())
                ? formatDate(time, 'HH:mm')
                : '',
            );
          }}
          textFieldProps={{
            label: t('Closing Hour'),
            name: 'closingHour',

            onBlur: formik.handleBlur,
          }}
        />
      </Grid>

      <Grid item sm={12}>
        <FormSelect
          labelId="requiresAppointment-label"
          label="Requires Appointment"
          options={['YES', 'NO'].map((key) => ({
            label: key,
            value: key,
          }))}
          selectProps={{
            id: 'requiresAppointmentSelect',
            value: formik.values.requiresAppointment,
            onChange: formik.handleChange,
            name: 'requiresAppointment',
          }}
        />
      </Grid>

      <Grid item sm={12}>
        <FormSelect
          labelId="requirestNotification-label"
          label="Requires Notification"
          options={['YES', 'NO'].map((key) => ({
            label: key,
            value: key,
          }))}
          selectProps={{
            id: 'requirestNotificationSelect',
            value: formik.values.requiresAppointmentNotification,
            onChange: formik.handleChange,
            name: 'requiresAppointmentNotification',
          }}
        />
      </Grid>

      <Grid item sm={12}>
        <FormInput
          props={{
            label: t('Notification Due'),
            name: 'appointmentNotificationDueInDays',
            placeholder: t('E.g. 5 days'),
            value: formik.values.appointmentNotificationDueInDays,
            onChange: formik.handleChange,
            onBlur: formik.handleBlur,
          }}
        />
      </Grid>
    </Grid>
  );
};

import {Box} from '@mui/system';
import {FormInput} from 'components/form/FormInput';
import {FormSelect} from 'components/form/FormSelect';
import {FormikProps} from 'formik';
import {AppointmentFormModel} from '../models';

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

export const EditAppointmentForm = ({formik}: Props) => (
  <Box sx={{mt: '0.5em'}} component="form">
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

    <FormInput
      props={{
        label: 'Opening Hours',
        name: 'openingHours',
        placeholder: 'E.g 07:00 - 17:00',
        value: formik.values.openingHours,
        onChange: formik.handleChange,
        onBlur: formik.handleBlur,
      }}
    />
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

    <FormInput
      props={{
        label: 'Notification Due',
        name: 'appointmentNotificationDueInDays',
        placeholder: 'E.g 5 days',
        value: formik.values.appointmentNotificationDueInDays,
        onChange: formik.handleChange,
        onBlur: formik.handleBlur,
      }}
    />
  </Box>
);

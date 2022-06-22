import {Box} from '@mui/system';
import {FormInput} from 'components/form/FormInput';
import Grid from '@mui/material/Grid';
import {FormikErrors, useFormik} from 'formik';
import {AppointmentFormModel} from 'models/unitForm';
import {useEffect} from 'react';
import {PageCard} from 'components/PageCard';
import {FormSelect} from 'components/form/FormSelect';
import {TimePicker} from 'components/TimePicker';
import {formatDate, setDateTime} from 'utils/datetime';

interface Props {
  getAppointmentFormErrors?: (val: FormikErrors<AppointmentFormModel>) => void;
  getAppointmentFormValues?: (val: AppointmentFormModel) => void;
  initialValues?: AppointmentFormModel;
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

export const AppointmentPreferenceForm = ({
  getAppointmentFormErrors,
  getAppointmentFormValues,
  initialValues,
}: Props) => {
  const formik = useFormik<AppointmentFormModel>({
    initialValues: {
      appointmentDaysOfWeek: initialValues?.appointmentDaysOfWeek || [],
      openingHour: initialValues?.openingHour || '',
      closingHour: initialValues?.closingHour || '',
      requiresAppointment: initialValues?.requiresAppointment || '',
      requiresAppointmentNotification:
        initialValues?.requiresAppointmentNotification || '',
      appointmentNotificationDueInDays:
        initialValues?.appointmentNotificationDueInDays || '',
    },
    onSubmit: () => {},
  });

  useEffect(() => {
    if (getAppointmentFormErrors) {
      getAppointmentFormErrors(formik.errors);
    }

    if (getAppointmentFormValues) {
      getAppointmentFormValues(formik.values);
    }
  }, [formik]);

  return (
    <PageCard
      headerLabel="Appointment Preferences"
      containerStyles={{flexGrow: 1}}
      headerStyles={{mt: '0.5em'}}>
      <Box sx={{mt: '0.5em'}} component="form">
        <Grid container spacing={2}>
          <Grid item md={4}>
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

          <Grid item md={4}>
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
                label: 'Opening Hour',
                name: 'openingHour',

                onBlur: formik.handleBlur,
                helperText:
                  formik.errors.openingHour && formik.touched.openingHour
                    ? formik.errors.openingHour
                    : '',
              }}
            />
          </Grid>

          <Grid item md={4}>
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
                label: 'Closing Hour',
                name: 'closingHour',

                onBlur: formik.handleBlur,
              }}
            />
          </Grid>

          <Grid item md={4}>
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
            />{' '}
          </Grid>

          <Grid item md={4}>
            <FormSelect
              labelId="requirestNotification-label"
              label="Requires Notification"
              options={['YES', 'NO'].map((key) => ({
                label: key,
                value: key,
              }))}
              selectProps={{
                id: 'requirestNotificationSelect',
                // value: formik.values.requiresAppointmentNotification,
                onChange: formik.handleChange,
                name: 'requiresAppointmentNotification',
              }}
            />
          </Grid>

          <Grid item md={4}>
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
          </Grid>
        </Grid>
      </Box>
    </PageCard>
  );
};

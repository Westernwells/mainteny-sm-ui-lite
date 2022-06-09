/* eslint-disable */
import {Box} from '@mui/system';
import {AddressAutoComplete} from 'components/AddressAutoComplete';
import {FormInput} from 'components/form/FormInput';
import Grid from '@mui/material/Grid';
import {FormikErrors, FormikProps, FormikValues, useFormik} from 'formik';
import {AppointmentFormModel} from 'models/unitForm';
import * as Yup from 'yup';
import {useEffect} from 'react';
import {PageCard} from 'components/PageCard';
import {FormSelect} from 'components/form/FormSelect';

interface Props {
  getAppointmentFormErrors?: (val: FormikErrors<AppointmentFormModel>) => void;
  getAppointmentFormValues?: (val: FormikValues) => void;
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
      openingHours: initialValues?.openingHours || '',
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
      headerLabel="Location Information"
      containerStyles={{flexGrow: 1}}
      headerStyles={{mt: '0.5em'}}>
      <Box sx={{mt: '0.5em'}} component="form">
        <Grid container columnSpacing={2}>
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
                value: formik.values.requiresAppointmentNotification,
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

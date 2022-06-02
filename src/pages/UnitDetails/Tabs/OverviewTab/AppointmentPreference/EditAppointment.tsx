/* eslint-disable */

import {SelectChangeEvent} from '@mui/material';
import {Box} from '@mui/system';
import {DatePicker} from 'components/DatePicker';
import {FormInput} from 'components/form/FormInput';
import {FormSelect} from 'components/form/FormSelect';
import {FormikProps} from 'formik';
import {Priority} from 'models/misc';
import {convertToText} from 'utils/utils';
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

export const EditAppointmentForm = ({formik}: Props) => {
  return (
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

      {/* {console.log(formik.values, '|||||||')} */}

      {/* <FormSelect
    labelId="rolesSelect-label"
    label="Roles"
    options={Object.keys(Role)
      .filter((role) => role !== 'ADMIN')
      .map((role) => ({
        label: convertToText(role),
        value: convertToText(role)
      }))}
    selectProps={{
      id: 'rolesSelect',
      value: roles,
      onChange: handleRoleChange,
      multiple: true,
      name: 'role',
      disabled: true,
    }}
  /> */}

      {/* <DatePicker
    defaultDate={formik.values.lastInspectionDate}
    getSelectedDate={(date) =>
      formik.setFieldValue('lastInspectionDate', date)
    }
    textFieldProps={{
      label: 'Last Inspection',
      name: 'lastInspectionDate',
      helperText:
        formik.errors.lastInspectionDate && formik.touched.lastInspectionDate
          ? formik.errors.lastInspectionDate
          : '',
      error: !!(
        formik.errors.lastInspectionDate && formik.touched.lastInspectionDate
      ),
      onBlur: formik.handleBlur,
    }}
  />

  <FormInput
    props={{
      disabled: true,
      label: 'Visits per Year',
      name: 'VisitsPerYear',
      value: formik.values.visitsPerYear,
      onChange: formik.handleChange,
      onBlur: formik.handleBlur,
    }}
  />

  <FormInput
    props={{
      label: 'Time',
      name: 'serviceTime',
      placeholder: 'In minutes',
      value: formik.values.serviceTime,
      helperText:
        formik.errors.serviceTime && formik.touched.serviceTime
          ? formik.errors.serviceTime
          : '',
      error: !!(formik.errors.serviceTime && formik.touched.serviceTime),
      onChange: formik.handleChange,
      onBlur: formik.handleBlur,
    }}
  />
  <FormInput
    props={{
      label: 'No. of Technicians',
      name: 'technicianNumber',
      value: formik.values.technicianNumber,
      helperText:
        formik.errors.technicianNumber && formik.touched.technicianNumber
          ? formik.errors.technicianNumber
          : '',
      error: !!(
        formik.errors.technicianNumber && formik.touched.technicianNumber
      ),
      onChange: formik.handleChange,
      onBlur: formik.handleBlur,
    }}
  /> */}

      {/* <FormSelect
    labelId="prioritySelect-label"
    label="Priority"
    options={Object.keys(Priority).map((item) => convertToText(item))}
    selectProps={{
      id: 'prioritySelect',
      value: formik.values.priority ? [formik.values.priority] : undefined,
      onChange: formik.handleChange,
      name: 'priority',
    }}
  /> */}
    </Box>
  );
};

import {Box} from '@mui/system';
import {DatePicker} from 'components/DatePicker';
import {FormInput} from 'components/form/FormInput';
import {FormSelect} from 'components/form/FormSelect';
import {FormikProps} from 'formik';
import {Priority} from 'models/misc';
import {convertToText} from 'utils/utils';
import {ServiceFormModel} from '../models';

interface Props {
  formik: FormikProps<ServiceFormModel>;
}

export const EditServiceForm = ({formik}: Props) => (
  <Box sx={{mt: '0.5em'}} component="form">
    <DatePicker
      defaultDate={formik.values.lastVisitDate}
      getSelectedDate={(date) => formik.setFieldValue('lastVisitDate', date)}
      textFieldProps={{
        label: 'Last Visit',
        name: 'lastVisitDate',
        helperText:
          formik.errors.lastVisitDate && formik.touched.lastVisitDate
            ? formik.errors.lastVisitDate
            : '',
        error: !!(formik.touched.lastVisitDate && formik.errors.lastVisitDate),
        onBlur: formik.handleBlur,
      }}
    />

    <DatePicker
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
    />

    <FormSelect
      labelId="prioritySelect-label"
      label="Priority"
      options={Object.keys(Priority).map((key) => ({
        label: convertToText(key),
        value: convertToText(key),
      }))}
      selectProps={{
        id: 'prioritySelect',
        value: formik.values.priority ? formik.values.priority : undefined,
        onChange: formik.handleChange,
        name: 'priority',
      }}
    />
  </Box>
);

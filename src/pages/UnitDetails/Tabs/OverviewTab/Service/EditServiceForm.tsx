import {DatePicker} from 'components/DatePicker';
import {FormInput} from 'components/form/FormInput';
import {FormSelect} from 'components/form/FormSelect';
import {FormikProps} from 'formik';
import Grid from '@mui/material/Grid';
import {Priority} from 'models/misc';
import {ServiceFormModel} from 'models/unitForm';
import {convertToText} from 'utils/utils';
import {useTranslation} from 'react-i18next';

interface Props {
  formik: FormikProps<ServiceFormModel>;
}

export const EditServiceForm = ({formik}: Props) => {
  const {t} = useTranslation();
  return (
    <Grid container spacing={2} sx={{mt: '0.5em'}} component="form">
      <Grid item sm={12}>
        <DatePicker
          defaultDate={formik.values.lastVisitDate}
          getSelectedDate={(date) =>
            formik.setFieldValue('lastVisitDate', date)
          }
          textFieldProps={{
            label: t('Last Visit'),
            name: 'lastVisitDate',
            helperText:
              formik.errors.lastVisitDate && formik.touched.lastVisitDate
                ? formik.errors.lastVisitDate
                : '',
            error: !!(
              formik.touched.lastVisitDate && formik.errors.lastVisitDate
            ),
            onBlur: formik.handleBlur,
          }}
        />
      </Grid>

      <Grid item sm={12}>
        <DatePicker
          defaultDate={formik.values.lastInspectionDate}
          getSelectedDate={(date) =>
            formik.setFieldValue('lastInspectionDate', date)
          }
          textFieldProps={{
            label: t('Last Inspection'),
            name: 'lastInspectionDate',
            helperText:
              formik.errors.lastInspectionDate &&
              formik.touched.lastInspectionDate
                ? formik.errors.lastInspectionDate
                : '',
            error: !!(
              formik.errors.lastInspectionDate &&
              formik.touched.lastInspectionDate
            ),
            onBlur: formik.handleBlur,
          }}
        />
      </Grid>

      <Grid item sm={12}>
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
      </Grid>

      <Grid item sm={12}>
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
      </Grid>

      <Grid item sm={12}>
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
      </Grid>

      <Grid item sm={12}>
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
      </Grid>
    </Grid>
  );
};

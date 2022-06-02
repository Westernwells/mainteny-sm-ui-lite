import {Box} from '@mui/system';
import {DatePicker} from 'components/DatePicker';
import {FormikProps} from 'formik';
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
        error: !!(formik.errors.lastVisitDate && formik.touched.lastVisitDate),
        onBlur: formik.handleBlur,
        sx: {width: '100%'},
      }}
    />
  </Box>
);

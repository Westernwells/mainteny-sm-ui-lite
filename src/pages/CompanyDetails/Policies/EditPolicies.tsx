import {FormikProps} from 'formik';
import {FormInput} from 'components/form/FormInput';
import {PoliciesCompanyFormModel} from './model';

interface Props {
  formik: FormikProps<PoliciesCompanyFormModel>;
}

export const EditPolicies = ({formik}: Props) => (
  <FormInput
    fieldProps={{
      size: 'small',
      placeholder: 'e.g. 30',
      label: 'Yearly vacation days',
      name: 'totalYearlyVacationDaysAllowed',
      type: 'number',
      helperText:
        formik.touched.totalYearlyVacationDaysAllowed &&
        formik.errors.totalYearlyVacationDaysAllowed,
      error:
        !!formik.errors.totalYearlyVacationDaysAllowed &&
        formik.touched.totalYearlyVacationDaysAllowed,
      required: true,
      value: formik.values.totalYearlyVacationDaysAllowed,
      InputLabelProps: {shrink: true},
      onChange: formik.handleChange,
      onBlur: formik.handleBlur,
      inputProps: {min: 0},
    }}
  />
);

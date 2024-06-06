import {FormikProps} from 'formik';
import Grid from '@mui/material/Grid';

import {FormInput} from 'components/form/FormInput';
import {LegalInformationCompanyFormModel} from './model';

interface Props {
  formik: FormikProps<LegalInformationCompanyFormModel>;
}

export const EditLegalInformation = ({formik}: Props) => {
  const defaultProps = {
    InputLabelProps: {shrink: true},
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
  };

  return (
    <Grid container component="form" spacing={3}>
      <Grid item xs={12}>
        <FormInput
          props={{
            size: 'small',
            placeholder: 'e.g. Cable xyz',
            label: 'Managing director',
            name: 'managingDirector',
            helperText:
              formik.touched.managingDirector && formik.errors.managingDirector,
            error:
              !!formik.errors.managingDirector &&
              formik.touched.managingDirector,
            required: true,
            value: formik.values.managingDirector,
            ...defaultProps,
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <FormInput
          props={{
            size: 'small',
            placeholder: 'e.g. Cable xyz',
            label: 'Arbitration court',
            name: 'arbitrationCourt',
            required: true,
            helperText:
              formik.touched.arbitrationCourt && formik.errors.arbitrationCourt,
            error:
              !!formik.errors.arbitrationCourt &&
              formik.touched.arbitrationCourt,
            value: formik.values.arbitrationCourt,
            ...defaultProps,
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <FormInput
          props={{
            size: 'small',
            placeholder: 'e.g. Cable xyz',
            label: 'Trade registration number',
            name: 'tradeRegisterNumber',
            required: true,
            helperText:
              formik.touched.tradeRegisterNumber &&
              formik.errors.tradeRegisterNumber,
            error:
              !!formik.errors.tradeRegisterNumber &&
              formik.touched.tradeRegisterNumber,
            value: formik.values.tradeRegisterNumber,
            ...defaultProps,
          }}
        />
      </Grid>
    </Grid>
  );
};

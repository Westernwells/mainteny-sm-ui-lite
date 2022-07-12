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
    <Grid container sx={{mt: '0.5em'}} component="form" spacing={2}>
      <Grid item xs={12}>
        <FormInput
          props={{
            size: 'small',
            placeholder: 'e.g. Cable xyz',
            label: 'Managing Director',
            name: 'managingDirector',
            helperText:
              formik.touched.managingDirector && formik.errors.managingDirector,
            error:
              !!formik.errors.managingDirector &&
              formik.touched.managingDirector,
            required: true,
            value: formik.values.managingDirector,
            sx: {mb: '1em'},
            ...defaultProps,
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <FormInput
          props={{
            size: 'small',
            placeholder: 'e.g. Cable xyz',
            label: 'Arbitration Court',
            name: 'arbitrationCourt',
            required: true,
            helperText:
              formik.touched.arbitrationCourt && formik.errors.arbitrationCourt,
            error:
              !!formik.errors.arbitrationCourt &&
              formik.touched.arbitrationCourt,
            value: formik.values.arbitrationCourt,
            sx: {mb: '1em'},
            ...defaultProps,
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <FormInput
          props={{
            size: 'small',
            placeholder: 'e.g. Cable xyz',
            label: 'Trade Register Number',
            name: 'tradeRegisterNumber',
            required: true,
            helperText:
              formik.touched.tradeRegisterNumber &&
              formik.errors.tradeRegisterNumber,
            error:
              !!formik.errors.tradeRegisterNumber &&
              formik.touched.tradeRegisterNumber,
            value: formik.values.tradeRegisterNumber,
            sx: {mb: '1em'},
            ...defaultProps,
          }}
        />
      </Grid>
    </Grid>
  );
};

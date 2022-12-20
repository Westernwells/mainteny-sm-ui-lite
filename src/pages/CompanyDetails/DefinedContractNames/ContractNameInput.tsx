import {FormikProps} from 'formik';
import Grid from '@mui/material/Grid';
import {FormInput} from 'components/form/FormInput';
import {ContractNameFormModel} from './model';

interface Props {
  formik: FormikProps<ContractNameFormModel>;
}

export const ContractNameInput = ({formik}: Props) => (
  <Grid
    container
    sx={{mt: '0.5em'}}
    component="form"
    onSubmit={formik.handleSubmit}
    spacing={2}>
    <Grid item xs={12}>
      <FormInput
        props={{
          size: 'small',
          placeholder: 'e.g. Premium',
          label: 'Contract name',
          name: 'contractName',
          type: 'string',
          helperText: formik.touched.contractName && formik.errors.contractName,
          error: !!formik.errors.contractName && formik.touched.contractName,
          required: true,
          value: formik.values.contractName,
          InputLabelProps: {shrink: true},
          onChange: formik.handleChange,
          onBlur: formik.handleBlur,
        }}
      />
    </Grid>
  </Grid>
);

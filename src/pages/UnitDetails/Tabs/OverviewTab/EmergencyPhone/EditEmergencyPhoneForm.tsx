import {FormikProps} from 'formik';
import Grid from '@mui/material/Grid';
import {EmergencyPhoneFormModel} from 'models/unitForm';
import {FormInput} from 'components/form/FormInput';

interface Props {
  formik: FormikProps<EmergencyPhoneFormModel>;
}

export const EditEmergencyPhoneForm = ({formik}: Props) => (
  <Grid container spacing={2} sx={{mt: '0.5em'}} component="form">
    <Grid item sm={12}>
      <FormInput
        props={{
          label: 'Manufacturer',
          name: 'manufacturer',
          value: formik.values.manufacturer,
          onChange: formik.handleChange,
          onBlur: formik.handleBlur,
        }}
      />
    </Grid>
    <Grid item sm={12}>
      <FormInput
        props={{
          label: 'System ID',
          name: 'systemId',
          value: formik.values.systemId,
          onChange: formik.handleChange,
          onBlur: formik.handleBlur,
        }}
      />
    </Grid>
    <Grid item sm={12}>
      <FormInput
        props={{
          label: 'Phone Connection',
          name: 'phoneConnection',
          value: formik.values.phoneConnection,
          onChange: formik.handleChange,
          onBlur: formik.handleBlur,
        }}
      />
    </Grid>
    <Grid item sm={12}>
      <FormInput
        props={{
          label: 'Phone Number',
          name: 'phoneNumber',
          value: formik.values.phoneNumber,
          onChange: formik.handleChange,
          onBlur: formik.handleBlur,
        }}
      />
    </Grid>
    <Grid item sm={12}>
      <FormInput
        props={{
          label: 'Sim Card Number',
          name: 'simCardNumber',
          value: formik.values.simCardNumber,
          onChange: formik.handleChange,
          onBlur: formik.handleBlur,
        }}
      />
    </Grid>
    <Grid item sm={12}>
      <FormInput
        props={{
          label: 'Sim Pin ',
          name: 'simPin',
          value: formik.values.simPin,
          onChange: formik.handleChange,
          onBlur: formik.handleBlur,
        }}
      />
    </Grid>
    <Grid item sm={12}>
      <FormInput
        props={{
          label: 'Call Center',
          name: 'callCenter',
          value: formik.values.callCenter,
          onChange: formik.handleChange,
          onBlur: formik.handleBlur,
        }}
      />
    </Grid>
    <Grid item sm={12}>
      <FormInput
        props={{
          label: 'Place Of Installation',
          name: 'placeOfInstallation',
          value: formik.values.placeOfInstallation,
          onChange: formik.handleChange,
          onBlur: formik.handleBlur,
        }}
      />
    </Grid>
  </Grid>
);

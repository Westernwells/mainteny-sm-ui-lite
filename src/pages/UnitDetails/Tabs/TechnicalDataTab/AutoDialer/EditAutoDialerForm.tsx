import Grid from '@mui/material/Grid';
import {FormInput} from 'components/form/FormInput';
import {AutoDialerFormModel} from 'models/unitForm';
import {UseFormRegister} from 'react-hook-form';

interface Props {
  register: UseFormRegister<AutoDialerFormModel>;
}

const EditAutoDialerForm = ({register}: Props) => (
  <Grid container spacing={2} component="form">
    <Grid item md={6}>
      <FormInput
        props={{
          type: 'text',
          label: 'Manufacturer',
          ...register('emergencyPhoneProvider'),
        }}
      />
    </Grid>
    <Grid item md={6}>
      <FormInput
        props={{
          label: 'System ID',
          type: 'text',
          ...register('systemId'),
        }}
      />
    </Grid>
    <Grid item md={6}>
      <FormInput
        props={{
          label: 'Phone connection',
          type: 'text',
          ...register('phoneConnection'),
        }}
      />
    </Grid>
    <Grid item md={6}>
      <FormInput
        props={{
          label: 'Phone number',
          type: 'text',
          ...register('phoneNumber'),
        }}
      />
    </Grid>
    <Grid item md={6}>
      <FormInput
        props={{
          label: 'SIM card number',
          type: 'text',
          ...register('simCardNumber'),
        }}
      />
    </Grid>
    <Grid item md={6}>
      <FormInput
        props={{
          label: 'SIM pin',
          type: 'text',
          ...register('simPin'),
        }}
      />
    </Grid>
    <Grid item md={6}>
      <FormInput
        props={{
          label: 'Call center',
          type: 'text',
          ...register('callCenter'),
        }}
      />
    </Grid>
    <Grid item md={6}>
      <FormInput
        props={{
          label: 'Place of installation',
          type: 'text',
          ...register('placeOfInstallation'),
        }}
      />
    </Grid>
  </Grid>
);

export default EditAutoDialerForm;

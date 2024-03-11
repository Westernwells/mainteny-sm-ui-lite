import Grid from '@mui/material/Grid';
import {FormInput} from 'components/form/FormInput';
import {TechnicalDataFormModel} from 'models/unitForm';
import {UseFormRegister} from 'react-hook-form';

interface Props {
  register: UseFormRegister<TechnicalDataFormModel>;
}

const EditTechnicalDataForm = ({register}: Props) => (
  <Grid container spacing={2} component="form">
    <Grid item md={4}>
      <FormInput
        props={{
          placeholder: 'Can also be number of floors',
          type: 'number',
          label: 'Number of stops',
          ...register('numberOfStops'),
        }}
      />
    </Grid>
    <Grid item md={4}>
      <FormInput
        props={{
          placeholder: 'Gearless',
          label: 'Drive',
          type: 'text',
          ...register('drive'),
        }}
      />
    </Grid>
    <Grid item md={4}>
      <FormInput
        props={{
          placeholder: '1000',
          type: 'number',
          label: 'Capacity (kg)',
          ...register('capacity'),
        }}
      />
    </Grid>
    <Grid item md={4}>
      <FormInput
        props={{
          placeholder: '1.5',
          label: 'Speed (m/s)',
          type: 'number',
          ...register('speed'),
        }}
      />
    </Grid>
    <Grid item md={4}>
      <FormInput
        props={{
          placeholder: '24 key input',
          label: 'Controller',
          type: 'text',
          ...register('controller'),
        }}
      />
    </Grid>
    <Grid item md={4}>
      <FormInput
        props={{
          placeholder: 'IoT IT',
          label: 'IoT device',
          type: 'text',
          ...register('iotDevice'),
        }}
      />
    </Grid>
    <Grid item md={4}>
      <FormInput
        props={{
          placeholder: 'Single door; Double door',
          label: 'Cabin type',
          type: 'text',
          ...register('cabinType'),
        }}
      />
    </Grid>
    <Grid item md={4}>
      <FormInput
        props={{
          placeholder: '1500',
          label: 'Cage weight (kg)',
          type: 'number',
          ...register('cageWeight'),
        }}
      />
    </Grid>
    <Grid item md={4}>
      <FormInput
        props={{
          placeholder: '1500',
          label: 'Counter weight (kg)',
          type: 'number',
          ...register('counterWeight'),
        }}
      />
    </Grid>
    <Grid item md={6}>
      <FormInput
        props={{
          placeholder: '240',
          label: 'Hoisting height (m)',
          type: 'number',
          ...register('hoistingHeight'),
        }}
      />
    </Grid>
    <Grid item md={6}>
      <FormInput
        props={{
          placeholder: '150',
          label: 'Shaft height (m)',
          type: 'number',
          ...register('shaftHeight'),
        }}
      />
    </Grid>
  </Grid>
);

export default EditTechnicalDataForm;

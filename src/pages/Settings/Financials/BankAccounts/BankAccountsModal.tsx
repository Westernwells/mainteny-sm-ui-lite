import {UseFormReturn} from 'react-hook-form';
import {Box, Grid} from '@mui/material';
import {FormInput} from 'components/form/FormInput';
import {PaymentInfo} from 'models/misc';

interface Props {
  form: UseFormReturn<PaymentInfo>;
}

export const BankAccountsModal = ({form}: Props) => (
  <Grid container component="form" rowGap={3}>
    <FormInput
      props={{
        size: 'small',
        label: 'Bank name',
        required: true,
        ...form.register('bankName', {required: true}),
      }}
    />

    <FormInput
      props={{
        size: 'small',
        label: 'IBAN',
        required: true,
        ...form.register('iban', {required: true}),
      }}
    />

    <Box display="flex" gap={1.5} width="100%">
      <FormInput
        props={{
          type: 'number',
          size: 'small',
          label: 'Account number',
          ...form.register('accountNumber'),
        }}
      />

      <FormInput
        props={{
          size: 'small',
          label: 'BIC',
          ...form.register('bic'),
        }}
      />
    </Box>
  </Grid>
);

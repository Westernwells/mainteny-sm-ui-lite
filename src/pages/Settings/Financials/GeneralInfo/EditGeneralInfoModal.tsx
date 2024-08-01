import {UseFormReturn} from 'react-hook-form';
import {t} from 'i18next';
import {FormControl, InputLabel, MenuItem, Select, Grid} from '@mui/material';
import {FormInput} from 'components/form/FormInput';
import {FormSelect} from 'components/form/FormSelect';
import {AccountSystems, ServiceCompanyUpdateBody} from 'models/service-company';
import {useCurrentCurrency} from 'utils/currency';
import {DatePicker} from 'components/DatePicker';
import {useState} from 'react';

export type Props = {
  form: UseFormReturn<Partial<ServiceCompanyUpdateBody>>;
};

export const EditGeneralInfoModal = ({form}: Props) => {
  const currentCurrency = useCurrentCurrency();
  const [resetfiscalYearStartPicker, setResetfiscalYearStartPicker] =
    useState(false);

  return (
    <Grid container rowGap={3}>
      <Grid item xs={12}>
        <FormInput
          fieldProps={{
            size: 'small',
            placeholder: 'e.g. DE 123456789',
            label: 'VAT ID',
            required: true,
            ...form.register('vatId', {required: true}),
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <FormInput
          fieldProps={{
            size: 'small',
            placeholder: 'e.g. 123456789',
            label: 'Tax ID',
            required: true,
            ...form.register('taxNumber', {required: true}),
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <FormControl fullWidth>
          <InputLabel id="select-account-system-label">
            {t('Account system')}
          </InputLabel>
          <Select
            id="select-account-system"
            labelId="select-account-system-label"
            label={t('Account system')}
            size="small"
            value={form.watch('accountSystem') || ''}
            {...form.register('accountSystem')}>
            {Object.entries(AccountSystems).map(([key, val]) => (
              <MenuItem value={key} key={key}>
                {t(val)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <FormSelect
          label="Currency"
          labelId="select-currency-label"
          options={[
            {
              label: `${currentCurrency.symbol} - ${currentCurrency.code}`,
              value: currentCurrency.code,
            },
          ]}
          selectProps={{
            id: 'select-currency',
            value: currentCurrency.code,
            disabled: true,
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <FormInput
          fieldProps={{
            size: 'small',
            placeholder: 'e.g. 123456789',
            label: 'Accountant number',
            required: false,
            ...form.register('accountantNumber', {required: false}),
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <FormInput
          fieldProps={{
            size: 'small',
            placeholder: 'e.g. 123456789',
            label: 'Client number',
            required: false,
            ...form.register('clientNumber', {required: false}),
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <DatePicker
          defaultDate={
            form.getValues().fiscalYearStart
              ? new Date(form.getValues().fiscalYearStart!)
              : null
          }
          reset={resetfiscalYearStartPicker}
          getReset={(_reset) => {
            if (_reset) {
              setResetfiscalYearStartPicker(false);
            }
          }}
          errorMessage={form.getFieldState('fiscalYearStart').error?.message}
          getSelectedDate={(newValue) => {
            if (newValue) {
              form.setValue('fiscalYearStart', newValue.toISOString());
            }
          }}
          textFieldProps={{
            label: 'Start of the fiscal year',
          }}
          required
        />
      </Grid>
    </Grid>
  );
};

import {useCallback, useEffect} from 'react';
import {Grid2 as Grid} from '@mui/material';
import {countriesOptions, getStatesByCountry} from 'utils/countries';
import {FormInput} from 'components/form/FormInput';
import {FormSelect} from 'components/form/FormSelect';
import {AddressAutoComplete} from 'components/AddressAutoComplete';
import {useTranslation} from 'react-i18next';
import {
  Control,
  Controller,
  FieldErrors,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
import {AddressRecord} from 'models/misc';
import {CustomerFinanceFormModel} from 'models/customer';

export const EditFinanceAddress = ({
  control,
  setValue,
  errors,
  address,
  watch,
}: {
  control: Control<CustomerFinanceFormModel>;
  setValue: UseFormSetValue<CustomerFinanceFormModel>;
  errors: FieldErrors<CustomerFinanceFormModel>;
  address: 'otherAddress' | 'beneficiaryAddress';
  watch: UseFormWatch<CustomerFinanceFormModel>;
}) => {
  const {t} = useTranslation();

  const addressValue = watch(`${address}.component.name`);
  const countryValue = watch(`${address}.component.country`);

  const statesByCountry = useCallback(
    (country?: string) => getStatesByCountry(country ?? ''),
    [],
  );

  useEffect(() => {
    if (addressValue) {
      setValue(`${address}.component.name`, addressValue);
    }
  }, [address, addressValue]);

  return (
    <Grid container rowSpacing={3} columnSpacing={2}>
      <Grid size={{md: 6}}>
        <Controller
          name={`${address}.component.name`}
          control={control}
          render={({field}) => (
            <FormInput
              fieldProps={{
                ...field,
                size: 'small',
                label: 'Name',
              }}
            />
          )}
        />
      </Grid>
      <Grid size={{md: 6}}>
        <AddressAutoComplete
          initialValue={watch(`${address}.component.street`) || ''}
          initialAddress={watch(`${address}`) as AddressRecord | undefined}
          inputError={errors?.[address]?.fullName?.message || ''}
          textFieldProps={{
            id: `${address}.component.street`,
            placeholder: t('e.g. 34-36 Exmouth Market, London EC1R 4QE'),
            name: `${address}.component.street`,
            label: 'Address line 1',
          }}
          allowMap
          getAddress={(componentAddress) => {
            const currentValues = watch(address);

            const newValue = {
              ...(componentAddress ?? {}),
              component: {
                ...(currentValues?.component ?? {}),
                ...(componentAddress?.component ?? {}),
              },
              id: currentValues?.id!,
              fullName: componentAddress?.fullName || '',
            };

            setValue(address, newValue);
          }}
          shortAddress
        />
      </Grid>
      <Grid size={{md: 6}}>
        <Controller
          name={`${address}.component.street2`}
          control={control}
          render={({field}) => (
            <FormInput
              fieldProps={{
                ...field,
                size: 'small',
                label: 'Address line 2',
              }}
            />
          )}
        />
      </Grid>
      <Grid size={{md: 3.5}}>
        <Controller
          name={`${address}.component.city`}
          control={control}
          render={({field}) => (
            <FormInput
              fieldProps={{
                ...field,
                id: 'city',
                size: 'small',
                label: 'City',
              }}
            />
          )}
        />
      </Grid>
      <Grid size={{md: 2.5}}>
        <Controller
          name={`${address}.component.postalCode`}
          control={control}
          render={({field}) => (
            <FormInput
              fieldProps={{
                ...field,
                id: 'postalCode',
                size: 'small',
                label: 'ZIP/Postal Code',
              }}
            />
          )}
        />
      </Grid>
      <Grid size={{md: 3}}>
        <Controller
          name={`${address}.component.country`}
          control={control}
          render={({field}) => (
            <FormSelect
              labelId={`${address}.component.country`}
              label="Country"
              options={countriesOptions}
              errorText={errors?.[address]?.component?.country?.message || ''}
              selectProps={{
                ...field,
                multiple: false,
              }}
              isCompanyTranslation
            />
          )}
        />
      </Grid>
      <Grid size={{md: 3}}>
        <Controller
          name={`${address}.component.state`}
          control={control}
          render={({field}) => (
            <FormSelect
              labelId={`${address}.component.state`}
              label="State/Province/Region"
              options={statesByCountry(countryValue)}
              selectProps={{
                ...field,
                multiple: false,
              }}
              isCompanyTranslation
            />
          )}
        />
      </Grid>
    </Grid>
  );
};

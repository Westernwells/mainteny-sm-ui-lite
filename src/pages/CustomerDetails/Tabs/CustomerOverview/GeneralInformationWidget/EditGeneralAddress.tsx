import {useCallback} from 'react';
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
import {CustomerGeneralInformationFormModel} from 'models/customer';

export const EditGeneralAddress = ({
  control,
  setValue,
  errors,
  address,
  watch,
}: {
  control: Control<CustomerGeneralInformationFormModel>;
  setValue: UseFormSetValue<CustomerGeneralInformationFormModel>;
  errors: FieldErrors<CustomerGeneralInformationFormModel>;
  address: 'postalAddress' | 'businessAddress' | 'billingAddress';
  watch: UseFormWatch<CustomerGeneralInformationFormModel>;
}) => {
  const {t} = useTranslation();

  const countryValue = watch(`${address}.component.country`);

  const statesByCountry = useCallback(
    (country?: string) => getStatesByCountry(country ?? ''),
    [],
  );

  return (
    <Grid container rowSpacing={3} columnSpacing={2}>
      <Grid size={{md: 6}}>
        <AddressAutoComplete
          initialValue={
            watch(`${address}.component.street`) ||
            watch(`${address}.fullName`) ||
            ''
          }
          initialAddress={watch(`${address}`) as AddressRecord | undefined}
          inputError={errors?.[address]?.fullName?.message || ''}
          textFieldProps={{
            id: `${address}.fullName`,
            placeholder: t('e.g. 34-36 Exmouth Market, London EC1R 4QE'),
            name: `${address}.fullName`,
            label: 'Address line 1',
            ...(address === 'billingAddress' && {
              required: true,
              helperText: errors?.[address]?.fullName?.message || '',
              error: !!errors?.[address]?.fullName,
            }),
          }}
          allowMap
          getAddress={(componentAddress) => {
            const currentValues = watch(address);

            setValue(address, {
              ...currentValues,

              component: {
                ...currentValues?.component,
                ...componentAddress?.component,
              },
              id: currentValues?.id!,
              fullName: componentAddress?.fullName || '',
            });
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
                ...(address === 'billingAddress' && {
                  required: true,
                  helperText: errors?.[address]?.component?.city?.message || '',
                  error: !!errors?.[address]?.component?.city,
                }),
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
                ...(address === 'billingAddress' && {
                  required: true,
                  helperText:
                    errors?.[address]?.component?.postalCode?.message || '',
                  error: !!errors?.[address]?.component?.postalCode,
                }),
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
                ...(address === 'billingAddress' && {
                  required: true,
                  error: !!errors?.[address]?.component?.country,
                }),
              }}
              required={address === 'billingAddress'}
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

      {address === 'billingAddress' && (
        <Grid size={{xs: 6}}>
          <Controller
            name="billingEmail"
            control={control}
            render={({field}) => (
              <FormInput
                fieldProps={{
                  size: 'small',
                  label: 'Billing email address',
                  ...field,
                }}
              />
            )}
          />
        </Grid>
      )}
    </Grid>
  );
};

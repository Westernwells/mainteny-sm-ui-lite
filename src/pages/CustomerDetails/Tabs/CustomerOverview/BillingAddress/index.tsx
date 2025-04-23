import {useCallback, useEffect} from 'react';
import {Box, Grid2 as Grid} from '@mui/material';
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
import NameFields from 'components/BillingAddress/NameFields';
import {formatAutocompleteAddress} from 'utils/utils';

const BillingAddress = ({
  control,
  setValue,
  errors,
  watch,
}: {
  control: Control<CustomerFinanceFormModel>;
  setValue: UseFormSetValue<CustomerFinanceFormModel>;
  errors: FieldErrors<CustomerFinanceFormModel>;
  watch: UseFormWatch<CustomerFinanceFormModel>;
}) => {
  const {t} = useTranslation();

  const countryValue = watch(`billingAddress.component.country`);

  const watchName = watch(`billingAddress.component.name`);
  const watchName2 = watch(`billingAddress.component.name2`);
  const watchName3 = watch(`billingAddress.component.name3`);

  const statesByCountry = useCallback(
    (country?: string) => getStatesByCountry(country ?? ''),
    [],
  );

  const handleAddressChange = (componentAddress: AddressRecord | undefined) => {
    const currentValues = watch('billingAddress');

    setValue(
      'billingAddress',
      formatAutocompleteAddress(currentValues, componentAddress),
    );
  };

  useEffect(() => {
    if (watchName) {
      setValue(`billingAddress.component.name`, watchName);
    }
  }, [watchName]);

  useEffect(() => {
    if (watchName2) {
      setValue(`billingAddress.component.name2`, watchName2);
    }
  }, [watchName2]);

  useEffect(() => {
    if (watchName3) {
      setValue(`billingAddress.component.name3`, watchName3);
    }
  }, [watchName3]);

  return (
    <Box sx={{display: 'flex', flexDirection: 'column'}} gap={3}>
      <NameFields
        name={watchName}
        name2={watchName2}
        name3={watchName3}
        fieldWidth="28%"
        setName={(name: string | null) =>
          setValue('billingAddress.component.name', name ?? undefined)
        }
        setName2={(name2: string | null) =>
          setValue('billingAddress.component.name2', name2 ?? undefined)
        }
        setName3={(name3: string | null) =>
          setValue('billingAddress.component.name3', name3 ?? undefined)
        }
      />

      <Grid container rowSpacing={3} columnSpacing={2}>
        <Grid size={{md: 6}}>
          <AddressAutoComplete
            initialValue={watch(`billingAddress.component.street`) || ''}
            initialAddress={watch(`billingAddress`) || undefined}
            inputError={
              errors?.billingAddress?.component?.street?.message || ''
            }
            textFieldProps={{
              id: `billingAddress.component.street`,
              placeholder: t('e.g. 34-36 Exmouth Market, London EC1R 4QE'),
              name: `billingAddress.component.street`,
              label: 'Address line 1',
              required: true,
              helperText:
                errors?.billingAddress?.component?.street?.message || '',
              error: !!errors?.billingAddress?.component?.street,
            }}
            allowMap
            getAddress={handleAddressChange}
            shortAddress
          />
        </Grid>
        <Grid size={{md: 6}}>
          <Controller
            name="billingAddress.component.street2"
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
            name="billingAddress.component.city"
            control={control}
            render={({field}) => (
              <FormInput
                fieldProps={{
                  ...field,
                  id: 'city',
                  size: 'small',
                  label: 'City',
                  required: true,
                  helperText:
                    errors?.billingAddress?.component?.city?.message || '',
                  error: !!errors?.billingAddress?.component?.city,
                }}
              />
            )}
          />
        </Grid>
        <Grid size={{md: 2.5}}>
          <Controller
            name="billingAddress.component.postalCode"
            control={control}
            render={({field}) => (
              <FormInput
                fieldProps={{
                  ...field,
                  id: 'postalCode',
                  size: 'small',
                  label: 'ZIP/Postal Code',
                  required: true,
                  helperText:
                    errors?.billingAddress?.component?.postalCode?.message ||
                    '',
                  error: !!errors?.billingAddress?.component?.postalCode,
                }}
              />
            )}
          />
        </Grid>
        <Grid size={{md: 3}}>
          <Controller
            name="billingAddress.component.country"
            control={control}
            render={({field}) => (
              <FormSelect
                labelId="billingAddress.component.country"
                label="Country"
                resetOption={{label: t('Select country')}}
                options={countriesOptions}
                errorText={
                  errors?.billingAddress?.component?.country?.message || ''
                }
                selectProps={{
                  ...field,
                  multiple: false,
                  required: true,
                  error: !!errors?.billingAddress?.component?.country,
                }}
                required
                isCompanyTranslation
              />
            )}
          />
        </Grid>
        <Grid size={{md: 3}}>
          <Controller
            name="billingAddress.component.state"
            control={control}
            render={({field}) => (
              <FormSelect
                labelId="billingAddress.component.state"
                label="State/Province/Region"
                resetOption={{label: t('Select country')}}
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

        <Grid size={{md: 6}}>
          <Controller
            name="billingAddress.component.moreInfo"
            control={control}
            render={({field}) => (
              <FormInput
                fieldProps={{
                  ...field,
                  size: 'small',
                  label: 'Additional Information',
                }}
              />
            )}
          />
        </Grid>

        <Grid size={{xs: 6}}>
          <Controller
            name="billingEmail"
            control={control}
            rules={{
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: t('Please enter a valid email address'),
              },
            }}
            render={({field}) => (
              <FormInput
                fieldProps={{
                  size: 'small',
                  label: t('Billing email address'),
                  ...field,
                  error: !!errors?.billingEmail,
                  helperText: errors?.billingEmail?.message || '',
                }}
              />
            )}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default BillingAddress;

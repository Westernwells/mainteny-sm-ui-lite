import {useEffect, useRef} from 'react';
import Grid from '@mui/material/Grid';
import {countriesOptions, getStatesByCountry} from 'utils/countries';
import {FormInput} from 'components/form/FormInput';
import {FormSelect} from 'components/form/FormSelect';
import {InvoiceFormData} from 'models/invoice';
import {Controller, UseFormReturn} from 'react-hook-form';
import NameFields from 'components/BillingAddress/NameFields';

export const EditCustomerForm = ({
  formMethods,
  address,
  customerName,
}: {
  formMethods: UseFormReturn<InvoiceFormData>;
  address: 'billingAddress' | 'beneficiaryAddress' | 'alternativeAddress';
  customerName?: string;
}) => {
  const {getValues, register, setValue, control, watch} = formMethods;
  const value = getValues(address);
  const didInit = useRef(false);

  const watchName = watch(`${address}.component.name`);
  const watchName2 = watch(`${address}.component.name2`);
  const watchName3 = watch(`${address}.component.name3`);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    const fieldName = `${address}.component.name` as const;
    const currentName = getValues(fieldName);

    // only if it's truly unset (null or undefined), not just empty-string…
    if ((currentName === null || currentName === undefined) && customerName) {
      setValue(fieldName, customerName);
    }
  }, [address, customerName, getValues, setValue]);

  return (
    <Grid container spacing={3}>
      <Grid item md={3}>
        {address === 'billingAddress' && (
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
        )}
        {address !== 'billingAddress' && (
          <FormInput
            fieldProps={{
              size: 'small',
              label: 'Name',
              ...register(`${address}.component.name`),
            }}
          />
        )}
      </Grid>
      <Grid item md={4.5}>
        <FormInput
          fieldProps={{
            size: 'small',
            label: 'Address line 1',
            ...register(`${address}.component.street`),
          }}
        />
      </Grid>
      <Grid item md={4.5}>
        <FormInput
          fieldProps={{
            size: 'small',
            label: 'Address line 2',
            ...register(`${address}.component.street2`),
          }}
        />
      </Grid>
      <Grid item md={3}>
        <FormInput
          fieldProps={{
            size: 'small',
            label: 'City',
            ...register(`${address}.component.city`),
          }}
        />
      </Grid>
      <Grid item md={3}>
        <FormInput
          fieldProps={{
            size: 'small',
            label: 'ZIP/Postal Code',
            ...register(`${address}.component.postalCode`),
          }}
        />
      </Grid>
      <Grid item md={3}>
        <Controller
          name={`${address}.component.country`}
          control={control}
          defaultValue={value?.component?.country || ''}
          render={({field}) => (
            <FormSelect
              labelId={`${address}.component.country`}
              label="Country"
              options={countriesOptions}
              selectProps={{
                ...field,
                multiple: false,
                id: `${address}.component.country`,
              }}
              isCompanyTranslation
            />
          )}
        />
      </Grid>

      <Grid item md={3}>
        <Controller
          name={`${address}.component.state`}
          control={control}
          defaultValue={value?.component?.state || ''}
          render={({field}) => (
            <FormSelect
              labelId={`${address}.component.state`}
              label="State/Province/Region"
              options={getStatesByCountry(
                getValues(`${address}.component.country`) || '',
              )}
              selectProps={{
                ...field,
                multiple: false,
                id: `${address}.component.state`,
              }}
              isCompanyTranslation
            />
          )}
        />
      </Grid>

      {address === 'billingAddress' && (
        <Grid item md={3}>
          <FormInput
            fieldProps={{
              size: 'small',
              label: 'Additional Information',
              ...register(`${address}.component.moreInfo`),
            }}
          />
        </Grid>
      )}
    </Grid>
  );
};

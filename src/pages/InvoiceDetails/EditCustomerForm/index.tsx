import {useCallback, useEffect} from 'react';
import Grid from '@mui/material/Grid';
import {countriesOptions, getStatesByCountry} from 'utils/countries';
import {FormInput} from 'components/form/FormInput';
import {FormSelect} from 'components/form/FormSelect';
import {InvoiceFormData} from 'models/invoice';
import {UseFormReturn} from 'react-hook-form';

export const EditCustomerForm = ({
  formMethods,
  address,
  customerName,
}: {
  formMethods: UseFormReturn<InvoiceFormData>;
  address: 'billingAddress' | 'beneficiaryAddress' | 'alternativeAddress';
  customerName?: string;
}) => {
  const {getValues, register, setValue} = formMethods;
  const value = getValues(address);

  const statesByCountry = useCallback(
    (country?: string) => getStatesByCountry(country ?? ''),
    [value?.component?.country],
  );

  // populate name field with customer name by default if not set
  useEffect(() => {
    if (!value?.component?.name && customerName) {
      setValue(`${address}.component.name`, customerName);
    }
  }, [customerName, address, value?.component?.name]);

  return (
    <Grid container spacing={3}>
      <Grid item md={3}>
        <FormInput
          fieldProps={{
            size: 'small',
            label: 'Name',
            ...register(`${address}.component.name`),
          }}
        />
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
        <FormSelect
          labelId={`${address}.component.country`}
          label="Country"
          options={countriesOptions}
          selectProps={{
            id: 'component.country',
            multiple: false,
            ...register(`${address}.component.country`),
          }}
          isCompanyTranslation
        />
      </Grid>
      <Grid item md={3}>
        <FormSelect
          labelId={`${address}.component.state`}
          label="State/Province/Region"
          options={statesByCountry(value?.component?.country)}
          selectProps={{
            id: 'component.state',
            multiple: false,
            ...register(`${address}.component.state`),
          }}
          isCompanyTranslation
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

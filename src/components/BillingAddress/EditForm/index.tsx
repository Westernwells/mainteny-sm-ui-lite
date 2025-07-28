import Grid from '@mui/material/Grid';
import {countriesOptions, getStatesByCountry} from 'utils/countries';
import {FormInput} from 'components/form/FormInput';
import {FormSelect} from 'components/form/FormSelect';
import {Controller, useFormContext} from 'react-hook-form';
import NameFields from 'components/BillingAddress/NameFields';
import {Box} from '@mui/material';

const EditForm = () => {
  const {getValues, register, setValue, control, watch} = useFormContext();

  const value = getValues('billingAddress');

  const watchName = watch(`billingAddress.component.name`);
  const watchName2 = watch(`billingAddress.component.name2`);
  const watchName3 = watch(`billingAddress.component.name3`);

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
        <Grid item md={4.5}>
          <FormInput
            fieldProps={{
              size: 'small',
              label: 'Address line 1',
              ...register(`billingAddress.component.street`),
            }}
          />
        </Grid>
        <Grid item md={4.5}>
          <FormInput
            fieldProps={{
              size: 'small',
              label: 'Address line 2',
              ...register(`billingAddress.component.street2`),
            }}
          />
        </Grid>
        <Grid item md={3}>
          <FormInput
            fieldProps={{
              size: 'small',
              label: 'City',
              ...register(`billingAddress.component.city`),
            }}
          />
        </Grid>
        <Grid item md={3}>
          <FormInput
            fieldProps={{
              size: 'small',
              label: 'ZIP/Postal Code',
              ...register(`billingAddress.component.postalCode`),
            }}
          />
        </Grid>
        <Grid item md={3}>
          <Controller
            name="billingAddress.component.country"
            control={control}
            defaultValue={value?.component?.country || ''}
            render={({field}) => (
              <FormSelect
                labelId="billingAddress.component.country"
                label="Country"
                options={countriesOptions}
                selectProps={{
                  ...field,
                  multiple: false,
                  id: `billingAddress.component.country`,
                }}
                isCompanyTranslation
              />
            )}
          />
        </Grid>

        <Grid item md={3}>
          <Controller
            name="billingAddress.component.state"
            control={control}
            defaultValue={value?.component?.state || ''}
            render={({field}) => (
              <FormSelect
                labelId="billingAddress.component.state"
                label="State/Province/Region"
                options={getStatesByCountry(
                  getValues(`billingAddress.component.country`) || '',
                )}
                selectProps={{
                  ...field,
                  multiple: false,
                  id: `billingAddress.component.state`,
                }}
                isCompanyTranslation
              />
            )}
          />
        </Grid>

        <Grid item md={3}>
          <FormInput
            fieldProps={{
              size: 'small',
              label: 'Additional Information',
              ...register(`billingAddress.component.moreInfo`),
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default EditForm;

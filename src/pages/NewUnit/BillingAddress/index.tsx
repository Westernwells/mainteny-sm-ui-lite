import {Box} from '@mui/system';
import {FormInput} from 'components/form/FormInput';
import {FormikProps} from 'formik';
import {FormSelect} from 'components/form/FormSelect';
import {SeparateAddressFormModal} from 'models/unitForm';
import {countriesOptions, getStatesByCountry} from 'utils/countries';
import React, {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {Typography} from '@mui/material';
import NameFields from 'components/BillingAddress/NameFields';

interface Props {
  formik: FormikProps<SeparateAddressFormModal>;
}

export const BillingAddress = ({formik}: Props) => {
  const {t} = useTranslation();

  const statesByCountry = useCallback(
    (country?: string) => getStatesByCountry(country ?? ''),
    [
      formik.values.billingAddress?.component?.country,
      formik.values.beneficiaryAddress?.component?.country,
    ],
  );

  const defaultProps = {
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
  };

  return (
    <Box sx={{mt: 3}} component="form">
      <Typography variant="subtitle1" fontWeight="bold" mb={2}>
        {t('Billing address')}
      </Typography>

      <Box
        sx={{display: 'flex', flexDirection: 'column', marginBottom: '1.5rem'}}
        gap={3}>
        <NameFields
          name={formik.values.billingAddress?.component?.name}
          name2={formik.values.billingAddress?.component?.name2}
          name3={formik.values.billingAddress?.component?.name3}
          setName={(name: string | null) =>
            formik.setFieldValue('billingAddress.component.name', name)
          }
          setName2={(name2: string | null) =>
            formik.setFieldValue('billingAddress.component.name2', name2)
          }
          setName3={(name3: string | null) =>
            formik.setFieldValue('billingAddress.component.name3', name3)
          }
          onBlur={formik.handleBlur}
        />

        <Box
          sx={{
            display: 'flex',
          }}
          gap={3}>
          <Box
            sx={{
              display: 'flex',
              width: '20%',
            }}>
            <FormInput
              fieldProps={{
                size: 'small',
                label: 'Address line 1',
                name: 'billingAddress.component.street',
                value: formik.values.billingAddress?.component?.street ?? '',
                ...defaultProps,
              }}
            />
          </Box>
          <Box
            sx={{
              display: 'flex',
              width: '20%',
            }}>
            <FormInput
              fieldProps={{
                size: 'small',
                label: 'Address line 2',
                name: 'billingAddress.component.street2',
                value: formik.values.billingAddress?.component?.street2 ?? '',
                ...defaultProps,
              }}
            />
          </Box>
          <Box
            sx={{
              display: 'flex',
              width: '20%',
            }}>
            <FormInput
              fieldProps={{
                size: 'small',
                label: 'City',
                name: 'billingAddress.component.city',
                value: formik.values.billingAddress?.component?.city ?? '',
                ...defaultProps,
              }}
            />
          </Box>
          <Box
            sx={{
              display: 'flex',
              width: '20%',
            }}>
            <FormInput
              fieldProps={{
                size: 'small',
                label: 'ZIP/Postal Code',
                name: 'billingAddress.component.postalCode',
                value:
                  formik.values.billingAddress?.component?.postalCode ?? '',
                ...defaultProps,
              }}
            />
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
          }}
          gap={3}>
          <Box
            sx={{
              display: 'flex',
              width: '20%',
            }}>
            <FormSelect
              labelId="billingAddress.component.state"
              label="State/Province/Region"
              options={statesByCountry(
                formik.values.billingAddress?.component?.country,
              )}
              selectProps={{
                id: 'billingAddress.component.state',
                name: 'billingAddress.component.state',
                value: formik.values.billingAddress?.component?.state ?? '',
                multiple: false,
                onChange: formik.handleChange,
              }}
              isCompanyTranslation
            />
          </Box>
          <Box
            sx={{
              display: 'flex',
              width: '20%',
            }}>
            <FormSelect
              labelId="billingAddress.component.country"
              label="Country"
              options={countriesOptions}
              selectProps={{
                id: 'billingAddress.component.country',
                name: 'billingAddress.component.country',
                value: formik.values.billingAddress?.component?.country ?? '',
                multiple: false,
                onChange: formik.handleChange,
              }}
              isCompanyTranslation
            />
          </Box>
          <Box
            sx={{
              display: 'flex',
              width: '20%',
            }}>
            <FormInput
              fieldProps={{
                size: 'small',
                label: 'Additional Information',
                name: 'billingAddress.component.moreInfo',
                value: formik.values.billingAddress?.component?.moreInfo ?? '',
                ...defaultProps,
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default BillingAddress;

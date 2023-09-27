import {useCallback, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {FormikProps} from 'formik';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Delete from '@mui/icons-material/Delete';
import {PageCard} from 'components/PageCard';
import {FormInput} from 'components/form/FormInput';
import {FormSelect} from 'components/form/FormSelect';
import {Button} from 'components/Button';
import {countriesOptions, getStatesByCountry} from 'utils/countries';
import {CustomerAddressFormModel} from './model';

interface Props {
  formik: FormikProps<CustomerAddressFormModel>;
}

export const CustomerAddressForm = ({formik}: Props) => {
  const {t} = useTranslation();
  const [showBeneficiaryAddress, setShowBeneficiaryAddress] = useState(
    !!formik.values.beneficiaryAddress || false,
  );
  const [showSendInvoiceViaAddress, setShowSendInvoiceViaAddress] = useState(
    !!formik.values.otherAddress || false,
  );

  const statesByCountry = useCallback(
    (country?: string) => getStatesByCountry(country ?? ''),
    [
      formik.values.billingAddress?.component?.country,
      formik.values.beneficiaryAddress?.component?.country,
      formik.values.otherAddress?.component?.country,
    ],
  );

  const removeBeneficiaryAddress = () => {
    formik.setFieldValue('beneficiaryAddress', null);
    setShowBeneficiaryAddress(false);
  };

  const removeSendInvoiceViaAddress = () => {
    formik.setFieldValue('otherAddress', null);
    setShowSendInvoiceViaAddress(false);
  };

  const defaultProps = {
    InputLabelProps: {shrink: true},
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
  };

  return (
    <PageCard
      headerLabel="Billing Address"
      containerStyles={{flexGrow: 1, p: '0.5rem'}}
      headerStyles={{m: 0, p: '1.5rem', pb: 0}}>
      <Grid container spacing={3}>
        <Grid item md={2.5}>
          <FormInput
            props={{
              size: 'small',
              label: 'Name',
              name: 'billingAddress.component.name',
              value: formik.values.billingAddress?.component?.name ?? '',
              ...defaultProps,
            }}
          />
        </Grid>
        <Grid item md={2.5}>
          <FormInput
            props={{
              size: 'small',
              label: 'Address line 1',
              name: 'billingAddress.component.street',
              value: formik.values.billingAddress?.component?.street ?? '',
              ...defaultProps,
            }}
          />
        </Grid>
        <Grid item md={2.5}>
          <FormInput
            props={{
              size: 'small',
              label: 'Address line 2',
              name: 'billingAddress.component.street2',
              value: formik.values.billingAddress?.component?.street2 ?? '',
              ...defaultProps,
            }}
          />
        </Grid>
        <Grid item md={2.5}>
          <FormInput
            props={{
              size: 'small',
              label: 'City',
              name: 'billingAddress.component.city',
              value: formik.values.billingAddress?.component?.city ?? '',
              ...defaultProps,
            }}
          />
        </Grid>
        <Grid item md={1.5}>
          <FormInput
            props={{
              size: 'small',
              label: 'ZIP/Postal Code',
              name: 'billingAddress.component.postalCode',
              value: formik.values.billingAddress?.component?.postalCode ?? '',
              ...defaultProps,
            }}
          />
        </Grid>
        <Grid item md={2.5}>
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
          />
        </Grid>
        <Grid item md={2.5}>
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
          />
        </Grid>
      </Grid>

      <Box
        pt={4}
        pb={2}
        display="flex"
        alignItems="center"
        justifyContent="space-between">
        <Typography variant="h6">{t('Beneficiary address')}</Typography>
        {showBeneficiaryAddress && (
          <IconButton onClick={removeBeneficiaryAddress} size="small">
            <Delete />
          </IconButton>
        )}
      </Box>
      {showBeneficiaryAddress ? (
        <Grid container spacing={3}>
          <Grid item md={2.5}>
            <FormInput
              props={{
                size: 'small',
                label: 'Name',
                name: 'beneficiaryAddress.component.name',
                value: formik.values.beneficiaryAddress?.component?.name ?? '',
                ...defaultProps,
              }}
            />
          </Grid>
          <Grid item md={2.5}>
            <FormInput
              props={{
                size: 'small',
                label: 'Address line 1',
                name: 'beneficiaryAddress.component.street',
                value:
                  formik.values.beneficiaryAddress?.component?.street ?? '',
                ...defaultProps,
              }}
            />
          </Grid>
          <Grid item md={2.5}>
            <FormInput
              props={{
                size: 'small',
                label: 'Address line 2',
                name: 'beneficiaryAddress.component.street2',
                value:
                  formik.values.beneficiaryAddress?.component?.street2 ?? '',
                ...defaultProps,
              }}
            />
          </Grid>
          <Grid item md={2.5}>
            <FormInput
              props={{
                size: 'small',
                label: 'City',
                name: 'beneficiaryAddress.component.city',
                value: formik.values.beneficiaryAddress?.component?.city ?? '',
                ...defaultProps,
              }}
            />
          </Grid>
          <Grid item md={1.5}>
            <FormInput
              props={{
                size: 'small',
                label: 'ZIP/Postal Code',
                name: 'beneficiaryAddress.component.postalCode',
                value:
                  formik.values.beneficiaryAddress?.component?.postalCode ?? '',
                ...defaultProps,
              }}
            />
          </Grid>
          <Grid item md={2.5}>
            <FormSelect
              labelId="beneficiaryAddress.component.country"
              label="Country"
              options={countriesOptions}
              selectProps={{
                id: 'beneficiaryAddress.component.country',
                name: 'beneficiaryAddress.component.country',
                value:
                  formik.values.beneficiaryAddress?.component?.country ?? '',
                multiple: false,
                onChange: formik.handleChange,
              }}
            />
          </Grid>
          <Grid item md={2.5}>
            <FormSelect
              labelId="beneficiaryAddress.component.state"
              label="State/Province/Region"
              options={statesByCountry(
                formik.values.beneficiaryAddress?.component?.country,
              )}
              selectProps={{
                id: 'beneficiaryAddress.component.state',
                name: 'beneficiaryAddress.component.state',
                value: formik.values.beneficiaryAddress?.component?.state ?? '',
                multiple: false,
                onChange: formik.handleChange,
              }}
            />
          </Grid>
        </Grid>
      ) : (
        <Button
          buttonProps={{
            size: 'medium',
            variant: 'outlined',
            onClick: () => setShowBeneficiaryAddress(true),
            sx: {background: 'transparent'},
          }}>
          <Typography variant="subtitle2">
            {t('Add Beneficiary Address')}
          </Typography>
        </Button>
      )}

      <Box
        pt={4}
        pb={2}
        display="flex"
        alignItems="center"
        justifyContent="space-between">
        <Typography variant="h6">
          {t('Send invoice via different address')}
        </Typography>
        {showSendInvoiceViaAddress && (
          <IconButton onClick={removeSendInvoiceViaAddress} size="small">
            <Delete />
          </IconButton>
        )}
      </Box>
      {showSendInvoiceViaAddress ? (
        <Grid container spacing={3}>
          <Grid item md={2.5}>
            <FormInput
              props={{
                size: 'small',
                label: 'Name',
                name: 'otherAddress.component.name',
                value: formik.values.otherAddress?.component?.name ?? '',
                ...defaultProps,
              }}
            />
          </Grid>
          <Grid item md={2.5}>
            <FormInput
              props={{
                size: 'small',
                label: 'Address line 1',
                name: 'otherAddress.component.street',
                value: formik.values.otherAddress?.component?.street ?? '',
                ...defaultProps,
              }}
            />
          </Grid>
          <Grid item md={2.5}>
            <FormInput
              props={{
                size: 'small',
                label: 'Address line 2',
                name: 'otherAddress.component.street2',
                value: formik.values.otherAddress?.component?.street2 ?? '',
                ...defaultProps,
              }}
            />
          </Grid>
          <Grid item md={2.5}>
            <FormInput
              props={{
                size: 'small',
                label: 'City',
                name: 'otherAddress.component.city',
                value: formik.values.otherAddress?.component?.city ?? '',
                ...defaultProps,
              }}
            />
          </Grid>
          <Grid item md={1.5}>
            <FormInput
              props={{
                size: 'small',
                label: 'ZIP/Postal Code',
                name: 'otherAddress.component.postalCode',
                value: formik.values.otherAddress?.component?.postalCode ?? '',
                ...defaultProps,
              }}
            />
          </Grid>
          <Grid item md={2.5}>
            <FormSelect
              labelId="otherAddress.component.country"
              label="Country"
              options={countriesOptions}
              selectProps={{
                id: 'otherAddress.component.country',
                name: 'otherAddress.component.country',
                value: formik.values.otherAddress?.component?.country ?? '',
                multiple: false,
                onChange: formik.handleChange,
              }}
            />
          </Grid>
          <Grid item md={2.5}>
            <FormSelect
              labelId="otherAddress.component.state"
              label="State/Province/Region"
              options={statesByCountry(
                formik.values.otherAddress?.component?.country,
              )}
              selectProps={{
                id: 'otherAddress.component.state',
                name: 'otherAddress.component.state',
                value: formik.values.otherAddress?.component?.state ?? '',
                multiple: false,
                onChange: formik.handleChange,
              }}
            />
          </Grid>
        </Grid>
      ) : (
        <Button
          buttonProps={{
            size: 'medium',
            variant: 'outlined',
            onClick: () => setShowSendInvoiceViaAddress(true),
            sx: {
              background: 'transparent',
            },
          }}>
          <Typography variant="subtitle2">
            {t('Add Send invoice via')}
          </Typography>
        </Button>
      )}
    </PageCard>
  );
};

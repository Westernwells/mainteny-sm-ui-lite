import {useCallback, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {FormikProps} from 'formik';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Add from '@mui/icons-material/Add';
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
  const [showBillingAddress, setShowBillingAddress] = useState(
    !!formik.values.billingAddress || false,
  );
  const [showSendInvoiceViaAddress, setShowSendInvoiceViaAddress] = useState(
    !!formik.values.businessAddress || false,
  );

  const statesByCountry = useCallback(
    (country?: string) => getStatesByCountry(country ?? ''),
    [
      formik.values.postalAddress?.component?.country,
      formik.values.billingAddress?.component?.country,
      formik.values.businessAddress?.component?.country,
    ],
  );

  const removeBillingAddress = () => {
    formik.setFieldValue('billingAddress', null);
    setShowBillingAddress(false);
  };

  const removeSendInvoiceViaAddress = () => {
    formik.setFieldValue('businessAddress', null);
    setShowSendInvoiceViaAddress(false);
  };

  const defaultProps = {
    InputLabelProps: {shrink: true},
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
  };

  return (
    <PageCard
      headerLabel="Postal address"
      containerStyles={{flexGrow: 1, p: '0.5rem'}}
      headerStyles={{m: 0, p: '1.5rem', pb: 0}}>
      <Grid container spacing={3}>
        <Grid item md={2.5}>
          <FormInput
            props={{
              size: 'small',
              label: 'Name',
              name: 'postalAddress.fullName',
              value: formik.values.postalAddress?.fullName ?? '',
              ...defaultProps,
            }}
          />
        </Grid>
        <Grid item md={2.5}>
          <FormInput
            props={{
              size: 'small',
              label: 'Address line 1',
              name: 'postalAddress.component.street',
              value: formik.values.postalAddress?.component?.street ?? '',
              ...defaultProps,
            }}
          />
        </Grid>
        <Grid item md={2.5}>
          <FormInput
            props={{
              size: 'small',
              label: 'Address line 2',
              name: 'postalAddress.component.street2',
              value: formik.values.postalAddress?.component?.street2 ?? '',
              ...defaultProps,
            }}
          />
        </Grid>
        <Grid item md={2.5}>
          <FormInput
            props={{
              size: 'small',
              label: 'City',
              name: 'postalAddress.component.city',
              value: formik.values.postalAddress?.component?.city ?? '',
              ...defaultProps,
            }}
          />
        </Grid>
        <Grid item md={1.5}>
          <FormInput
            props={{
              size: 'small',
              label: 'ZIP/Postal Code',
              name: 'postalAddress.component.postalCode',
              value: formik.values.postalAddress?.component?.postalCode ?? '',
              ...defaultProps,
            }}
          />
        </Grid>
        <Grid item md={2.5}>
          <FormSelect
            labelId="postalAddress.component.country"
            label="Country"
            options={countriesOptions}
            selectProps={{
              id: 'postalAddress.component.country',
              name: 'postalAddress.component.country',
              value: formik.values.postalAddress?.component?.country ?? '',
              multiple: false,
              onChange: formik.handleChange,
            }}
          />
        </Grid>
        <Grid item md={2.5}>
          <FormSelect
            labelId="postalAddress.component.state"
            label="State/Province/Region"
            options={statesByCountry(
              formik.values.postalAddress?.component?.country,
            )}
            selectProps={{
              id: 'postalAddress.component.state',
              name: 'postalAddress.component.state',
              value: formik.values.postalAddress?.component?.state ?? '',
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
        <Typography variant="h6">{t('Different billing address')}</Typography>
        {showBillingAddress && (
          <IconButton onClick={removeBillingAddress} size="small">
            <Delete />
          </IconButton>
        )}
      </Box>
      {showBillingAddress ? (
        <Grid container spacing={3}>
          <Grid item md={2.5}>
            <FormInput
              props={{
                size: 'small',
                label: 'Name',
                name: 'billingAddress.fullName',
                value: formik.values.billingAddress?.fullName ?? '',
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
                value:
                  formik.values.billingAddress?.component?.postalCode ?? '',
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
      ) : (
        <Button
          buttonProps={{
            size: 'medium',
            variant: 'outlined',
            onClick: () => setShowBillingAddress(true),
            startIcon: <Add />,
            sx: {background: 'transparent'},
          }}>
          <Typography variant="subtitle2">{t('Billing address')}</Typography>
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
                name: 'businessAddress.fullName',
                value: formik.values.businessAddress?.fullName ?? '',
                ...defaultProps,
              }}
            />
          </Grid>
          <Grid item md={2.5}>
            <FormInput
              props={{
                size: 'small',
                label: 'Address line 1',
                name: 'businessAddress.component.street',
                value: formik.values.businessAddress?.component?.street ?? '',
                ...defaultProps,
              }}
            />
          </Grid>
          <Grid item md={2.5}>
            <FormInput
              props={{
                size: 'small',
                label: 'Address line 2',
                name: 'businessAddress.component.street2',
                value: formik.values.businessAddress?.component?.street2 ?? '',
                ...defaultProps,
              }}
            />
          </Grid>
          <Grid item md={2.5}>
            <FormInput
              props={{
                size: 'small',
                label: 'City',
                name: 'businessAddress.component.city',
                value: formik.values.businessAddress?.component?.city ?? '',
                ...defaultProps,
              }}
            />
          </Grid>
          <Grid item md={1.5}>
            <FormInput
              props={{
                size: 'small',
                label: 'ZIP/Postal Code',
                name: 'businessAddress.component.postalCode',
                value:
                  formik.values.businessAddress?.component?.postalCode ?? '',
                ...defaultProps,
              }}
            />
          </Grid>
          <Grid item md={2.5}>
            <FormSelect
              labelId="businessAddress.component.country"
              label="Country"
              options={countriesOptions}
              selectProps={{
                id: 'businessAddress.component.country',
                name: 'businessAddress.component.country',
                value: formik.values.businessAddress?.component?.country ?? '',
                multiple: false,
                onChange: formik.handleChange,
              }}
            />
          </Grid>
          <Grid item md={2.5}>
            <FormSelect
              labelId="businessAddress.component.state"
              label="State/Province/Region"
              options={statesByCountry(
                formik.values.businessAddress?.component?.country,
              )}
              selectProps={{
                id: 'businessAddress.component.state',
                name: 'businessAddress.component.state',
                value: formik.values.businessAddress?.component?.state ?? '',
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
            startIcon: <Add />,
            sx: {
              background: 'transparent',
            },
          }}>
          <Typography variant="subtitle2">{t('Send invoice via')}</Typography>
        </Button>
      )}
    </PageCard>
  );
};

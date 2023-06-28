import {useCallback, useState} from 'react';
import {format} from 'date-fns';
import {useTranslation} from 'react-i18next';
import {useFormikContext} from 'formik';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Add from '@mui/icons-material/Add';
import Delete from '@mui/icons-material/Delete';

import {countriesOptions, getStatesByCountry} from 'utils/countries';
import {FormInput} from 'components/form/FormInput';
import {Dialog} from 'components/Dialog';
import {DatePicker} from 'components/DatePicker';
import {FormSelect} from 'components/form/FormSelect';
import {Button} from 'components/Button';
import {CustomerEditForm} from './model';
import {SelectPriority} from './SelectPriority';

interface Props {
  openDialog: boolean;
  onClose: () => void;
}

export const EditCustomerForm = ({openDialog, onClose}: Props) => {
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    submitForm,
    setValues,
    setFieldValue,
  } = useFormikContext<CustomerEditForm>();
  const {t} = useTranslation();
  const [showBillingAddress, setShowBillingAddress] = useState(
    !!values.billingAddress || false,
  );
  const [showSendInvoiceViaAddress, setShowSendInvoiceViaAddress] = useState(
    !!values.businessAddress || false,
  );

  const statesByCountry = useCallback(
    (country?: string) => getStatesByCountry(country ?? ''),
    [
      values.postalAddress?.component?.country,
      values.billingAddress?.component?.country,
      values.businessAddress?.component?.country,
    ],
  );

  const removeBillingAddress = () => {
    setFieldValue('billingAddress.fullName', null);
    setShowBillingAddress(false);
  };

  const removeSendInvoiceViaAddress = () => {
    setFieldValue('businessAddress.fullName', null);
    setShowSendInvoiceViaAddress(false);
  };

  const defaultProps = {
    onChange: handleChange,
    onBlur: handleBlur,
  };

  return (
    <Dialog
      title="Edit Information"
      onCancel={onClose}
      onSave={submitForm}
      disableSaveBtn={!!Object.keys(errors).length}
      dialogProps={{
        maxWidth: 'lg',
        open: openDialog || false,
      }}>
      <Typography variant="h6" pt="1rem" pb="1.5rem">
        {t('Basic Information')}
      </Typography>
      <Grid container spacing={3}>
        <Grid item md={4}>
          <FormInput
            props={{
              size: 'small',
              placeholder: 'e.g Mainteny GmbH',
              label: 'Customer Name',
              name: 'name',
              value: values.name,
              helperText: touched.name && errors.name,
              error: !!errors.name && touched.name,
              required: true,
              ...defaultProps,
            }}
          />
        </Grid>
        <Grid item md={4}>
          <FormInput
            props={{
              size: 'small',
              placeholder: 'e.g johndoe@example.com',
              label: 'Email',
              name: 'email',
              value: values.email,
              helperText: touched.email && errors.email,
              error: !!errors.email && touched.email,
              ...defaultProps,
            }}
          />
        </Grid>
        <Grid item md={4}>
          <FormInput
            props={{
              size: 'small',
              placeholder: 'e.g johndoe@example.com',
              label: 'Billing email address',
              name: 'billingEmail',
              value: values.billingEmail,
              helperText: touched.billingEmail && errors.billingEmail,
              error: !!errors.billingEmail && touched.billingEmail,
              ...defaultProps,
            }}
          />
        </Grid>
        <Grid item md={4}>
          <FormInput
            props={{
              size: 'small',
              placeholder: 'e.g +34 12345678',
              label: 'Phone',
              name: 'phone',
              value: values.phone,
              helperText: touched.phone && errors.phone,
              error: !!errors.phone && touched.phone,
              InputProps: {
                startAdornment: (
                  <InputAdornment position="start">+</InputAdornment>
                ),
              },
              ...defaultProps,
            }}
          />
        </Grid>
        <Grid item md={4}>
          <FormInput
            props={{
              size: 'small',
              placeholder: 'e.g +34 12345678',
              label: '2nd Phone',
              name: 'secondaryPhoneNumber',
              value: values.secondaryPhoneNumber,
              helperText:
                touched.secondaryPhoneNumber && errors.secondaryPhoneNumber,
              error:
                !!errors.secondaryPhoneNumber && touched.secondaryPhoneNumber,
              InputProps: {
                startAdornment: (
                  <InputAdornment position="start"> + </InputAdornment>
                ),
              },
              ...defaultProps,
            }}
          />
        </Grid>
        <Grid item md={4}>
          <FormInput
            props={{
              size: 'small',
              placeholder: 'e.g mainteny.com',
              label: 'Website/URL',
              name: 'url',
              value: values.url,
              helperText: touched.url && errors.url,
              error: !!errors.url && touched.url,
              ...defaultProps,
            }}
          />
        </Grid>
        <Grid item md={4}>
          <FormInput
            props={{
              size: 'small',
              placeholder: 'e.g 1234',
              label: 'Customer Number',
              name: 'externalId',
              value: values.externalId,
              helperText: touched.externalId && errors.externalId,
              error: !!errors.externalId && touched.externalId,
              ...defaultProps,
            }}
          />
        </Grid>

        <Grid item md={4}>
          <DatePicker
            containerStyles={{mr: '1em', width: '100%'}}
            getSelectedDate={(date) => {
              if (date) {
                setValues({
                  ...values,
                  registrationDate: format(date, 'yyyy-MM-dd'),
                });
              }
            }}
            disableMask
            textFieldProps={{
              label: t('Customer Since'),
              name: 'registrationDate',
              helperText:
                errors.registrationDate && touched.registrationDate
                  ? errors.registrationDate
                  : '',
              error: !!(touched.registrationDate && errors.registrationDate),
              sx: {width: '100%'},
              onBlur: handleBlur,
            }}
          />
        </Grid>

        <Grid item md={4}>
          <FormInput
            props={{
              size: 'small',
              placeholder: 'e.g 000 000 000',
              label: 'Cost Center',
              name: 'costCenter',
              value: values.costCenter,
              helperText: touched.costCenter && errors.costCenter,
              error: !!errors.costCenter && touched.costCenter,
              ...defaultProps,
            }}
          />
        </Grid>

        <Grid item md={4}>
          <SelectPriority />
        </Grid>

        <Grid item md={4}>
          <FormInput
            props={{
              size: 'small',
              label: 'VAT/Tax number',
              name: 'taxNumber',
              value: values.taxNumber,
              helperText: touched.taxNumber && errors.taxNumber,
              error: !!errors.taxNumber && touched.taxNumber,
              ...defaultProps,
            }}
          />
        </Grid>
      </Grid>

      <Typography variant="h6" pt="2rem" pb="1.5rem">
        {t('Postal address')}
      </Typography>
      <Grid container spacing={3}>
        <Grid item md={2.5}>
          <FormInput
            props={{
              size: 'small',
              label: 'Name',
              name: 'postalAddress.fullName',
              value: values.postalAddress?.fullName ?? '',
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
              value: values.postalAddress?.component?.street ?? '',
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
              value: values.postalAddress?.component?.street2 ?? '',
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
              value: values.postalAddress?.component?.city ?? '',
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
              value: values.postalAddress?.component?.postalCode ?? '',
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
              value: values.postalAddress?.component?.country ?? '',
              multiple: false,
              onChange: handleChange,
            }}
          />
        </Grid>
        <Grid item md={2.5}>
          <FormSelect
            labelId="postalAddress.component.state"
            label="State/Province/Region"
            options={statesByCountry(values.postalAddress?.component?.country)}
            selectProps={{
              id: 'postalAddress.component.state',
              name: 'postalAddress.component.state',
              value: values.postalAddress?.component?.state ?? '',
              multiple: false,
              onChange: handleChange,
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
                value: values.billingAddress?.fullName ?? '',
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
                value: values.billingAddress?.component?.street ?? '',
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
                value: values.billingAddress?.component?.street2 ?? '',
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
                value: values.billingAddress?.component?.city ?? '',
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
                value: values.billingAddress?.component?.postalCode ?? '',
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
                value: values.billingAddress?.component?.country ?? '',
                multiple: false,
                onChange: handleChange,
              }}
            />
          </Grid>
          <Grid item md={2.5}>
            <FormSelect
              labelId="billingAddress.component.state"
              label="State/Province/Region"
              options={statesByCountry(
                values.billingAddress?.component?.country,
              )}
              selectProps={{
                id: 'billingAddress.component.state',
                name: 'billingAddress.component.state',
                value: values.billingAddress?.component?.state ?? '',
                multiple: false,
                onChange: handleChange,
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
                value: values.businessAddress?.fullName ?? '',
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
                value: values.businessAddress?.component?.street ?? '',
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
                value: values.businessAddress?.component?.street2 ?? '',
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
                value: values.businessAddress?.component?.city ?? '',
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
                value: values.businessAddress?.component?.postalCode ?? '',
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
                value: values.businessAddress?.component?.country ?? '',
                multiple: false,
                onChange: handleChange,
              }}
            />
          </Grid>
          <Grid item md={2.5}>
            <FormSelect
              labelId="businessAddress.component.state"
              label="State/Province/Region"
              options={statesByCountry(
                values.businessAddress?.component?.country,
              )}
              selectProps={{
                id: 'businessAddress.component.state',
                name: 'businessAddress.component.state',
                value: values.businessAddress?.component?.state ?? '',
                multiple: false,
                onChange: handleChange,
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
    </Dialog>
  );
};

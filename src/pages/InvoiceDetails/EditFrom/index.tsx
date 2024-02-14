import {useCallback} from 'react';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import MuiDialog, {DialogProps} from '@mui/material/Dialog';
import {
  Box,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
} from '@mui/material';
import {Button} from 'components/Button';
import {FormInput} from 'components/form/FormInput';
import {FormSelect} from 'components/form/FormSelect';
import {countriesOptions, getStatesByCountry} from 'utils/countries';
import {AddressRecord} from 'models/misc';
import {AlternativeServiceCompanyInfo} from 'models/invoice';
import {T} from 'utils/i18n-utils';

const validationSchemaAddress = Yup.object().shape({
  address: Yup.object().nullable(),
});

interface Props {
  isDialogOpen: boolean;
  onClose: () => void;
  onSave: ({name, address}: {name?: string; address?: AddressRecord}) => void;
  alternativeServiceCompanyInfo?: AlternativeServiceCompanyInfo;
  dialogProps?: DialogProps;
}

export const EditFrom = ({
  isDialogOpen,
  onClose,
  onSave,
  dialogProps,
  alternativeServiceCompanyInfo,
}: Props) => {
  const formik = useFormik<AlternativeServiceCompanyInfo>({
    initialValues: {
      name: alternativeServiceCompanyInfo?.name ?? '',
      address: alternativeServiceCompanyInfo?.address,
    },
    onSubmit: (values) => {
      onSave({
        name: values?.name ?? '',
        address: values?.address,
      });
    },
    validationSchema: validationSchemaAddress,
    enableReinitialize: true,
  });

  const statesByCountry = useCallback(
    (country?: string) => getStatesByCountry(country ?? ''),
    [formik.values?.address?.component?.country],
  );

  const defaultProps = {
    InputLabelProps: {shrink: true},
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
  };

  return (
    <MuiDialog
      fullWidth
      maxWidth="md"
      open={isDialogOpen}
      onClose={onClose}
      {...dialogProps}>
      <DialogTitle id="alert-dialog-title">{T('Edit from')}</DialogTitle>

      <DialogContent sx={{color: 'text.primary', px: 3, py: 2}}>
        <Box pt="0.5rem">
          <Typography variant="h6" color="text.secondary" pb={2}>
            {T('Postal address')}
          </Typography>
          <Grid container spacing={3}>
            <Grid item md={4}>
              <FormInput
                props={{
                  size: 'small',
                  label: 'Name',
                  name: 'name',
                  value: formik.values?.name,
                  ...defaultProps,
                }}
              />
            </Grid>
            <Grid item md={4}>
              <FormInput
                props={{
                  size: 'small',
                  label: 'Address line',
                  name: 'address.component.street',
                  value: formik.values?.address?.component?.street ?? '',
                  ...defaultProps,
                }}
              />
            </Grid>
            <Grid item md={2}>
              <FormInput
                props={{
                  size: 'small',
                  label: 'City',
                  name: 'address.component.city',
                  value: formik.values?.address?.component?.city ?? '',
                  ...defaultProps,
                }}
              />
            </Grid>
            <Grid item md={2}>
              <FormInput
                props={{
                  size: 'small',
                  label: 'ZIP/Postal Code',
                  name: 'address.component.postalCode',
                  value: formik.values?.address?.component?.postalCode ?? '',
                  ...defaultProps,
                }}
              />
            </Grid>
            <Grid item md={3.5}>
              <FormSelect
                labelId="address.component.country"
                label="Country"
                options={countriesOptions}
                selectProps={{
                  id: 'address.component.country',
                  name: 'address.component.country',
                  value: formik.values?.address?.component?.country ?? '',
                  multiple: false,
                  onChange: formik.handleChange,
                }}
              />
            </Grid>
            <Grid item md={3.5}>
              <FormSelect
                labelId="address.component.state"
                label="State/Province/Region"
                options={statesByCountry(
                  formik.values?.address?.component?.country,
                )}
                selectProps={{
                  id: 'address.component.state',
                  name: 'address.component.state',
                  value: formik.values?.address?.component?.state ?? '',
                  multiple: false,
                  onChange: formik.handleChange,
                }}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{p: 3}}>
        <Button
          buttonProps={{
            size: 'medium',
            onClick: onClose,
          }}>
          <Typography variant="subtitle2" color="text.secondary">
            {T('Cancel')}
          </Typography>
        </Button>
        <Button
          buttonProps={{
            size: 'medium',
            variant: 'contained',
            onClick: () => formik.handleSubmit(),
          }}>
          <Typography variant="subtitle2">{T('Update')}</Typography>
        </Button>
      </DialogActions>
    </MuiDialog>
  );
};

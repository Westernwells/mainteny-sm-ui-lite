import React, {useEffect} from 'react';
import {Box} from '@mui/system';
import {FormikProps} from 'formik';
import {SeparateAddressFormModal} from 'models/unitForm';
import {useTranslation} from 'react-i18next';
import {Checkbox, Typography} from '@mui/material';
import {AddressForm} from './AddressForm';

interface Props {
  formik: FormikProps<SeparateAddressFormModal>;
  isSeparateAddressEnabled: boolean;
  setIsSeparateAddressEnabled: (newBol: boolean) => void;
  columnSettings?: {lg?: number; xs?: number; sm?: number; md?: number};
}

export const SeparateInvoiceAddress = ({
  formik,
  isSeparateAddressEnabled,
  setIsSeparateAddressEnabled,
  columnSettings = {},
}: Props) => {
  const {t} = useTranslation();

  const clearForm = () => {
    formik.resetForm();
  };

  const onCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsSeparateAddressEnabled(event.target.checked);
  };

  useEffect(() => {
    if (!isSeparateAddressEnabled) {
      clearForm();
    }
  }, [isSeparateAddressEnabled]);

  return (
    <Box sx={{mt: 4}}>
      <Box display="flex" flexDirection="row" alignItems="flex-start">
        <Checkbox
          checked={isSeparateAddressEnabled ?? false}
          onChange={onCheckboxChange}
          sx={{padding: 0, marginRight: 1}}
        />
        <Box>
          <Typography fontWeight="bold" color="primary.main">
            {t('Add separate invoice address')}
          </Typography>
          <Typography variant="body2" color="#828DA3">
            {t(
              'These addresses be used as primary instead ones from customer details',
            )}
          </Typography>
        </Box>
      </Box>
      {isSeparateAddressEnabled && (
        <Box>
          <AddressForm
            title="Billing address"
            type="billingAddress"
            columnSettings={columnSettings}
            formik={formik}
          />
          <AddressForm
            title="Beneficiary address"
            type="beneficiaryAddress"
            columnSettings={columnSettings}
            formik={formik}
          />
        </Box>
      )}
    </Box>
  );
};

import React from 'react';
import Box from '@mui/material/Box';
import {useTranslation} from 'react-i18next';
import {SupplierRecord} from '../../../models/article';
import {FormInput} from '../../../components/form/FormInput';
import {FormRadio} from '../../../components/form/FormRadio';
import {AddressAutoComplete} from '../../../components/AddressAutoComplete';
import {FormCheckbox} from '../../../components/form/FormCheckbox';

interface Props {
  supplier: SupplierRecord;
  updateSupplier: (item: SupplierRecord) => void;
  containerStyles?: {[key: string]: any};
  useCheckBox: boolean;
}

export const SupplierItem = ({
  supplier,
  updateSupplier,
  containerStyles,
  useCheckBox,
}: Props) => {
  const {t} = useTranslation();
  return (
    <Box display="flex" flexWrap="wrap">
      <FormInput
        containerStyles={{...containerStyles}}
        props={{
          id: 'supplierName',
          label: t('Supplier Name'),
          placeholder: t('e.g. Hydronic'),
          value: supplier.name,
          variant: 'outlined',
          type: 'text',
          onChange: (e) => {
            supplier.name = e.target.value;
            updateSupplier(supplier);
          },
        }}
      />
      <FormInput
        containerStyles={{...containerStyles}}
        props={{
          id: 'supplierNumber',
          label: t('Supplier Article Number'),
          placeholder: t('e.g. 00000001'),
          value: supplier.number,
          variant: 'outlined',
          type: 'text',
          onChange: (e) => {
            supplier.number = e.target.value;
            updateSupplier(supplier);
          },
        }}
      />
      <Box sx={{...containerStyles}}>
        <AddressAutoComplete
          initialValue={supplier.address?.fullName || ''}
          textFieldProps={{
            label: t('Supplier Address'),
            placeholder: t('e.g. 34-36 Exmouth Market, London EC1R 4QE'),
            value: supplier.address?.fullName,
            variant: 'outlined',
            type: 'text',
          }}
          getAddress={(address) => {
            supplier.address = address;
            updateSupplier(supplier);
          }}
        />
      </Box>
      <FormInput
        containerStyles={{...containerStyles}}
        props={{
          id: 'supplierPhone',
          label: t('Supplier Phone Number'),
          placeholder: t('e.g. +49 1000 000000'),
          value: supplier.phone,
          variant: 'outlined',
          type: 'text',
          onChange: (e) => {
            supplier.phone = e.target.value;
            updateSupplier(supplier);
          },
        }}
      />
      <FormInput
        containerStyles={{...containerStyles}}
        props={{
          id: 'supplierEmailAddress',
          label: t('Supplier Email Address'),
          placeholder: 'supplier.part@mail.com',
          value: supplier.email,
          variant: 'outlined',
          type: 'text',
          onChange: (e) => {
            supplier.email = e.target.value;
            updateSupplier(supplier);
          },
        }}
      />
      {!useCheckBox && (
        <FormRadio
          checked={supplier.isPreferred}
          handleChange={(e) => {
            supplier.isPreferred = e.target.checked;
            updateSupplier(supplier);
          }}
          label={t('Preferred Supplier')}
          radioProps={{
            sx: {color: 'textSecondary'},
          }}
        />
      )}
      {useCheckBox && (
        <FormCheckbox
          checked={supplier.isPreferred}
          name={supplier.name}
          label={t('Preferred Supplier')}
          handleChange={(e) => {
            supplier.isPreferred = e.target.checked;
            updateSupplier(supplier);
          }}
        />
      )}
    </Box>
  );
};

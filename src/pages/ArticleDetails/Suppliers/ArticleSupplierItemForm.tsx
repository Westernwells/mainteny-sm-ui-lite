import React from 'react';
import Box from '@mui/material/Box';
import {SupplierRecord} from '../../../models/article';
import {FormInput} from '../../../components/form/FormInput';
import {FormRadio} from '../../../components/form/FormRadio';
import {AddressAutoComplete} from '../../../components/AddressAutoComplete';

interface Props {
  supplier: SupplierRecord;
  updateSupplier: (item: SupplierRecord) => void;
}

export const ArticleSupplierItemForm = ({supplier, updateSupplier}: Props) => (
  <Box display="flex" flexWrap="wrap" sx={{py: '1rem'}}>
    <FormInput
      containerStyles={{width: '50%', pr: '1rem'}}
      props={{
        id: 'supplierName',
        label: 'Supplier Name',
        placeholder: 'e.g. Hydronic',
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
      containerStyles={{width: '50%', pr: '1rem'}}
      props={{
        id: 'supplierNumber',
        label: 'Supplier Number',
        placeholder: 'e.g. 00000001',
        value: supplier.number,
        variant: 'outlined',
        type: 'text',
        onChange: (e) => {
          supplier.number = e.target.value;
          updateSupplier(supplier);
        },
      }}
    />
    <Box sx={{width: '50%', pr: '1rem'}}>
      <AddressAutoComplete
        initialValue={supplier.address?.fullName || ''}
        textFieldProps={{
          label: 'Supplier Address',
          placeholder: 'e.g. 34-36 Exmouth Market, London EC1R 4QE',
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
      containerStyles={{width: '50%', pr: '1rem'}}
      props={{
        id: 'supplierPhone',
        label: 'Supplier Phone',
        placeholder: 'e.g. +49 1000 000000',
        value: supplier.phone,
        variant: 'outlined',
        type: 'text',
        onChange: (e) => {
          supplier.phone = e.target.value;
          updateSupplier(supplier);
        },
      }}
    />
    <FormRadio
      checked={supplier.isPreferred}
      handleChange={(e) => {
        supplier.isPreferred = e.target.checked;
        updateSupplier(supplier);
      }}
      label="Preferred Supplier"
      radioProps={{
        sx: {color: 'textSecondary'},
      }}
    />
  </Box>
);

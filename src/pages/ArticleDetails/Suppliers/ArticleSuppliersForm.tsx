import React from 'react';
import Box from '@mui/material/Box';
import {RadioGroup} from '@mui/material';
import _ from 'lodash';
import cloneDeep from 'lodash/cloneDeep';
import {SupplierRecord} from '../../../models/article';
import {ArticleSupplierItemForm} from './ArticleSupplierItemForm';
import {Button} from '../../../components/Button';

export interface Props {
  suppliers: SupplierRecord[];
  updateSuppliers: (suppliers: SupplierRecord[]) => void;
}

export const ArticleSuppliersForm = ({suppliers, updateSuppliers}: Props) => {
  const addSupplier = () => {
    const origin = cloneDeep(suppliers);
    const supplier = {
      name: '',
      number: '',
      email: '',
      phone: '',
      website: '',
      address: {
        fullName: '',
        countryCode: 'DE',
        location: {
          longitude: -1,
          latitude: -1,
        },
      },
      isPreferred: false,
    };
    origin.push(supplier);
    updateSuppliers(origin);
  };

  const updateSupplier = (item: SupplierRecord) => {
    if (item.isPreferred) {
      _.chain(suppliers)
        .filter((it) => it !== item)
        .each((it) => {
          it.isPreferred = false;
        })
        .value();
    }
    const modified = cloneDeep(suppliers);
    updateSuppliers(modified);
  };

  const supplierItem = _.map(suppliers, (supplier, key) => (
    <ArticleSupplierItemForm
      key={key}
      supplier={supplier}
      updateSupplier={updateSupplier}
    />
  ));

  return (
    <>
      <Box display="flex" flexDirection="column">
        <RadioGroup name="radio-buttons-group">
          <Box sx={{height: '100%', overflowY: 'auto'}} component="form">
            {supplierItem}
          </Box>
        </RadioGroup>
      </Box>
      <Box display="flex">
        <Button
          label="+ Add Supplier"
          style={{mt: '0.5rem'}}
          buttonProps={{
            onClick: () => addSupplier(),
            variant: 'outlined',
          }}
        />
      </Box>
    </>
  );
};

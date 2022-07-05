import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import _ from 'lodash';
import cloneDeep from 'lodash/cloneDeep';
import {SupplierRecord} from '../../../models/article';
import {SupplierItem} from './SupplierItem';
import {Button} from '../../../components/Button';
import {Dialog} from '../../../components/Dialog';

export interface Props {
  isLoading: boolean;
  originSuppliers: SupplierRecord[];
  onSubmit: (suppliers: SupplierRecord[]) => void;
  onCancel: () => void;
}

export const ArticleSuppliersForm = ({
  isLoading,
  originSuppliers,
  onSubmit,
  onCancel,
}: Props) => {
  const [suppliers, setSuppliers] = useState<SupplierRecord[]>(originSuppliers);
  const {t} = useTranslation();

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
    setSuppliers(origin);
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
    setSuppliers(modified);
  };

  const submit = () => {
    onSubmit(suppliers);
  };

  if (_.isEmpty(suppliers)) {
    addSupplier();
  }

  const supplierItem = _.map(suppliers, (supplier, key) => (
    <Box key={key}>
      <SupplierItem
        supplier={supplier}
        updateSupplier={updateSupplier}
        containerStyles={{width: '50%', pr: '1rem', my: '1rem'}}
        useCheckBox={suppliers.length === 1}
      />
      {suppliers.length > 1 && key !== suppliers.length - 1 && (
        <Divider sx={{my: '1rem'}} />
      )}
    </Box>
  ));

  return (
    <Dialog
      title={t('Edit Suppliers Information')}
      isSaving={isLoading}
      disableSaveBtn={suppliers.some((it) => !it.name)}
      onCancel={() => onCancel()}
      onSave={submit}
      dialogProps={{open: true}}>
      <Box
        display="flex"
        flexDirection="column"
        sx={{height: '100%', overflowY: 'auto'}}
        component="form">
        {supplierItem}
      </Box>
      <Box display="flex">
        <Button
          label={t('+ Add Supplier')}
          style={{mt: '0.5rem'}}
          buttonProps={{
            onClick: () => addSupplier(),
            variant: 'outlined',
          }}
        />
      </Box>
    </Dialog>
  );
};

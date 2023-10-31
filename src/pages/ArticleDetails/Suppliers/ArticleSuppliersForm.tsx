import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import * as Yup from 'yup';
import Box from '@mui/material/Box';
import AddIcon from '@mui/icons-material/Add';
import cloneDeep from 'lodash/cloneDeep';
import {getUniqueId} from 'utils/utils';
import {ExtendedSupplierRecord} from 'models/article';
import {Button} from 'components/Button';
import {Dialog} from 'components/Dialog';
import {SupplierItem} from './SupplierItem';

export interface Props {
  isLoading: boolean;
  originSuppliers: ExtendedSupplierRecord[];
  onSubmit: (suppliers: ExtendedSupplierRecord[]) => void;
  onCancel: () => void;
}

const schema = Yup.object().shape({
  supplierId: Yup.string().uuid(),
});

export const ArticleSuppliersForm = ({
  isLoading,
  originSuppliers = [],
  onSubmit,
  onCancel,
}: Props) => {
  const [suppliers, setSuppliers] = useState<ExtendedSupplierRecord[]>(
    originSuppliers.length
      ? originSuppliers
      : [
          {
            id: getUniqueId(),
            supplierId: '',
            number: '',
            isPreferred: true,
          },
        ],
  );
  const {t} = useTranslation();

  const addSupplier = () => {
    const origin = cloneDeep(suppliers);
    const supplier: ExtendedSupplierRecord = {
      id: getUniqueId(),
      supplierId: '',
      number: '',
      isPreferred: false,
    };
    origin.push(supplier);
    setSuppliers(origin);
  };

  const updateSupplier = (item: ExtendedSupplierRecord) => {
    setSuppliers(suppliers.map((s) => (s.id === item.id ? item : s)));
  };

  const setIsPreferred = (id: string) => {
    setSuppliers(
      suppliers.map((supplier) => ({
        ...supplier,
        isPreferred: supplier.id === id,
      })),
    );
  };

  const removeSupplier = (id: string) => {
    setSuppliers(suppliers.filter((supplier) => supplier.id !== id));
  };

  const submit = () => {
    onSubmit(suppliers);
  };

  const supplierItem = suppliers.map((supplier, index) => (
    <SupplierItem
      index={index}
      key={supplier.id}
      supplier={supplier}
      updateSupplier={updateSupplier}
      setIsPreferred={setIsPreferred}
      removeSupplier={removeSupplier}
      containerStyles={{width: '50%', pr: '1rem', my: '1rem'}}
      showRemoveButton={suppliers.length > 1}
    />
  ));

  const disableSaveButton = () =>
    suppliers.some(
      (s) => s.supplierId && !schema.isValidSync({supplierId: s.supplierId}),
    );

  return (
    <Dialog
      title={t('Edit Suppliers Information')}
      isSaving={isLoading}
      disableSaveBtn={disableSaveButton()}
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
          label="Add Supplier"
          style={{mt: '0.5rem'}}
          buttonProps={{
            onClick: addSupplier,
            variant: 'outlined',
            startIcon: <AddIcon />,
            size: 'medium',
            sx: {
              background: 'transparent',
            },
          }}
        />
      </Box>
    </Dialog>
  );
};

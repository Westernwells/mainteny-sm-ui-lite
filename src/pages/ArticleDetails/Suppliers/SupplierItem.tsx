import {useState} from 'react';
import Box from '@mui/material/Box';
import useTheme from '@mui/material/styles/useTheme';
import Typography from '@mui/material/Typography';
import {useTranslation} from 'react-i18next';
import {ArticleSupplierView, ExtendedSupplierRecord} from 'models/article';
import {FormInput} from 'components/form/FormInput';
import {FormRadio} from 'components/form/FormRadio';
import {ComboBox} from 'components/ComboBox';
import {createEmptyResource, makePage} from 'utils/paging-utils';
import {useQueryArticleSuppliers} from 'hooks/reactQuery/useArticle';
import {Button} from 'components/Button';

interface Props {
  index: number;
  supplier: ExtendedSupplierRecord;
  updateSupplier: (item: ExtendedSupplierRecord) => void;
  setIsPreferred: (id: string) => void;
  removeSupplier: (id: string) => void;
  containerStyles?: {[key: string]: any};
  showRemoveButton?: boolean;
}

const pageSize = 50;

export const SupplierItem = ({
  index,
  supplier,
  updateSupplier,
  setIsPreferred,
  removeSupplier,
  containerStyles,
  showRemoveButton = false,
}: Props) => {
  const theme = useTheme();
  const {t} = useTranslation();
  const [modelQuery, setModelQuery] = useState('');
  const {
    data: articleSupplierResource = createEmptyResource<ArticleSupplierView>(
      pageSize,
    ),
  } = useQueryArticleSuppliers(makePage(0, pageSize), modelQuery, {
    keepPreviousData: true,
  });

  return (
    <Box display="flex" flexWrap="wrap" py={2} maxWidth="54rem">
      <Box
        display="flex"
        flexBasis="100%"
        justifyContent="space-between"
        alignItems="center">
        <Typography variant="caption">{`${t('SUPPLIER')} #${
          index + 1
        }`}</Typography>

        {showRemoveButton && (
          <Button
            style={{
              color: theme.palette.error.main,
            }}
            buttonProps={{
              onClick: () => {
                removeSupplier(supplier.id);
              },
            }}>
            {t('Remove')}
          </Button>
        )}
      </Box>
      <ComboBox
        containerStyles={{...containerStyles}}
        options={articleSupplierResource.data.map((item) => ({
          label: item.name,
          value: item.id,
        }))}
        getValue={(item) => {
          if (item?.value) {
            updateSupplier({...supplier, supplierId: item.value});
          }
        }}
        initialValue={
          supplier.supplierId
            ? {
                label:
                  articleSupplierResource.data.find(
                    (item) => item.id === supplier.supplierId,
                  )?.name ?? '',
                value: supplier.supplierId,
              }
            : null
        }
        getQuery={(item) => setModelQuery(item || '')}
        textFieldProps={{
          name: 'supplierId',
          label: t('Supplier name'),
        }}
      />
      <FormInput
        containerStyles={{...containerStyles}}
        props={{
          id: 'supplierNumber',
          label: t('Supplier specific article number'),
          placeholder: t('e.g. 00000001'),
          value: supplier.number,
          variant: 'outlined',
          type: 'text',
          onChange: (e) =>
            updateSupplier({...supplier, number: e.target.value}),
        }}
      />
      <Box flexBasis="100%">
        <FormRadio
          checked={supplier.isPreferred}
          handleChange={() => setIsPreferred(supplier.id)}
          label={t('Preferred Supplier')}
        />
      </Box>
    </Box>
  );
};

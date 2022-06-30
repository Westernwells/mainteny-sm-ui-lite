import Box from '@mui/material/Box';
import {useTranslation} from 'react-i18next';
import {FormikProps} from 'formik';
import {FormInput} from '../../../components/form/FormInput';
import {ArticleStockFormModel} from '../../../models/articleForm';

export const EditStockForm = ({
  containerStyles,
  formik,
}: {
  containerStyles?: {[key: string]: any};
  formik: FormikProps<ArticleStockFormModel>;
}) => {
  const {t} = useTranslation();
  return (
    <Box component="form" sx={{...containerStyles}}>
      <FormInput
        containerStyles={{width: '50%', pr: '1rem', my: '1rem'}}
        props={{
          name: 'maxStock',
          label: t('Maximum Stock'),
          placeholder: 'e.g. 50',
          value: formik.values.maxStock,
          variant: 'outlined',
          inputProps: {min: 0},
          type: 'number',
          onBlur: formik.handleBlur,
          onChange: formik.handleChange,
        }}
      />
      <FormInput
        containerStyles={{width: '50%', my: '1rem'}}
        props={{
          name: 'currentStock',
          label: t('Current Stock'),
          placeholder: 'e.g. 100',
          value: formik.values.currentStock,
          variant: 'outlined',
          inputProps: {min: 0},
          type: 'number',
          onBlur: formik.handleBlur,
          onChange: formik.handleChange,
        }}
      />
      <FormInput
        containerStyles={{width: '50%', pr: '1rem', my: '1rem'}}
        props={{
          name: 'minStock',
          label: t('Minimum Stock'),
          placeholder: 'e.g. 50',
          value: formik.values.minStock,
          variant: 'outlined',
          inputProps: {min: 0},
          type: 'number',
          onBlur: formik.handleBlur,
          onChange: formik.handleChange,
        }}
      />
      <FormInput
        containerStyles={{width: '50%', my: '1rem'}}
        props={{
          name: 'minOrderQuantity',
          label: t('Minimum Order Quantity'),
          placeholder: 'e.g. 10',
          value: formik.values.minOrderQuantity,
          variant: 'outlined',
          inputProps: {min: 0},
          type: 'number',
          onBlur: formik.handleBlur,
          onChange: formik.handleChange,
        }}
      />
    </Box>
  );
};

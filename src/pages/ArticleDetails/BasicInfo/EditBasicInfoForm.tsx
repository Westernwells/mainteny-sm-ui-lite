import {useTranslation} from 'react-i18next';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import {FormikProps} from 'formik';
import {FormInput} from 'components/form/FormInput';
import {FormSelect} from 'components/form/FormSelect';
import {ArticleBasicFormModel, MeasurementUnit} from 'models/articleForm';
import {getCurrencySymbol} from 'utils/currency';
import {SelectArticleType} from './SelectArticleType';

export const EditBasicInfoForm = ({
  containerStyles,
  formik,
}: {
  containerStyles?: {[key: string]: any};
  formik: FormikProps<ArticleBasicFormModel>;
}) => {
  const {t} = useTranslation();
  const currencySymbol =
    getCurrencySymbol[formik.values.unitPurchaseAmountCurrency];
  return (
    <Box display="flex" flexWrap="wrap" component="form">
      <FormInput
        containerStyles={{...containerStyles}}
        props={{
          label: t('Name'),
          name: 'name',
          placeholder: t('e.g. Flat cable, 16G0.75+2x(2x0.5)'),
          type: 'text',
          required: true,
          value: formik.values.name,
          error: !!(formik.touched.name && formik.errors.name),
          onBlur: formik.handleBlur,
          onChange: formik.handleChange,
        }}
      />
      <FormInput
        containerStyles={{...containerStyles}}
        props={{
          label: t('Number'),
          name: 'externalId',
          placeholder: t('e.g. 000001'),
          type: 'text',
          value: formik.values.externalId,
          error: !!(formik.touched.externalId && formik.errors.externalId),
          onBlur: formik.handleBlur,
          onChange: formik.handleChange,
        }}
      />
      <FormInput
        containerStyles={{...containerStyles}}
        props={{
          name: 'manufacturer',
          label: t('Manufacturer'),
          placeholder: t('e.g. Meier'),
          variant: 'outlined',
          type: 'text',
          value: formik.values.manufacturer,
          helperText: formik.errors.manufacturer,
          onBlur: formik.handleBlur,
          onChange: formik.handleChange,
        }}
      />
      <FormInput
        containerStyles={{...containerStyles}}
        props={{
          name: 'model',
          label: t('Model'),
          placeholder: t('e.g. 16G0.75+2x(2x0.5)'),
          variant: 'outlined',
          type: 'text',
          value: formik.values.model,
          helperText: formik.errors.model,
          onBlur: formik.handleBlur,
          onChange: formik.handleChange,
        }}
      />
      <FormInput
        containerStyles={{...containerStyles}}
        props={{
          label: t('Category'),
          name: 'category',
          placeholder: t('e.g. Cable'),
          type: 'text',
          value: formik.values.category,
          error: !!(formik.touched.category && formik.errors.category),
          onBlur: formik.handleBlur,
          onChange: formik.handleChange,
        }}
      />
      <Box
        display="flex"
        justifyContent="space-between"
        sx={{...containerStyles}}>
        <FormInput
          containerStyles={{pr: '1rem'}}
          props={{
            name: 'unitPurchaseVat',
            label: t('Purchase VAT'),
            placeholder: t('19%'),
            inputProps: {min: 0, max: 100},
            type: 'number',
            value: formik.values.unitPurchaseVat,
            error: !!(
              formik.touched.unitPurchaseVat && formik.errors.unitPurchaseVat
            ),
            helperText: formik.errors.unitPurchaseVat,
            required: true,
            onBlur: formik.handleBlur,
            onChange: formik.handleChange,
            InputProps: {
              startAdornment: (
                <InputAdornment position="start">%</InputAdornment>
              ),
            },
          }}
        />

        <FormInput
          props={{
            name: 'unitSellingVat',
            label: t('Selling VAT'),
            placeholder: t('19%'),
            variant: 'outlined',
            inputProps: {min: 0, max: 100},
            type: 'number',
            value: formik.values.unitSellingVat,
            error: !!(
              formik.touched.unitSellingVat && formik.errors.unitSellingVat
            ),
            helperText: formik.errors.unitSellingVat,
            required: true,
            onBlur: formik.handleBlur,
            onChange: formik.handleChange,
            InputProps: {
              startAdornment: (
                <InputAdornment position="start">%</InputAdornment>
              ),
            },
          }}
        />
      </Box>

      <FormSelect
        containerStyles={{...containerStyles}}
        labelId="select-unit-label"
        label="Unit"
        options={Object.keys(MeasurementUnit).map((item) => ({
          label: item,
          value: item,
        }))}
        selectProps={{
          id: 'select-unit',
          value: formik.values.unit,
          onChange: formik.handleChange,
          error: !!(formik.touched.unit && formik.errors.unit),
          placeholder: t('Select Unit'),
          name: 'unit',
        }}
        required
      />

      <Box
        display="flex"
        justifyContent="space-between"
        sx={{...containerStyles}}>
        <FormInput
          containerStyles={{pr: '1rem'}}
          props={{
            name: 'unitPurchaseAmount',
            label: t('Purchase price (excl. VAT)'),
            placeholder: t(`e.g. 150{{currencySymbol}}`, {currencySymbol}),
            inputProps: {min: 0},
            type: 'number',
            value: formik.values.unitPurchaseAmount,
            helperText: formik.errors.unitPurchaseAmount,
            onBlur: formik.handleBlur,
            onChange: formik.handleChange,
            InputProps: {
              startAdornment: (
                <InputAdornment position="start">
                  {currencySymbol}
                </InputAdornment>
              ),
            },
          }}
        />

        <FormInput
          props={{
            name: 'unitSellingAmount',
            label: t('Selling price (excl. VAT)'),
            placeholder: t(`e.g. 200{{currencySymbol}}`, {currencySymbol}),
            inputProps: {min: 0},
            type: 'number',
            required: true,
            value: formik.values.unitSellingAmount,
            error: !!(
              formik.touched.unitSellingAmount &&
              formik.errors.unitSellingAmount
            ),
            helperText: formik.errors.unitSellingAmount,
            onBlur: formik.handleBlur,
            onChange: formik.handleChange,
            InputProps: {
              startAdornment: (
                <InputAdornment position="start">
                  {currencySymbol}
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      <FormInput
        containerStyles={{...containerStyles}}
        props={{
          name: 'storageLocation',
          label: t('Storage Location'),
          placeholder: t('e.g. Rack 20, Box 4'),
          variant: 'outlined',
          type: 'text',
          value: formik.values.storageLocation,
          helperText: formik.errors.storageLocation,
          onBlur: formik.handleBlur,
          onChange: formik.handleChange,
        }}
      />
      <SelectArticleType
        selectedArticleType={formik.values.type}
        formik={formik}
      />
    </Box>
  );
};

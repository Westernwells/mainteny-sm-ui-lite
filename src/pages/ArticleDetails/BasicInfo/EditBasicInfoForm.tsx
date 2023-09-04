import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import {FormSelect} from 'components/form/FormSelect';
import {FormikProps} from 'formik';
import {ArticleType} from '../../../models/article';
import {FormInput} from '../../../components/form/FormInput';
import {convertToText} from '../../../utils/utils';
import {ComboBox} from '../../../components/ComboBox';
import {ArticleBasicFormModel} from '../../../models/articleForm';
import {createEmptyResource} from '../../../utils/paging-utils';
import {useCacheValues} from '../../../hooks/reactQuery/useElevator';
import {CacheTypes} from '../../../models/misc';
import {getCurrencySymbol} from '../../../utils/currency';

export const EditBasicInfoForm = ({
  containerStyles,
  formik,
}: {
  containerStyles?: {[key: string]: any};
  formik: FormikProps<ArticleBasicFormModel>;
}) => {
  const [modelQuery, setModelQuery] = useState('');
  const {t} = useTranslation();
  const {data: elevatorModelsResource = createEmptyResource<string>()} =
    useCacheValues(
      {
        pageIndex: 0,
        pageSize: 10,
        query: modelQuery,
      },
      CacheTypes.ELEVATOR_MODEL,
    );
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
            helperText: formik.errors.unitPurchaseVat,
            disabled: true,
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
            disabled: true,
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

      <ComboBox
        containerStyles={{...containerStyles}}
        options={elevatorModelsResource.data.map((item) => ({
          label: item,
          value: item,
        }))}
        getValue={(item) => formik.setFieldValue('unit', item?.value)}
        initialValue={
          formik.values.unit
            ? {
                label: formik.values.unit,
                value: formik.values.unit,
              }
            : null
        }
        initialQuery={formik.values.unit}
        getQuery={(item) => setModelQuery(item || '')}
        textFieldProps={{
          name: 'unit',
          label: t('Unit'),
          placeholder: t('Select Unit'),
          error: !!(formik.touched.unit && formik.errors.unit),
        }}
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

      <FormSelect
        containerStyles={{...containerStyles}}
        labelId="typeSelect-label"
        label={t('Types')}
        options={Object.keys(ArticleType).map((key) => ({
          label: convertToText(key),
          value: convertToText(key),
        }))}
        selectProps={{
          id: 'typeSelect',
          value: formik.values.type
            ? convertToText(formik.values.type)
            : undefined,
          onChange: formik.handleChange,
          name: 'type',
          placeholder: t('e.g. Select type'),
          error: !!(formik.touched.type && formik.errors.type),
        }}
      />
    </Box>
  );
};

import Box from '@mui/material/Box';
import {useState} from 'react';
import {FormikProps} from 'formik';
import {ArticleType} from '../../../models/article';
import {FormInput} from '../../../components/form/FormInput';
import {convertToText} from '../../../utils/utils';
import {ComboBox} from '../../../components/ComboBox';
import {ArticleBasicFormModel} from '../../../models/articleForm';
import {createEmptyResource} from '../../../utils/paging-utils';
import {useCacheValues} from '../../../hooks/reactQuery/useElevator';
import {CacheTypes} from '../../../models/misc';

export const ArticleBasicInfoForm = ({
  containerStyles,
  formik,
}: {
  containerStyles?: {[key: string]: any};
  formik: FormikProps<ArticleBasicFormModel>;
}) => {
  const [modelQuery, setModelQuery] = useState('');
  const {data: elevatorModelsResource = createEmptyResource<string>()} =
    useCacheValues(
      {
        pageIndex: 0,
        pageSize: 10,
        query: modelQuery,
      },
      CacheTypes.ELEVATOR_MODEL,
    );
  return (
    <Box display="flex" flexWrap="wrap" component="form">
      <FormInput
        containerStyles={{...containerStyles}}
        props={{
          label: 'Name',
          name: 'name',
          placeholder: 'e.g. Flat cable, 16G0.75+2x(2x0.5)',
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
          label: 'External Id',
          name: 'externalId',
          placeholder: 'e.g. 000001',
          type: 'text',
          required: true,
          value: formik.values.externalId,
          error: !!(formik.touched.externalId && formik.errors.externalId),
          onBlur: formik.handleBlur,
          onChange: formik.handleChange,
        }}
      />
      <FormInput
        containerStyles={{...containerStyles}}
        props={{
          label: 'Category',
          name: 'category',
          placeholder: 'e.g. Cable',
          type: 'text',
          required: true,
          value: formik.values.category,
          error: !!(formik.touched.category && formik.errors.category),
          onBlur: formik.handleBlur,
          onChange: formik.handleChange,
        }}
      />
      <FormInput
        containerStyles={{...containerStyles}}
        props={{
          name: 'manufacturer',
          label: 'Manufacturer',
          placeholder: 'e.g. Meier',
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
          label: 'Model',
          placeholder: 'e.g. 16G0.75+2x(2x0.5)',
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
            label: 'Purchase VAT',
            placeholder: '19%',
            inputProps: {min: 0, max: 100},
            type: 'number',
            value: formik.values.unitPurchaseVat,
            helperText: formik.errors.unitPurchaseVat,
            onBlur: formik.handleBlur,
            onChange: formik.handleChange,
          }}
        />

        <FormInput
          containerStyles={{pr: '1rem'}}
          props={{
            name: 'unitSellingVat',
            label: 'Selling VAT',
            placeholder: '19%',
            variant: 'outlined',
            inputProps: {min: 0, max: 100},
            type: 'number',
            required: true,
            value: formik.values.unitSellingVat,
            error: !!(
              formik.touched.unitSellingVat && formik.errors.unitSellingVat
            ),
            helperText: formik.errors.unitSellingVat,
            onBlur: formik.handleBlur,
            onChange: formik.handleChange,
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
          label: 'Unit',
          required: true,
          placeholder: 'Select Unit',
          error: !!(formik.touched.unit && formik.errors.unit),
        }}
      />

      <FormInput
        containerStyles={{...containerStyles}}
        props={{
          name: 'storageLocation',
          label: 'Storage Location',
          placeholder: 'e.g. Rack 20, Box 4',
          variant: 'outlined',
          type: 'text',
          value: formik.values.storageLocation,
          helperText: formik.errors.storageLocation,
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
            name: 'unitPurchaseAmount',
            label: 'Purchase Price',
            placeholder: 'e.g. 150€',
            inputProps: {min: 0},
            type: 'number',
            value: formik.values.unitPurchaseAmount,
            helperText: formik.errors.unitPurchaseAmount,
            onBlur: formik.handleBlur,
            onChange: formik.handleChange,
          }}
        />

        <FormInput
          containerStyles={{pr: '1rem'}}
          props={{
            name: 'unitSellingAmount',
            label: 'Selling Price',
            placeholder: 'e.g. 200€',
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
          }}
        />
      </Box>

      <ComboBox
        containerStyles={{...containerStyles}}
        options={Object.keys(ArticleType).map((key) => ({
          label: convertToText(key),
          value: convertToText(key),
        }))}
        initialValue={
          formik.values.type
            ? {
                label: convertToText(formik.values.type),
                value: convertToText(formik.values.type),
              }
            : null
        }
        initialQuery={formik.values.type}
        getValue={(item) => formik.setFieldValue('type', item?.value)}
        textFieldProps={{
          name: 'type',
          label: 'Type',
          required: true,
          placeholder: 'e.g. Select type',
          error: !!(formik.touched.type && formik.errors.type),
        }}
      />
    </Box>
  );
};

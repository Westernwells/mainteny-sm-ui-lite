import {useTranslation} from 'react-i18next';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import {FormikErrors, useFormik} from 'formik';
import {ServiceOrderArticleView} from 'models/service-order';
import {FormInput} from 'components/form/FormInput';
import {FormSelect} from 'components/form/FormSelect';
import {
  ArticleBasicFormModel,
  MeasurementUnit,
  createMeasurementOptions,
} from 'models/articleForm';
import {getCurrencySymbol} from 'utils/currency';
import * as Yup from 'yup';
import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
} from 'react';
import {LanguageContext} from 'context/LanguageProvider';
import {EditArticleFormModel} from './models';
import {SelectArticleType} from './SelectArticleType';

const validationSchema = Yup.object().shape({
  name: Yup.string().nullable().required('Name is required'),
  unitSellingAmount: Yup.number().nullable().required('Unit price is required'),
  quantity: Yup.number()
    .nullable()
    .min(1, "Can't be less than 1")
    .required('Quantity is required'),
  unit: Yup.string().nullable().required('Unit is required'),
  type: Yup.string().nullable().required('Type is required'),
});

export const EditArticleForm = ({
  containerStyles,
  serviceOrderArticle,
  setFormikValues,
  getFormErrors,
}: {
  containerStyles?: {[key: string]: any};
  serviceOrderArticle: ServiceOrderArticleView;
  setFormikValues: Dispatch<
    SetStateAction<EditArticleFormModel | ArticleBasicFormModel | undefined>
  >;
  getFormErrors: (
    errors: FormikErrors<EditArticleFormModel | ArticleBasicFormModel>,
  ) => void;
}) => {
  const {t} = useTranslation();
  const {language: selectedLng} = useContext(LanguageContext);

  const formik = useFormik<EditArticleFormModel | ArticleBasicFormModel>({
    initialValues: {
      name: serviceOrderArticle.name,
      unit: serviceOrderArticle.article.unit,
      unitSellingAmount:
        serviceOrderArticle.unitAmount.netAmount /
        10 ** serviceOrderArticle.unitAmount.fractionDigits!,
      quantity: serviceOrderArticle.quantity,
      type: serviceOrderArticle.article.type,
      costPackage: serviceOrderArticle.article.costPackage,
      unitPurchaseAmountCurrency:
        getCurrencySymbol[serviceOrderArticle.unitAmount.currency],
    },
    onSubmit: () => {},
    validationSchema,
  });

  const handleSelectChange = (selectedValue: string) => {
    formik.setFieldValue('unit', selectedValue);
    setFormikValues(formik.values);
  };

  const currencySymbol =
    getCurrencySymbol[serviceOrderArticle.unitAmount.currency];

  useEffect(() => {
    setFormikValues(formik.values);
  }, [formik]);

  useEffect(() => {
    getFormErrors(formik.errors);
  }, [formik]);

  return (
    <Box display="flex" flexWrap="wrap" component="form">
      <FormInput
        containerStyles={{...containerStyles, width: '50%', pr: '1rem'}}
        fieldProps={{
          label: t('Name'),
          name: 'name',
          placeholder: t('e.g. Flat cable, 16G0.75+2x(2x0.5)'),
          type: 'text',
          required: true,
          value: formik.values.name,
          error: !!(formik.touched.name && formik.errors.name),
          helperText: formik.errors.name,
          onBlur: formik.handleBlur,
          onChange: (e: ChangeEvent<HTMLInputElement>) => {
            formik.setFieldValue('name', e.target.value);
          },
        }}
      />

      <FormInput
        containerStyles={{pr: '1rem', width: '15%'}}
        onValueChange={(values) => {
          formik.setFieldValue(values.name as string, values.value);
        }}
        inputType="currency"
        fieldProps={{
          name: 'unitSellingAmount',
          label: t('Selling price (excl. VAT)'),
          placeholder: t(`e.g. 200{{currencySymbol}}`, {currencySymbol}),
          inputProps: {min: 0},
          type: 'number',
          required: true,
          value: formik.values.unitSellingAmount,
          error: !!(
            formik.touched.unitSellingAmount && formik.errors.unitSellingAmount
          ),
          helperText: formik.errors.unitSellingAmount,
          onBlur: formik.handleBlur,

          InputProps: {
            startAdornment: (
              <InputAdornment position="start">{currencySymbol}</InputAdornment>
            ),
          },
        }}
      />

      <FormInput
        containerStyles={{pr: '1rem', width: '15%'}}
        fieldProps={{
          placeholder: 'e.g. 200',
          label: t('Quantity'),
          name: 'quantity',
          value: formik.values.quantity,
          onBlur: formik.handleBlur,
          onChange: (e: ChangeEvent<HTMLInputElement>) => {
            formik.setFieldValue('quantity', e.target.value);
          },
          error: !!(formik.touched.quantity && formik.errors.quantity),
          helperText:
            formik.touched.quantity && formik.errors.quantity
              ? formik.errors.quantity
              : '',
          required: true,
          type: 'number',
        }}
      />

      <FormSelect
        containerStyles={{...containerStyles, width: '15%'}}
        labelId="select-unit-label"
        label="Unit"
        options={createMeasurementOptions(selectedLng, MeasurementUnit.UE)}
        resetOption={{label: t('Select Unit')}}
        selectProps={{
          id: 'select-unit',
          value: formik.values.unit,
          onChange: (e) => handleSelectChange(e.target.value as string),
          error: !!(formik.touched.unit && formik.errors.unit),
          placeholder: t('Select Unit'),
          name: 'unit',
        }}
        required
      />

      <SelectArticleType
        selectedArticleType={formik.values.type}
        formik={formik}
        handleSelectChange={(value) => {
          formik.setFieldValue('type', value);
        }}
        articleCostPackage={serviceOrderArticle?.article?.costPackage}
      />
    </Box>
  );
};

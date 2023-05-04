import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {FormikHelpers, useFormik} from 'formik';
import * as Yup from 'yup';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import {FormInput} from 'components/form/FormInput';
import {Dialog} from 'components/Dialog';
import {MultipleSelectCheckmarks} from 'components/MultipleSelectCheckmarks';
import {ComboBox} from 'components/ComboBox';
import {
  ArticleType,
  ArticleView,
  PropertyOwnerArticleRecord,
} from 'models/article';
import {CacheTypes} from 'models/misc';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {useCacheValues} from 'hooks/reactQuery/useElevator';
import {
  amountForView,
  amountRecordForBackend,
  getCurrencySymbol,
  makeAmountRecord,
  useCurrentCurrency,
} from 'utils/currency';
import {createEmptyResource} from 'utils/paging-utils';
import {convertToText} from 'utils/utils';

interface Props {
  title: string;
  openDialog: boolean;
  onClose: () => void;
  onSubmit: (
    values: PropertyOwnerArticleRecord,
    formikHelpers: FormikHelpers<PropertyOwnerArticleRecord>,
  ) => void;
  article?: ArticleView;
}

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  externalId: Yup.string(),
  type: Yup.string().required('Type is required'),
  category: Yup.string().required('Category is required'),
  unit: Yup.string().required('Unit is required'),
  unitPurchaseAmount: Yup.object().shape({
    currency: Yup.string().required(),
    netAmount: Yup.number(),
    percentageVat: Yup.number().required(),
  }),
  unitSellingAmount: Yup.object().shape({
    currency: Yup.string().required(),
    netAmount: Yup.number().required('Selling price is required'),
    percentageVat: Yup.number().required(),
  }),
});

export const CustomerPricesForm = ({
  title,
  openDialog,
  onClose,
  onSubmit,
  article,
}: Props) => {
  const {t} = useTranslation();
  const {user} = useUserSession();
  const currentCurrency = useCurrentCurrency();
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

  const percentageVat =
    user?.userAccount?.serviceCompany?.settings?.percentageVat ?? 0;

  const initialValues: PropertyOwnerArticleRecord = {
    name: article?.name ?? '',
    externalId: article?.externalId ?? '',
    type: article?.type ?? ArticleType.SERVICE,
    category: article?.category ?? '',
    unit: article?.unit ?? '',
    unitPurchaseAmount: article?.unitPurchaseAmount
      ? amountForView(article?.unitPurchaseAmount)
      : makeAmountRecord(0, currentCurrency.code, percentageVat),
    unitSellingAmount: article?.unitSellingAmount
      ? amountForView(article?.unitSellingAmount)
      : makeAmountRecord(0, currentCurrency.code, percentageVat),
  };

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    submitForm,
    setFieldValue,
  } = useFormik<PropertyOwnerArticleRecord>({
    initialValues,
    enableReinitialize: true,
    onSubmit: (formikValues, formikHelpers) => {
      const valuesWithPenniesAmount = {
        ...formikValues,
        unitPurchaseAmount: amountRecordForBackend(
          formikValues.unitPurchaseAmount,
        ),
        unitSellingAmount: amountRecordForBackend(
          formikValues.unitSellingAmount,
        ),
      };
      onSubmit(valuesWithPenniesAmount, formikHelpers);
    },
    validationSchema,
  });

  const defaultProps = {
    onChange: handleChange,
    onBlur: handleBlur,
  };

  return (
    <Dialog
      title={title}
      onCancel={onClose}
      onSave={submitForm}
      disableSaveBtn={!!Object.keys(errors).length}
      dialogProps={{
        maxWidth: 'xs',
        open: openDialog || false,
      }}>
      <Grid container spacing={2} sx={{mt: '0.5rem'}}>
        <Grid item xs={12}>
          <FormInput
            props={{
              size: 'small',
              label: 'Name',
              name: 'name',
              value: values.name,
              helperText: touched.name && errors.name,
              error: !!errors.name && touched.name,
              required: true,
              ...defaultProps,
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <Box display="flex" gap="1em">
            <MultipleSelectCheckmarks
              label="Type"
              options={[
                ArticleType.SERVICE,
                ArticleType.PRODUCT,
                ArticleType.PART,
              ].map((i) => convertToText(i))}
              getSelectedValue={(items: string[]) =>
                setFieldValue('type', items[0].toUpperCase() as ArticleType)
              }
              disableClearBtn
              initialSelectedItems={
                values.type
                  ? [convertToText(values.type)]
                  : [convertToText(ArticleType.SERVICE)]
              }
              multiple={false}
              containerStyles={{marginTop: '0.5em', width: '100%'}}
              formControlStyles={{width: '100%'}}
              required
            />
          </Box>
        </Grid>

        <Grid item xs={12}>
          <FormInput
            props={{
              size: 'small',
              label: 'Category',
              name: 'category',
              value: values.category,
              helperText: touched.category && errors.category,
              error: !!errors.category && touched.category,
              required: true,
              ...defaultProps,
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <FormInput
            props={{
              size: 'small',
              label: 'Articles & Spare part Number',
              name: 'externalId',
              value: values.externalId,
              helperText: touched.externalId && errors.externalId,
              error: !!errors.externalId && touched.externalId,
              ...defaultProps,
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <ComboBox
            options={elevatorModelsResource.data.map((item) => ({
              label: item,
              value: item,
            }))}
            getValue={(item) => setFieldValue('unit', item?.value)}
            initialValue={
              values.unit
                ? {
                    label: values.unit,
                    value: values.unit,
                  }
                : null
            }
            initialQuery={values.unit}
            getQuery={(item) => setModelQuery(item || '')}
            textFieldProps={{
              name: 'unit',
              label: t('Unit'),
              required: true,
              placeholder: t('Select unit'),
              error: !!(touched.unit && errors.unit),
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <FormInput
            props={{
              label: t('Purchase price (excl. VAT)'),
              name: 'unitPurchaseAmount.netAmount',
              value: values.unitPurchaseAmount?.netAmount ?? 0,
              helperText:
                touched.unitPurchaseAmount?.netAmount &&
                errors.unitPurchaseAmount?.netAmount,
              error:
                !!errors.unitPurchaseAmount?.netAmount &&
                touched.unitPurchaseAmount?.netAmount,
              inputProps: {min: 0},
              type: 'number',
              InputProps: {
                endAdornment: (
                  <InputAdornment position="end">
                    {
                      getCurrencySymbol[
                        values.unitPurchaseAmount?.currency ?? 0
                      ]
                    }
                  </InputAdornment>
                ),
              },
              ...defaultProps,
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <FormInput
            props={{
              label: t('Selling price (excl. VAT)'),
              name: 'unitSellingAmount.netAmount',
              value: values.unitSellingAmount?.netAmount ?? 0,
              helperText:
                touched.unitSellingAmount?.netAmount &&
                errors.unitSellingAmount?.netAmount,
              error:
                !!errors.unitSellingAmount?.netAmount &&
                touched.unitSellingAmount?.netAmount,
              inputProps: {min: 0},
              type: 'number',
              required: true,
              InputProps: {
                endAdornment: (
                  <InputAdornment position="end">
                    {getCurrencySymbol[values.unitSellingAmount?.currency ?? 0]}
                  </InputAdornment>
                ),
              },
              ...defaultProps,
            }}
          />
        </Grid>
      </Grid>
    </Dialog>
  );
};

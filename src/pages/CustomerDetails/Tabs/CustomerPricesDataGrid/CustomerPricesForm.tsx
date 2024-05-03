import {FormikHelpers, useFormik} from 'formik';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import {FormInput} from 'components/form/FormInput';
import {Dialog} from 'components/Dialog';
import {ReactComponent as AlertInfoIcon} from 'assets/icons/AlertInfo.svg';
import Tooltip from '@mui/material/Tooltip';
import {ArticleView, articleTypeOptions} from 'models/article';
import {
  centsToMoney,
  getCurrencySymbol,
  moneyToCents,
  useCurrentCurrency,
} from 'utils/currency';
import {FormSelect} from 'components/form/FormSelect';
import {useTranslation} from 'react-i18next';
import {ArticleAutocomplete} from 'components/ArticleAutoComplete';
import {
  TravelWorkCalculationType,
  TravelWorkFormValues,
  TravelWorkView,
  travelWorkCalculationTypeOptions,
} from 'models/service-company';
import {ServiceOrderType} from 'models/service-order';
import {useState} from 'react';

interface Props {
  title: string;
  openDialog: boolean;
  onClose: () => void;
  onSubmit: (
    values: TravelWorkFormValues,
    formikHelpers: FormikHelpers<TravelWorkFormValues>,
  ) => void;
  travelWork?: TravelWorkView;
}

export const CustomerPricesForm = ({
  title,
  openDialog,
  onClose,
  onSubmit,
  travelWork,
}: Props) => {
  const currentCurrency = useCurrentCurrency();
  const {t} = useTranslation();

  const [selectedArticle, setSelectedArticle] = useState<ArticleView | null>(
    travelWork?.article || null,
  );

  const initialValues: TravelWorkFormValues = {
    articleId: selectedArticle?.id ?? '',
    calculationType:
      travelWork?.calculationType ?? TravelWorkCalculationType.FIXED_FEE,
    serviceOrderType: ServiceOrderType.GENERAL,
    articleSellingPrice: centsToMoney(
      currentCurrency.code,
      selectedArticle?.unitSellingAmount.netAmount ?? 0,
    ),
  };

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    submitForm,
    setFieldValue,
  } = useFormik<TravelWorkFormValues>({
    initialValues,
    enableReinitialize: true,
    onSubmit: (formikValues, formikHelpers) => {
      const valuesWithPenniesAmount: TravelWorkFormValues = {
        ...formikValues,
        articleSellingPrice: moneyToCents(
          currentCurrency.code,
          formikValues.articleSellingPrice,
        ),
        articleId: values.articleId,
      };
      onSubmit(valuesWithPenniesAmount, formikHelpers);
    },
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
        maxWidth: 'md',
        open: openDialog || false,
      }}>
      <Grid container spacing={2} sx={{mt: '0.5rem'}}>
        <Grid item xs={12}>
          <ArticleAutocomplete
            initialValue={travelWork?.article}
            textFieldProps={{
              InputLabelProps: {shrink: true},
              label: 'Name',
              name: 'articleId',
              value: values.articleId,
              helperText: touched.articleId && errors.articleId,
              error: !!errors.articleId && touched.articleId,
              required: true,
              ...defaultProps,
            }}
            getArticle={(value) => {
              setSelectedArticle(value);
              setFieldValue('articleId', value?.id);
            }}
          />
        </Grid>

        <Grid item xs={6}>
          <FormSelect
            labelId="select-type-label"
            label="Type"
            options={articleTypeOptions}
            selectProps={{
              id: 'select-type',
              value: selectedArticle?.type ?? '',
              name: 'type',
              label: 'Type',
              notched: true,
              disabled: true,
            }}
          />
        </Grid>

        <Grid item xs={6}>
          <FormInput
            props={{
              size: 'small',
              label: 'Category',
              name: 'category',
              value: selectedArticle?.category,
              disabled: true,
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <FormSelect
            required
            labelId="select-calculation-type-label"
            label="Automate"
            beforeLabel={
              <Tooltip
                title={t(
                  'Please select the corresponding automation type. This will help to connect the article to the correct values in the invoice. E.g. if you select Hourly Rate (work) this article will be used to calculate the amount for the work hours.',
                )}
                placement="top"
                arrow>
                <span style={{lineHeight: '1', marginRight: '0.2rem'}}>
                  <AlertInfoIcon width="16px" height="16px" />
                </span>
              </Tooltip>
            }
            options={travelWorkCalculationTypeOptions}
            selectProps={{
              id: 'select-calculation-type',
              name: 'calculationType',
              sx: {width: '100%'},
              value: values.calculationType,
              error: !!(touched.calculationType && errors.calculationType),
              onChange: handleChange,
            }}
          />
        </Grid>

        <Grid item xs={6}>
          <FormInput
            props={{
              size: 'small',
              label: 'Articles & Spare part Number',
              name: 'externalId',
              value: selectedArticle?.externalId ?? '',
              disabled: true,
            }}
          />
        </Grid>

        <Grid item xs={6}>
          <FormInput
            props={{
              size: 'small',
              label: 'Unit',
              name: 'unit',
              value: selectedArticle?.unit ?? '',
              disabled: true,
            }}
          />
        </Grid>

        <Grid item xs={6}>
          <FormInput
            inputType="currency"
            props={{
              label: 'Purchase price (excl. VAT)',
              value:
                centsToMoney(
                  currentCurrency.code,
                  selectedArticle?.unitPurchaseAmount?.netAmount,
                ) ?? 0,
              inputProps: {min: 0},
              type: 'number',
              InputProps: {
                disabled: true,
                endAdornment: (
                  <InputAdornment position="end">
                    {
                      getCurrencySymbol[
                        selectedArticle?.unitPurchaseAmount?.currency ?? 0
                      ]
                    }
                  </InputAdornment>
                ),
              },
            }}
          />
        </Grid>

        <Grid item xs={6}>
          <FormInput
            onValueChange={(vals) => {
              setFieldValue(vals.name as string, vals.value);
            }}
            inputType="currency"
            numericFormatProps={{required: true}}
            props={{
              label: 'Selling price (excl. VAT)',
              name: 'articleSellingPrice',
              value: values.articleSellingPrice ?? 0,
              helperText:
                touched.articleSellingPrice && errors.articleSellingPrice,
              error:
                !!errors.articleSellingPrice && touched.articleSellingPrice,
              inputProps: {min: 0},
              type: 'number',
              required: true,
              InputProps: {
                endAdornment: (
                  <InputAdornment position="end">
                    {
                      getCurrencySymbol[
                        selectedArticle?.unitSellingAmount?.currency ?? 0
                      ]
                    }
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

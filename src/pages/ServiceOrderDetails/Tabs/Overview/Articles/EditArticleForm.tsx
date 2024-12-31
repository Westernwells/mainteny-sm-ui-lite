import {useTranslation} from 'react-i18next';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import {FormikErrors, getIn, useFormik} from 'formik';
import {ServiceOrderArticleView} from 'models/service-order';
import {FormInput} from 'components/form/FormInput';
import {FormSelect} from 'components/form/FormSelect';
import {
  ArticleBasicFormModel,
  createMeasurementOptions,
  MeasurementUnit,
} from 'models/articleForm';
import {formatCurrency, getCurrencySymbol} from 'utils/currency';
import * as Yup from 'yup';
import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from 'react';
import {LanguageContext} from 'context/LanguageProvider';
import RichTextField from 'components/RichTextField';
import {
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {ArticleType, articleTypeOptions} from 'models/article';
import {NumericFormat} from 'react-number-format';
import {theme} from 'theme';
import {getAmountFromPercentage} from 'utils/utils';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import {Receipt, ReceiptOutlined} from '@mui/icons-material';
import TextBlockSelect from 'components/text-blocks/TextBlockSelect';
import {TextBlockCategory, TextBlockView} from 'models/text-block';
import {Dialog} from 'components/Dialog';
import {GridCellParams} from '@mui/x-data-grid';
import {useVats} from 'hooks/reactQuery/useVats';
import TextBlockActions from 'components/text-blocks/TextBlockActions';
import {EditArticleFormModel} from './models';

const validationSchema = Yup.object().shape({
  name: Yup.string().nullable().required('Name is required'),
  unitSellingAmount: Yup.number().nullable().required('Unit price is required'),
  quantity: Yup.number()
    .nullable()
    .min(0, "Can't be less than 0")
    .required('Quantity is required'),
  type: Yup.string().nullable().required('Type is required'),
});

export const EditArticleForm = ({
  serviceOrderArticle,
  setFormikValues,
  getFormErrors,
}: {
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
  const {data: taxRates} = useVats();
  const [openTextBlockDialog, setOpenTextBlockDialog] =
    useState<boolean>(false);
  const [activeSubDialog, setActiveSubDialog] = useState<
    'edit' | 'preview' | 'delete' | 'create' | undefined
  >(undefined);
  const [activeTextBlock, setActiveTextBlock] = useState<
    TextBlockView | undefined
  >(undefined);

  const onCloseSubDialogs = () => {
    setActiveSubDialog(undefined);
    setOpenTextBlockDialog(true);
  };

  const formik = useFormik<EditArticleFormModel | ArticleBasicFormModel>({
    initialValues: {
      name: serviceOrderArticle.name,
      description: serviceOrderArticle.description,
      externalId: serviceOrderArticle.article.externalId,
      unit: serviceOrderArticle.article.unit,
      unitSellingAmount:
        serviceOrderArticle.unitAmount.netAmount /
        10 ** serviceOrderArticle.unitAmount.fractionDigits!,
      quantity: serviceOrderArticle.quantity,
      type: serviceOrderArticle.article.type,
      costPackage: serviceOrderArticle.article.costPackage || {
        laborPercentage: 50,
        materialPercentage: 50,
      },
      unitPurchaseAmountCurrency:
        getCurrencySymbol[serviceOrderArticle.unitAmount.currency],
      percentageVat: serviceOrderArticle.unitAmount.percentageVat,
    },
    onSubmit: () => {},
    validationSchema,
  });

  const handleSelectChange = (selectedValue: string) => {
    formik.setFieldValue('unit', selectedValue);
    setFormikValues(formik.values);
  };

  const handleTypeSelectChange = (selectedValue: ArticleType) => {
    formik.setFieldValue('type', selectedValue);
    if (selectedValue === ArticleType.PACKAGE) {
      formik.setFieldValue('costPackage', {
        laborPercentage: 50,
        materialPercentage: 50,
      });
    }
    setFormikValues(formik.values);
  };

  const handleCellClick = (rowParams: GridCellParams<any, any, any>) => {
    formik.setFieldValue('description', rowParams.row.text);
    setOpenTextBlockDialog(false);
  };

  const handleLaborPercentageChange = (values: any) => {
    const laborPercentage = Number(values.value);
    formik.setFieldValue('costPackage.laborPercentage', laborPercentage);
    formik.setFieldValue(
      'costPackage.materialPercentage',
      100 - laborPercentage,
    );
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
    <Box component="form" display="flex" flexDirection="column" p={1}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={8} sx={{paddingTop: '2px'}}>
          <RichTextField
            label="Article Name"
            placeholder="e.g. Flat cable, 16G0.75+2x(2x0.5)"
            html={formik.values.name || ''}
            updateHtml={(h) => formik.setFieldValue('name', h)}
            helperText={formik.touched.name ? formik.errors.name : ''}
            error={!!(formik.touched.name && formik.errors.name)}
            onBlur={formik.handleBlur}
            fieldsetStyles={{padding: '5px 8px', marginTop: '-12px'}}
            required
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <FormInput
            containerStyles={{width: '100%'}}
            fieldProps={{
              name: 'externalId',
              label: 'Article Number',
              placeholder: 'e.g. 1234567',
              value: formik.values.externalId,
              onChange: (e: ChangeEvent<HTMLInputElement>) =>
                formik.setFieldValue('externalId', e.target.value),
            }}
          />
        </Grid>

        <Grid item xs={6} sm={3}>
          <FormInput
            containerStyles={{width: '100%'}}
            onValueChange={(values) => {
              formik.setFieldValue(values.name as string, values.value);
            }}
            inputType="currency"
            fieldProps={{
              name: 'unitPurchaseAmount',
              label: t('Purchase Price'),
              placeholder: t(`e.g. 100{{currencySymbol}}`, {currencySymbol}),
              inputProps: {min: 0},
              type: 'number',
              value: formik.values.unitPurchaseAmount,
              InputProps: {
                startAdornment: (
                  <InputAdornment position="start">
                    {currencySymbol}
                  </InputAdornment>
                ),
              },
            }}
          />
        </Grid>

        <Grid item xs={6} sm={3}>
          <FormInput
            containerStyles={{width: '100%'}}
            onValueChange={(values) => {
              formik.setFieldValue(values.name as string, values.value);
            }}
            inputType="currency"
            fieldProps={{
              name: 'unitSellingAmount',
              label: t('Selling Price'),
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
              InputProps: {
                startAdornment: (
                  <InputAdornment position="start">
                    {currencySymbol}
                  </InputAdornment>
                ),
              },
            }}
          />
        </Grid>

        <Grid item xs={6} sm={2}>
          <FormInput
            containerStyles={{width: '100%'}}
            fieldProps={{
              placeholder: 'e.g. 2',
              label: t('Quantity'),
              name: 'quantity',
              value: formik.values.quantity,
              onBlur: formik.handleBlur,
              onChange: (e: ChangeEvent<HTMLInputElement>) => {
                formik.setFieldValue('quantity', e.target.value);
              },
              error: !!(formik.touched.quantity && formik.errors.quantity),
              helperText: formik.touched.quantity ? formik.errors.quantity : '',
              required: true,
              type: 'number',
            }}
          />
        </Grid>
        <Grid item xs={6} sm={2}>
          <FormControl fullWidth required={false}>
            <InputLabel size="small" shrink variant="outlined">
              {t('Tax rate')}
            </InputLabel>
            <Select
              label={t('Tax rate')}
              size="small"
              value={formik.values.percentageVat}
              renderValue={(value) => `${value}%`}
              name="percentageVat"
              notched
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              required={false}
              MenuProps={{
                anchorOrigin: {
                  vertical: 'bottom',
                  horizontal: 'right',
                },
                transformOrigin: {
                  vertical: 'top',
                  horizontal: 'right',
                },
                slotProps: {
                  paper: {
                    sx: {
                      maxWidth: '20rem',
                    },
                  },
                },
              }}>
              {taxRates?.map((taxRate) => (
                <MenuItem
                  value={taxRate.percentage}
                  key={taxRate.id}
                  sx={{
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                  }}>
                  <Box display="flex" maxWidth="100%" gap={1}>
                    <Typography variant="body1" noWrap color="primary.dark">
                      {taxRate.name}
                    </Typography>
                    <Tooltip title={taxRate.legalNote} arrow placement="top">
                      {taxRate.legalNote ? (
                        <Receipt fontSize="small" />
                      ) : (
                        <ReceiptOutlined fontSize="small" />
                      )}
                    </Tooltip>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {taxRate.percentage}%
                  </Typography>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={6} sm={2}>
          <FormSelect
            containerStyles={{width: '100%'}}
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
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <FormSelect
            containerStyles={{width: '100%'}}
            label="Type"
            options={articleTypeOptions}
            selectProps={{
              value: formik.values.type,
              onChange: (e) =>
                handleTypeSelectChange(e.target.value as ArticleType),
              name: 'type',
              error: !!(formik.touched.type && formik.errors.type),
            }}
            labelId="article-type"
            required
          />
        </Grid>

        {formik.values.type === ArticleType.PACKAGE && (
          <>
            <Grid item xs={12} sm={4}>
              <NumericFormat
                value={formik.values.costPackage?.laborPercentage}
                customInput={TextField}
                suffix="%"
                allowLeadingZeros={false}
                decimalScale={2}
                decimalSeparator={
                  selectedLng === 'DE' || selectedLng === 'SR' ? ',' : '.'
                }
                thousandSeparator={
                  selectedLng === 'DE' || selectedLng === 'SR' ? '.' : ','
                }
                sx={{
                  width: '100%',
                  bgcolor: 'white',
                  '& .MuiInputBase-root': {
                    pr: 0,
                  },
                  '& .MuiOutlinedInput-input': {
                    textAlign: 'right',
                    background: '#FFFFFF',
                  },
                }}
                isAllowed={(values) => {
                  const {floatValue} = values;
                  if (!floatValue) {
                    return true;
                  }

                  if (floatValue < 0) {
                    return false;
                  }

                  const maxValue = 100;

                  return floatValue <= maxValue;
                }}
                InputProps={{
                  name: 'costPackage.laborPercentage',
                  placeholder: t(`e.g. 50%`),
                  id: `costPackage.laborPercentage`,
                  inputMode: 'numeric',
                  error: !!getIn(formik.errors, 'costPackage.laborPercentage'),
                  onBlur: formik.handleBlur,
                  disabled: formik.values.type !== ArticleType.PACKAGE,
                }}
                InputLabelProps={{
                  shrink: true,
                }}
                label={t('Labor')}
                onValueChange={handleLaborPercentageChange}
                size="small"
              />
              {!!formik.values.costPackage?.laborPercentage && (
                <Typography
                  variant="caption"
                  color={theme.palette.primary.main}
                  sx={{
                    justifyContent: 'right',
                    display: 'flex',
                    py: 1,
                    pr: 2,
                  }}>
                  {formatCurrency(
                    getAmountFromPercentage(
                      Number(formik.values.costPackage?.laborPercentage),
                      Number(formik.values.unitSellingAmount),
                    ),
                  )}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12} sm={4}>
              <NumericFormat
                value={
                  formik.values.type === ArticleType.PACKAGE
                    ? 100 - Number(formik.values.costPackage?.laborPercentage)
                    : 0
                }
                customInput={TextField}
                suffix="%"
                allowLeadingZeros={false}
                decimalScale={2}
                decimalSeparator={
                  selectedLng === 'DE' || selectedLng === 'SR' ? ',' : '.'
                }
                thousandSeparator={
                  selectedLng === 'DE' || selectedLng === 'SR' ? '.' : ','
                }
                sx={{
                  width: '100%',
                  bgcolor: 'white',
                  '& .MuiInputBase-root': {
                    pr: 0,
                  },
                  '& .MuiOutlinedInput-input': {
                    textAlign: 'right',
                    background: '#FFFFFF',
                  },
                }}
                isAllowed={(values) => {
                  const {floatValue} = values;
                  if (!floatValue) {
                    return true;
                  }

                  if (floatValue < 0) {
                    return false;
                  }

                  const maxValue = 100;

                  return floatValue <= maxValue;
                }}
                InputProps={{
                  name: 'costPackage.materialPercentage',
                  placeholder: t(`e.g. 20%`),
                  id: `costPackage.materialPercentage`,
                  inputMode: 'numeric',
                  disabled: true,
                  required: false,
                  error: !!getIn(
                    formik.errors,
                    'costPackage.materialPercentage',
                  ),
                  onBlur: formik.handleBlur,
                }}
                InputLabelProps={{
                  shrink: true,
                }}
                label={t('Material')}
                onValueChange={(values) => {
                  formik.setFieldValue(
                    'costPackage.materialPercentage',
                    Number(values.value),
                  );
                }}
                size="small"
              />

              {!!formik.values.costPackage?.laborPercentage && (
                <Typography
                  variant="caption"
                  color={theme.palette.primary.main}
                  sx={{justifyContent: 'right', display: 'flex', py: 1}}>
                  {formatCurrency(
                    Number(formik.values.unitSellingAmount) -
                      getAmountFromPercentage(
                        Number(formik.values.costPackage?.laborPercentage),
                        Number(formik.values.unitSellingAmount),
                      ),
                  )}
                </Typography>
              )}
            </Grid>
          </>
        )}

        <Grid item xs={12}>
          <RichTextField
            label="Article Description"
            placeholder="Enter description here..."
            html={formik.values.description || ''}
            updateHtml={(h) => formik.setFieldValue('description', h)}
            helperText={
              formik.touched.description ? formik.errors.description : ''
            }
            error={!!(formik.touched.description && formik.errors.description)}
            onBlur={formik.handleBlur}
            fieldsetStyles={{padding: '5px 8px'}}
            required
            minRows={4}
            endAdornment={
              <InputAdornment
                component={IconButton}
                disableRipple
                position="end"
                sx={{
                  mt: 1,
                  mr: -1,
                  alignSelf: 'flex-start',
                }}
                onClick={() => {
                  setOpenTextBlockDialog(true);
                }}
                size="small">
                <TextSnippetIcon />
              </InputAdornment>
            }
          />
        </Grid>
      </Grid>

      <Dialog
        title="Click to apply your block"
        disableSaveBtn={!!Object.keys(formik.errors).length}
        onCancel={() => {
          setOpenTextBlockDialog(false);
        }}
        dialogProps={{
          maxWidth: 'sm',
          open: openTextBlockDialog || false,
        }}
        showCancelButton={false}
        showSaveButton={false}>
        <TextBlockSelect
          textBlockCategories={[
            TextBlockCategory.QUOTATION,
            TextBlockCategory.ARTICLE_ORDER,
            TextBlockCategory.INVOICE,
            TextBlockCategory.SERVICE_ORDER,
            TextBlockCategory.SERVICE_ORDER_REPORT,
            TextBlockCategory.EMAIL,
          ]}
          setOpenTextBlockDialog={setOpenTextBlockDialog}
          setActiveSubDialog={setActiveSubDialog}
          setActiveTextBlock={setActiveTextBlock}
          handleCellClick={handleCellClick}
        />
      </Dialog>

      {activeSubDialog && (
        <TextBlockActions
          textBlockCategory={TextBlockCategory.INVOICE}
          activeSubDialog={activeSubDialog}
          setActiveSubDialog={setActiveSubDialog}
          openDialog={
            activeSubDialog === 'edit' || activeSubDialog === 'create'
          }
          openPreviewDialog={activeSubDialog === 'preview'}
          openCancelConfirm={activeSubDialog === 'delete'}
          activeTextBlock={activeTextBlock}
          onCloseSubDialogs={onCloseSubDialogs}
        />
      )}
    </Box>
  );
};

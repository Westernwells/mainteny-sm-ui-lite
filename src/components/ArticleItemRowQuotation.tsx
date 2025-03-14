import React, {useContext, useEffect, useState} from 'react';
import {NumberFormatValues, NumericFormat} from 'react-number-format';
import {useTranslation} from 'react-i18next';
import {isEqual} from 'lodash';
import {
  Box,
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  Popover,
  Select,
  SelectChangeEvent,
  TableCell,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import {getIn, useFormik} from 'formik';
import {DiscountType} from 'models/invoice';
import {MeasurementUnit} from 'models/articleForm';
import {Button} from 'components/Button';
import {LanguageContext} from 'context/LanguageProvider';
import {
  Currencies,
  getDecimalSeparator,
  getThousandsSeparator,
  useCurrentCurrency,
} from 'utils/currency';
import {fixRounding} from 'utils/utils';
import {ArticleType, ArticleView} from 'models/article';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import {ReactComponent as OtherIcon} from 'assets/icons/OtherIcon.svg';
import * as Yup from 'yup';
import {
  calculatePackageMaterialLaborPercentages,
  getArticleTypeText,
  mapUpdatedBodyToArticleView,
} from 'utils/article-utils';
import {getItemTotalAfterPerItemDiscount} from 'utils/calculate-total';
import {QuotationItemRecord} from 'models/quotation';
import {DragIndicator, Receipt, ReceiptOutlined} from '@mui/icons-material';
import {VatView} from 'models/vat';
import {stripHtmlTags} from 'models/text-block';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {PropertyOwnerView} from 'models/propertyManager';
import {FormSelect} from './form/FormSelect';
import ArticleTypeCard from './ArticleTypeCard';
import RichTextField from './RichTextField';
import NewArticleAutoComplete from './NewArticleAutocomplete';

interface Props {
  articleItem: QuotationItemRecord;
  index: number;
  deleteItem: (indexPos: number) => void;
  setItemAtIndex: (indexPos: number, item: QuotationItemRecord) => void;
  handleSelectItem: (row: ArticleView, indexPosition: number) => void;
  taxRates: VatView[];
  defaultVat?: VatView;
  propertyOwner?: PropertyOwnerView;
}

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .test(
      'is-not-empty',
      'Article cannot be empty',
      (value) => !!stripHtmlTags(value || ''),
    )
    .required('Article cannot be empty'),
  article: Yup.object().shape({
    type: Yup.string().required('Article type is required'),
  }),
});

export const ArticleItemRowQuotation = ({
  articleItem,
  index,
  deleteItem,
  setItemAtIndex,
  handleSelectItem,
  defaultVat,
  taxRates,
  propertyOwner,
}: Props) => {
  const {t} = useTranslation();
  const {user} = useUserSession();
  const serviceCompanyId = user?.userAccount.serviceCompany.id;

  const currentCurrency = useCurrentCurrency();
  const [showDescription, setShowDescription] = useState<boolean>(
    !!articleItem.description,
  );
  const [manuallyToggledDescription, setManuallyToggledDescription] =
    useState<boolean>(false);

  const {language: selectedLng} = useContext(LanguageContext);

  const formik = useFormik<QuotationItemRecord>({
    initialValues: {
      ...articleItem,
      quantity: articleItem.quantity !== 0 ? articleItem.quantity : 0,
      unitAmount: {
        ...articleItem.unitAmount,
        percentageVat:
          articleItem.unitAmount.percentageVat !== undefined
            ? articleItem.unitAmount.percentageVat
            : defaultVat !== undefined
            ? defaultVat.percentage
            : 0,
        vatId: articleItem.unitAmount.vatId ?? defaultVat?.id ?? '',
        vatName: articleItem.unitAmount.vatName ?? defaultVat?.name ?? '',
      },
    },
    onSubmit: () => {},
    validationSchema,
    enableReinitialize: true,
  });

  const price =
    (formik.values.unitAmount.netAmount ?? 0) /
    10 ** Currencies[formik.values.unitAmount.currency];

  const totalPriceExclVat = price * formik.values.quantity;
  const totalPriceExclVatAfterDiscount = getItemTotalAfterPerItemDiscount({
    item: {
      unitAmount: {
        netAmount: price,
      },
      quantity: formik.values.quantity,
      discount: formik.values.discount,
    },
  });

  const handleDiscountTypeChange = () => {
    formik.setFieldValue('discount', {
      ...formik.values.discount,
      type:
        formik.values?.discount?.type === DiscountType.AMOUNT
          ? DiscountType.PERCENTAGE
          : DiscountType.AMOUNT,
      amount: {
        value: 0,
        currency: currentCurrency.code,
        fractionDigits: currentCurrency.fractionDigits,
      },
      percentage: 0,
    });
  };

  const handleDiscountValueChange = (values: NumberFormatValues) => {
    const {floatValue} = values;
    if (!formik.values.discount?.type) {
      formik.setFieldValue('discount', {
        type: DiscountType.PERCENTAGE,
        percentage: floatValue || 0,
      });
    } else if (formik.values.discount?.type === DiscountType.AMOUNT) {
      formik.setFieldValue('discount', {
        ...formik.values.discount,
        amount: {
          value: floatValue || 0,
          currency: currentCurrency.code,
          fractionDigits: currentCurrency.fractionDigits,
        },
      });
    } else {
      formik.setFieldValue('discount', {
        ...formik.values.discount,
        percentage: floatValue || 0,
      });
    }
  };

  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
    event.currentTarget.focus();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const onChangePercentageVat = (event: SelectChangeEvent<string>) => {
    const vatId = event.target.value;
    const taxRate = taxRates.find((rate) => rate.id === vatId);
    formik.setFieldValue('unitAmount', {
      ...formik.values.unitAmount,
      vatId: taxRate?.id || '',
      vatName: taxRate?.name || '',
      percentageVat: taxRate?.percentage || 0,
    });
  };

  useEffect(() => {
    if (!isEqual(articleItem, formik.values)) {
      setItemAtIndex(index, {
        ...formik.values,
        article: {
          ...formik.values.article,
          name: formik.values.name,
          type: formik.values.article?.type,
          unit: formik.values.article?.unit,
          unitSellingAmount: formik.values.unitAmount,
        },
        unitAmount: {
          ...formik.values.unitAmount,
          netAmount: fixRounding(
            price * 10 ** Currencies[formik.values.unitAmount.currency],
            2,
          ),
        },
      });
    }
  }, [formik.values]);

  useEffect(() => {
    if (!manuallyToggledDescription) {
      setShowDescription(!!formik.values.description);
    }
  }, [formik.values.description, manuallyToggledDescription]);

  useEffect(() => {
    if (formik.values.article?.type === ArticleType.PACKAGE) {
      const {laborPercentage, materialPercentage} =
        calculatePackageMaterialLaborPercentages(
          articleItem.article?.costPackage ||
            articleItem.article?.additionalInfo?.costPackage,
        );

      formik.setFieldValue('article.costPackage', {
        ...formik.values.article?.costPackage,
        laborPercentage,
        materialPercentage,
      });
    }
  }, [formik.values.article?.type]);

  return (
    <>
      <TableCell
        sx={{width: '2%', display: 'inline-block', verticalAlign: 'top'}}>
        {index + 1}

        <IconButton
          className="drag-indicator"
          size="large"
          sx={{
            visibility: 'hidden',
            position: 'absolute',
            left: '1%',
            top: '50%',
            transform: 'translate(-50%,-50%)',
          }}>
          <DragIndicator sx={{fontSize: '1.25rem'}} />
        </IconButton>
      </TableCell>

      <TableCell sx={{width: '32%', display: 'inline-block'}}>
        <NewArticleAutoComplete
          onBlur={(event: React.FocusEvent<HTMLInputElement>) => {
            formik.setFieldTouched(`name`, true, false);
            formik.setFieldValue(`name`, event.target.value || '');
          }}
          initialValue={articleItem.article as ArticleView}
          onArticleSelect={(_rowId, updatedBody) => {
            const transformedArticle = mapUpdatedBodyToArticleView(
              updatedBody,
              {id: articleItem.id},
            );
            handleSelectItem(transformedArticle, index);
          }}
          rowId={articleItem.id || articleItem.article?.id || ''}
          serviceCompanyId={serviceCompanyId!}
          openOnFocus={false}
          propertyOwner={propertyOwner}
          excludeTypes={[ArticleType.MIX]}
        />
      </TableCell>

      <TableCell sx={{width: '4%', display: 'inline-block'}}>
        <>
          <Tooltip
            title={t(getArticleTypeText(formik.values.article?.type!))}
            arrow
            placement="top">
            <Box
              onClick={handleClick}
              sx={{
                width: '100%',
                borderRadius: '4px',
                height: 41,
                cursor: 'pointer',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#00D1FF0A',
              }}
              tabIndex={0}>
              {formik.values.article?.type === ArticleType.PACKAGE ? (
                <DashboardOutlinedIcon fontSize="medium" />
              ) : formik.values.article?.type === ArticleType.MATERIAL ? (
                <SettingsOutlinedIcon fontSize="medium" />
              ) : formik.values.article?.type === ArticleType.LABOR ? (
                <TimerOutlinedIcon fontSize="medium" />
              ) : (
                <OtherIcon fontSize="2rem" />
              )}
            </Box>
          </Tooltip>
          <Popover
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            sx={{
              '& .MuiPaper-root': {
                width: '350px',
                minHeight: '250px',
                pt: 1,
                pb: 2,
                px: 3,
              },
            }}>
            <ArticleTypeCard
              formik={formik}
              unitPrice={price}
              handleClose={handleClose}
            />
          </Popover>
        </>
      </TableCell>

      <TableCell
        sx={{
          width: '14%',
          display: 'inline-block',
          '& .MuiTextField-root': {width: '100%'},
        }}>
        <NumericFormat
          name="unitAmount.netAmount"
          value={price !== 0 ? price : 0}
          customInput={TextField}
          allowLeadingZeros={false}
          decimalScale={2}
          decimalSeparator={getDecimalSeparator(selectedLng)}
          thousandSeparator={getThousandsSeparator(selectedLng)}
          size="small"
          sx={{
            '& .MuiOutlinedInput-input': {
              textAlign: 'right',
              width: '100%',
            },
          }}
          min={0}
          max={Infinity}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                {currentCurrency.symbol}
              </InputAdornment>
            ),
          }}
          onValueChange={(values) => {
            const {floatValue} = values;
            if (floatValue) {
              formik.setFieldValue(
                'unitAmount.netAmount',
                floatValue *
                  10 ** Currencies[formik.values.unitAmount.currency],
              );
            } else {
              formik.setFieldValue('unitAmount.netAmount', 0);
            }
          }}
        />
      </TableCell>

      <TableCell sx={{width: '6%', display: 'inline-block'}}>
        <NumericFormat
          value={formik.values.quantity !== 0 ? formik.values.quantity : 0}
          customInput={TextField}
          allowLeadingZeros={false}
          decimalScale={2}
          decimalSeparator={getDecimalSeparator(selectedLng)}
          thousandSeparator={getThousandsSeparator(selectedLng)}
          size="small"
          onValueChange={(values) => {
            const {floatValue} = values;
            formik.setFieldValue('quantity', floatValue || 0);
          }}
          isAllowed={(values) => /^\d*\.?\d*$/g.test(values.value)}
          sx={{
            width: '100%',
            '& .MuiInputBase-root': {
              pr: 0,
            },
            '& .MuiOutlinedInput-input': {
              textAlign: 'right',
              width: '100%',
            },
          }}
          InputProps={{
            name: 'quantity',
            id: `quantity-${index}`,
            inputMode: 'numeric',
          }}
        />
      </TableCell>

      <TableCell sx={{width: '6%', display: 'inline-block'}}>
        <FormControl fullWidth required={false}>
          <Select
            labelId={`select-tax-label-${index}`}
            size="small"
            value={
              formik.values.unitAmount.vatId ||
              String(
                formik.values.unitAmount.percentageVat !== 0
                  ? formik.values.unitAmount.percentageVat
                  : 0,
              ) ||
              ''
            }
            renderValue={(value) => {
              const taxRatePercentage = taxRates?.find(
                (item) => item.id === value,
              )?.percentage;

              return `${
                typeof taxRatePercentage === 'number'
                  ? taxRatePercentage
                  : value || 0
              }%`;
            }}
            name="unitAmount.vatId"
            id={`unitAmount.vatId-${index}`}
            notched
            onChange={onChangePercentageVat}
            onBlur={formik.handleBlur}
            IconComponent={() => null}
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
            }}
            sx={{
              '& .MuiSelect-select': {
                textAlign: 'right',
                px: '5px !important',
              },
            }}>
            {taxRates?.map((taxRate) => (
              <MenuItem
                value={taxRate.id}
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
      </TableCell>

      <TableCell sx={{width: '10%', display: 'inline-block'}}>
        <FormSelect
          labelId={`select-unit-label-${index}`}
          label=""
          options={Object.keys(MeasurementUnit).map((item) => ({
            label: item,
            value: item,
          }))}
          resetOption={{label: t('Select Unit')}}
          selectProps={{
            value: formik.values.article?.unit ?? '',
            onChange: formik.handleChange,
            onBlur: formik.handleBlur,
            placeholder: t('Select Unit'),
            name: 'article.unit',
            sx: {width: '100%'},
            error: !!(
              formik.values.name !== '' && getIn(formik.errors, 'article.unit')
            ),
          }}
          errorText={
            formik.values.name !== '' ||
            (getIn(formik.touched, `article.unit`) &&
              getIn(formik.errors, `article.unit`))
              ? getIn(formik.errors, `article.unit`)
              : undefined
          }
        />
      </TableCell>

      {/* DISCOUNT */}
      <TableCell sx={{width: '9%', display: 'inline-block'}}>
        <NumericFormat
          value={
            formik.values.discount?.type === DiscountType.AMOUNT
              ? formik.values.discount?.amount?.value
              : formik.values.discount?.percentage
          }
          isAllowed={(values) => {
            const {floatValue} = values;
            if (!floatValue) {
              return true;
            }

            if (floatValue < 0) {
              return false;
            }

            const maxDiscount: number =
              formik.values.discount?.type === DiscountType.AMOUNT
                ? totalPriceExclVat
                : 100;

            return floatValue <= maxDiscount;
          }}
          customInput={TextField}
          allowLeadingZeros={false}
          decimalScale={2}
          decimalSeparator={getDecimalSeparator(selectedLng)}
          thousandSeparator={getThousandsSeparator(selectedLng)}
          size="small"
          sx={{
            width: '100%',
            '& .MuiInputBase-root': {
              pr: 0,
            },
            '& .MuiOutlinedInput-input': {
              textAlign: 'right',
            },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment
                component={IconButton}
                position="end"
                sx={{
                  py: 2,
                  height: '100%',
                  bgcolor: 'action.hover',
                  borderRadius: 0,
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                  width: '20%',
                }}
                onClick={handleDiscountTypeChange}
                size="small">
                {formik.values.discount?.type === DiscountType.AMOUNT
                  ? currentCurrency.symbol
                  : '%'}
              </InputAdornment>
            ),
          }}
          onValueChange={handleDiscountValueChange}
        />
      </TableCell>

      <TableCell sx={{width: '15%', display: 'inline-block'}}>
        <NumericFormat
          value={totalPriceExclVatAfterDiscount}
          customInput={TextField}
          decimalScale={2}
          fixedDecimalScale
          decimalSeparator={getDecimalSeparator(selectedLng)}
          thousandSeparator={getThousandsSeparator(selectedLng)}
          size="small"
          disabled
          sx={{
            width: '100%',
            '& .MuiOutlinedInput-input': {
              textAlign: 'right',
            },
          }}
        />
      </TableCell>

      <TableCell
        sx={{
          paddingLeft: '0px !important',
          paddingRight: '0px !important',
          display: 'inline-block',
          paddingTop: '0.5em !important',
          width: '2%',
        }}>
        <IconButton
          onClick={() => deleteItem(index)}
          sx={{
            padding: '0px !important',
          }}>
          <DeleteIcon />
        </IconButton>
      </TableCell>

      {showDescription ? (
        <>
          <TableCell
            colSpan={12}
            sx={{width: '54%', display: 'inline-block', ml: '2%'}}>
            <RichTextField
              label="Description"
              test-id={`description-${index}`}
              placeholder="Description"
              html={formik.values.description || ''}
              minRows={1}
              updateHtml={(h) => formik.setFieldValue('description', h)}
              fieldsetStyles={{
                wordBreak: 'break-word',
                whiteSpace: 'pre-wrap',
              }}
            />
          </TableCell>

          <TableCell
            colSpan={12}
            sx={{width: '98%', display: 'inline-block', ml: '2%'}}>
            <Button
              label="Remove Description"
              buttonProps={{
                variant: 'text',
                size: 'small',
                onClick: () => {
                  formik.setFieldValue('description', '');
                  setShowDescription(false);
                },
                sx: {
                  color: 'error.main',
                  fontWeight: 300,
                  px: 0,
                },
              }}
            />
          </TableCell>
        </>
      ) : (
        <TableCell
          colSpan={12}
          sx={{width: '98%', display: 'inline-block', ml: '2%'}}>
          <Button
            label="Add Description"
            buttonProps={{
              variant: 'text',
              size: 'small',
              onClick: () => {
                setShowDescription(true);
                setManuallyToggledDescription(true);
              },
              sx: {
                color: 'text.secondary',
                fontWeight: 300,
                px: 0,
              },
            }}
          />
        </TableCell>
      )}
    </>
  );
};

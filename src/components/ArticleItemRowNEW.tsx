import {useContext, useEffect, useState} from 'react';
import {NumberFormatValues, NumericFormat} from 'react-number-format';
import {useTranslation} from 'react-i18next';
import {
  IconButton,
  TableCell,
  TableRow,
  TextField,
  InputAdornment,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import {useFormik} from 'formik';
import {DiscountType, InvoiceItemRecord} from 'models/invoice';
import {Amount} from 'models/misc';
import {MeasurementUnit} from 'models/articleForm';
import {Button} from 'components/Button';
import {LanguageContext} from 'context/LanguageProvider';
import {useCurrentCurrency} from 'utils/currency';
import {fixRounding} from 'utils/utils';
import {applyDiscount} from 'pages/InvoiceDetails/utils';
import {FormSelect} from './form/FormSelect';

interface Props {
  articleItem: InvoiceItemRecord<Amount>;
  index: number;
  deleteItem: (indexPos: number) => void;
  setItemAtIndex: (indexPos: number, item: InvoiceItemRecord<Amount>) => void;
}

export const ArticleItemRowNEW = ({
  articleItem,
  index,
  deleteItem,
  setItemAtIndex,
}: Props) => {
  const {t} = useTranslation();
  const currentCurrency = useCurrentCurrency();
  const [showDescription, setShowDescription] = useState<boolean>(
    !!articleItem.description,
  );

  const formik = useFormik<InvoiceItemRecord<Amount>>({
    initialValues: articleItem,
    onSubmit: () => {},
  });

  const price =
    formik.values.unitAmount.netAmount /
    10 ** formik.values.unitAmount.fractionDigits!;

  const totalPriceExclVat = applyDiscount({
    actualValue: price * formik.values.quantity,
    ...(formik.values.discount?.type === DiscountType.AMOUNT
      ? {amount: formik.values.discount?.amount?.value ?? 0}
      : {percentage: formik.values.discount?.percentage ?? 0}),
  });

  useEffect(() => {
    setItemAtIndex(index, {
      ...formik.values,
      unitAmount: {
        ...formik.values.unitAmount,
        netAmount: fixRounding(
          price * 10 ** formik.values.unitAmount.fractionDigits,
          2,
        ),
      },
    });
  }, [formik.values]);

  const {language: selectedLng} = useContext(LanguageContext);

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

  return (
    <>
      <TableRow>
        <TableCell>{index + 1}</TableCell>
        <TableCell>
          <TextField
            name="name"
            value={formik.values.name}
            onChange={formik.handleChange}
            size="small"
            fullWidth
            sx={{width: '100%'}}
          />
        </TableCell>

        <TableCell>
          <NumericFormat
            value={price !== 0 ? price : ''}
            customInput={TextField}
            allowLeadingZeros={false}
            decimalScale={2}
            decimalSeparator={
              selectedLng === 'DE' || selectedLng === 'SR' ? ',' : '.'
            }
            thousandSeparator={
              selectedLng === 'DE' || selectedLng === 'SR' ? '.' : ','
            }
            size="small"
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
                  floatValue * 10 ** formik.values.unitAmount.fractionDigits,
                );
              } else {
                formik.setFieldValue('unitAmount.netAmount', 0);
              }
            }}
          />
        </TableCell>

        <TableCell>
          <NumericFormat
            value={formik.values.quantity !== 0 ? formik.values.quantity : ''}
            customInput={TextField}
            allowLeadingZeros={false}
            decimalScale={2}
            decimalSeparator={
              selectedLng === 'DE' || selectedLng === 'SR' ? ',' : '.'
            }
            thousandSeparator={
              selectedLng === 'DE' || selectedLng === 'SR' ? '.' : ','
            }
            inputProps={{
              inputMode: 'numeric',
              pattern: '[0-9]*',
              min: 0,
              max: Infinity,
              step: '0.05',
            }}
            size="small"
            onValueChange={(values) => {
              const {floatValue} = values;
              if (floatValue) {
                formik.setFieldValue('quantity', floatValue);
              } else {
                formik.setFieldValue('quantity', 0);
              }
            }}
          />
        </TableCell>

        <TableCell>
          <NumericFormat
            value={
              formik.values.unitAmount.percentageVat !== 0
                ? formik.values.unitAmount.percentageVat
                : ''
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
            inputProps={{
              inputMode: 'numeric',
              pattern: '[0-9]*',
              min: 0,
              max: Infinity,
              step: '0.05',
              label: 'VAT',
            }}
            size="small"
            onValueChange={(values) => {
              const {floatValue} = values;
              if (floatValue) {
                formik.setFieldValue('unitAmount.percentageVat', floatValue);
              } else {
                formik.setFieldValue('unitAmount.percentageVat', 0);
              }
            }}
          />
        </TableCell>

        <TableCell>
          <FormSelect
            labelId="select-unit-label"
            label=""
            options={Object.keys(MeasurementUnit).map((item) => ({
              label: item,
              value: item,
            }))}
            selectProps={{
              id: 'select-unit',
              value: formik.values.article?.unit,
              onChange: formik.handleChange,
              placeholder: t('Select Unit'),
              name: 'article.unit',
            }}
          />
        </TableCell>

        {/* DISCOUNT */}
        <TableCell>
          <NumericFormat
            value={
              formik.values.discount?.type === DiscountType.AMOUNT
                ? formik.values.discount?.amount?.value
                : formik.values.discount?.percentage
            }
            max={
              formik.values.discount?.type === DiscountType.AMOUNT
                ? formik.values.discount?.amount?.value
                : 100
            }
            min={0}
            isAllowed={(values) => {
              const {floatValue} = values;
              if (!floatValue) {
                return true;
              }

              return (
                formik.values.discount?.type === DiscountType.AMOUNT ||
                floatValue <= 100
              );
            }}
            customInput={TextField}
            allowLeadingZeros={false}
            decimalScale={2}
            decimalSeparator={
              selectedLng === 'DE' || selectedLng === 'SR' ? ',' : '.'
            }
            thousandSeparator={
              selectedLng === 'DE' || selectedLng === 'SR' ? '.' : ','
            }
            size="small"
            sx={{
              '& .MuiInputBase-root': {
                pr: 0,
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

        <TableCell>
          <NumericFormat
            value={totalPriceExclVat}
            customInput={TextField}
            decimalScale={2}
            fixedDecimalScale
            decimalSeparator={
              selectedLng === 'DE' || selectedLng === 'SR' ? ',' : '.'
            }
            thousandSeparator={
              selectedLng === 'DE' || selectedLng === 'SR' ? '.' : ','
            }
            size="small"
            disabled
          />
        </TableCell>

        <TableCell>
          <IconButton onClick={() => deleteItem(index)}>
            <DeleteIcon />
          </IconButton>
        </TableCell>
      </TableRow>

      {showDescription ? (
        <>
          <TableRow>
            <TableCell />
            <TableCell colSpan={7}>
              <TextField
                name="description"
                size="small"
                placeholder={t('Description')}
                multiline
                fullWidth
                value={formik.values.description}
                minRows={4}
                maxRows={4}
                onChange={formik.handleChange}
                sx={{mt: 0.5}}
              />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell />
            <TableCell colSpan={7}>
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
          </TableRow>
        </>
      ) : (
        <TableRow>
          <TableCell />
          <TableCell colSpan={7}>
            <Button
              label="Add Description"
              buttonProps={{
                variant: 'text',
                size: 'small',
                onClick: () => setShowDescription(true),
                sx: {
                  color: 'text.secondary',
                  fontWeight: 300,
                  px: 0,
                },
              }}
            />
          </TableCell>
        </TableRow>
      )}
    </>
  );
};

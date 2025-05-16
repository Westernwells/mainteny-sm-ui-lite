import {Typography, TextField} from '@mui/material';
import {Box} from '@mui/system';
import {Button} from 'components/Button';
import {FormSelect} from 'components/form/FormSelect';
import {LanguageContext} from 'context/LanguageProvider';
import {Add} from '@mui/icons-material';
import {Discount, DiscountType, DiscountTypeOptions} from 'models/invoice';
import {useContext} from 'react';
import {
  Controller,
  FieldValues,
  Path,
  PathValue,
  UseFormReturn,
} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {NumberFormatValues, NumericFormat} from 'react-number-format';
import {formatCurrency, useCurrentCurrency} from 'utils/currency';
import {calculateSwitchedDiscount} from 'utils/mixed-position';

type DiscountFormShape = {
  discount?: Discount;
};

type Props<TForm extends DiscountFormShape & FieldValues> = {
  formMethods: UseFormReturn<TForm>;
  amountBeforeGlobalDiscountFormatted: string;
  amountBeforeGlobalDiscount: number;
  onRecalc: () => void;
  disableInlineEditing?: boolean;
  onEditDiscount?: () => void;
};

const DiscountPanel = <TForm extends DiscountFormShape & FieldValues>({
  formMethods,
  amountBeforeGlobalDiscountFormatted,
  amountBeforeGlobalDiscount,
  onRecalc,
  disableInlineEditing,
  onEditDiscount,
}: Props<TForm>) => {
  const {t} = useTranslation();
  const {language: selectedLng} = useContext(LanguageContext);
  const currentCurrency = useCurrentCurrency();

  const {control, setValue, watch} = formMethods;

  const watchedDiscount = watch('discount' as Path<TForm>);

  const handleAddDiscount = () => {
    setValue(
      'discount' as Path<TForm>,
      {
        type: DiscountType.AMOUNT,
        amount: {
          value: 0,
          currency: currentCurrency.code,
        },
        percentage: 0,
      } as PathValue<TForm, Path<TForm>>,
    );
  };

  const handleRemoveDiscount = () => {
    setValue(
      'discount' as Path<TForm>,
      {
        type: DiscountType.NONE,
      } as PathValue<TForm, Path<TForm>>,
    );
  };

  const handleDiscountValueChange = (values: NumberFormatValues) => {
    const {floatValue} = values;
    const discountProperty = {...watchedDiscount};

    if (watchedDiscount?.type === DiscountType.AMOUNT) {
      setValue(
        'discount' as Path<TForm>,
        {
          ...discountProperty!,
          amount: {
            value: floatValue || 0,
            currency: currentCurrency.code,
            fractionDigits: currentCurrency.fractionDigits,
          },
        } as PathValue<TForm, Path<TForm>>,
      );
    } else {
      setValue(
        'discount' as Path<TForm>,
        {
          ...discountProperty!,
          percentage: floatValue || 0,
        } as PathValue<TForm, Path<TForm>>,
      );
    }

    onRecalc();
  };

  const discountText = selectedLng === 'DE' ? 'Rabatt' : t('Discount');

  const oldDiscount = watch('discount' as Path<TForm>);

  return (
    <Box display="flex" justifyContent="flex-end" mb={2} pr={6}>
      {watchedDiscount?.type === DiscountType.AMOUNT ||
      watchedDiscount?.type === DiscountType.PERCENTAGE ? (
        <Box width={448} display="flex" flexDirection="column" gap={1}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center">
            <Typography variant="subtitle2" color="text.secondary">
              {t('Sum')}
            </Typography>
            <Typography variant="subtitle2" fontWeight={600}>
              {amountBeforeGlobalDiscountFormatted}
            </Typography>
          </Box>

          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center">
            <Typography variant="subtitle2" color="text.secondary">
              {discountText}
            </Typography>

            {!disableInlineEditing ? (
              <Box display="flex" gap={1} alignItems="center" flex="0 0 70%">
                <Controller
                  name={'discount.type' as Path<TForm>}
                  control={control}
                  render={({field}) => (
                    <FormSelect
                      labelId="select-discount-type-label"
                      label=""
                      options={Object.entries(DiscountTypeOptions).map(
                        ([key, val]) => ({
                          label: val,
                          value: key,
                        }),
                      )}
                      selectProps={{
                        id: 'select-discount-type',
                        value: field.value,
                        onChange: (e) => {
                          const newType = e.target.value as DiscountType;

                          const newDiscount = calculateSwitchedDiscount(
                            newType,
                            oldDiscount,
                            amountBeforeGlobalDiscount,
                            currentCurrency,
                          );
                          field.onChange(e);
                          setValue(
                            'discount' as Path<TForm>,
                            newDiscount as PathValue<TForm, Path<TForm>>,
                          );
                          onRecalc();
                        },
                        name: field.name,
                      }}
                      selectStyles={{
                        '& .MuiSelect-select': {
                          py: 0.5,
                          typography: 'body2',
                        },
                      }}
                    />
                  )}
                />
                <NumericFormat
                  name="globalDiscount"
                  value={
                    watchedDiscount?.type === DiscountType.AMOUNT
                      ? watchedDiscount.amount?.value
                      : watchedDiscount.percentage
                  }
                  isAllowed={(values) => {
                    const {floatValue} = values;
                    if (!floatValue) return true;
                    if (floatValue < 0) return false;
                    const maxDiscount =
                      watchedDiscount?.type === DiscountType.AMOUNT
                        ? amountBeforeGlobalDiscount
                        : 100;
                    return floatValue <= maxDiscount;
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
                    '& .MuiOutlinedInput-root': {mb: 0},
                    '& .MuiOutlinedInput-input': {py: 0.3, textAlign: 'right'},
                    width: '200px',
                  }}
                  onValueChange={handleDiscountValueChange}
                />
              </Box>
            ) : (
              <Box
                display="flex"
                gap={1}
                alignItems="right"
                flex="0 0 50%"
                justifyContent="flex-end">
                <Typography
                  variant="subtitle2"
                  fontWeight={600}
                  textAlign="right">
                  {watchedDiscount.type === DiscountType.AMOUNT
                    ? t('Lump-sum')
                    : t('Pecentage')}
                </Typography>
                <Typography
                  variant="subtitle2"
                  fontWeight={600}
                  width={130}
                  textAlign="right">
                  {watchedDiscount.type === DiscountType.AMOUNT
                    ? formatCurrency(watchedDiscount?.amount?.value ?? 0, {
                        currency: currentCurrency?.code,
                        currencySymbol: currentCurrency?.symbol,
                        companyLang: selectedLng,
                      })
                    : `${watchedDiscount.percentage}%`}
                </Typography>
              </Box>
            )}
          </Box>

          {!disableInlineEditing ? (
            <Box display="flex" justifyContent="flex-end">
              <Button
                label="Remove Discount"
                buttonProps={{
                  variant: 'text',
                  size: 'small',
                  onClick: handleRemoveDiscount,
                  sx: {color: 'error.main', fontWeight: 400, p: 0},
                }}
              />
            </Box>
          ) : undefined}
        </Box>
      ) : (
        <Button
          label="Add Discount"
          buttonProps={{
            size: 'small',
            variant: 'outlined',
            sx: {bgcolor: 'transparent'},
            startIcon: <Add />,
            onClick: !disableInlineEditing
              ? () => handleAddDiscount()
              : () => {
                  onEditDiscount?.();
                  handleAddDiscount();
                },
          }}
        />
      )}
    </Box>
  );
};

export default DiscountPanel;

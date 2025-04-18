import {Typography, TextField} from '@mui/material';
import {Box} from '@mui/system';
import {Button} from 'components/Button';
import {FormSelect} from 'components/form/FormSelect';
import {LanguageContext} from 'context/LanguageProvider';
import {Add} from '@mui/icons-material';
import {DiscountType, DiscountTypeOptions} from 'models/invoice';
import {QuotationFormData} from 'models/quotation';
import {useContext} from 'react';
import {Controller, UseFormReturn} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {NumberFormatValues, NumericFormat} from 'react-number-format';
import {useCurrentCurrency} from 'utils/currency';

type Props = {
  formMethods: UseFormReturn<QuotationFormData>;
  amountBeforeGlobalDiscountFormatted: string;
  amountBeforeGlobalDiscount: number;
  onRecalcQuotation: () => void;
};

const DiscountPanel = ({
  formMethods,
  amountBeforeGlobalDiscountFormatted,
  amountBeforeGlobalDiscount,
  onRecalcQuotation,
}: Props) => {
  const {t} = useTranslation();
  const {language: selectedLng} = useContext(LanguageContext);
  const currentCurrency = useCurrentCurrency();

  const {control, setValue, watch} = formMethods;

  const watchedDiscount = watch('discount');

  const handleAddDiscount = () => {
    setValue('discount', {
      type: DiscountType.AMOUNT,
      amount: {
        value: 0,
        currency: currentCurrency.code,
      },
      percentage: 0,
    });
  };

  const handleRemoveDiscount = () => {
    setValue('discount', {
      type: DiscountType.NONE,
    });
  };

  const handleDiscountValueChange = (values: NumberFormatValues) => {
    const {floatValue} = values;
    const discountProperty = {type: watchedDiscount?.type!};

    if (watchedDiscount?.type === DiscountType.AMOUNT) {
      setValue('discount', {
        ...discountProperty!,
        amount: {
          value: floatValue || 0,
          currency: currentCurrency.code,
          fractionDigits: currentCurrency.fractionDigits,
        },
      });
    } else {
      setValue('discount', {
        ...discountProperty!,
        percentage: floatValue || 0,
      });
    }

    onRecalcQuotation();
  };

  const discountText = selectedLng === 'DE' ? 'Rabatt' : t('Discount');

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
            <Box display="flex" gap={1} alignItems="center" flex="0 0 70%">
              <Controller
                name="discount.type"
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
                      onChange: field.onChange,
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
          </Box>

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
        </Box>
      ) : (
        <Button
          label="Add Discount"
          buttonProps={{
            size: 'small',
            variant: 'outlined',
            sx: {bgcolor: 'transparent'},
            startIcon: <Add />,
            onClick: handleAddDiscount,
          }}
        />
      )}
    </Box>
  );
};

export default DiscountPanel;

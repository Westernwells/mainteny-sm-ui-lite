import {useContext} from 'react';
import {Box, Grid, TextField, Typography} from '@mui/material';
import {Switch} from 'components/Switch';
import {
  getDecimalSeparator,
  getThousandsSeparator,
  useCurrentCurrency,
} from 'utils/currency';
import {useTranslation} from 'react-i18next';
import {ReactComponent as BusinessContractApproveIcon} from 'assets/icons/ContractApproveIcon.svg';
import {theme} from 'theme';
import {FormikProps} from 'formik';
import {
  ContractCustomizeContractFormModel,
  ExtendedContractComponentRecord,
} from 'models/contract';
import {NumericFormat} from 'react-number-format';
import {LanguageContext} from 'context/LanguageProvider';
import InvoiceSetup from './InvoiceSetup';

interface Props {
  formik: FormikProps<ContractCustomizeContractFormModel>;
  formikContractComponents: FormikProps<{
    components: ExtendedContractComponentRecord[];
  }>;
}

const NewCustomizeContract = ({formik, formikContractComponents}: Props) => {
  const {t} = useTranslation();
  const {language: selectedLng} = useContext(LanguageContext);
  const currentCurrency = useCurrentCurrency();

  return (
    <Box>
      <Typography
        variant="body2"
        color={theme.palette.text.secondary}
        sx={{py: 0.5}}>
        {t(
          'Select and configure specific contractual data, tailoring the contract setup to meet your unique requirements.',
        )}
      </Typography>
      <Typography variant="body2" color={theme.palette.text.secondary}>
        {t('You can change it later in the contract settings.')}
      </Typography>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          padding: '2em 0em 1em 0em',
        }}>
        <BusinessContractApproveIcon fontSize="2rem" />
        <Typography
          variant="h6"
          color={theme.palette.text.primary}
          sx={{paddingLeft: '1em'}}>
          {t('Contract Setup')}
        </Typography>
      </Box>

      <Box display="flex" alignItems="center">
        <Switch
          value={!formik.values.autoRenewalCancelled}
          onChanged={(value) =>
            formik.setFieldValue('autoRenewalCancelled', !value)
          }
        />
        <Typography variant="body1" sx={{color: 'text.primary'}}>
          {t('Automatic renewal')}
        </Typography>
      </Box>

      <Grid container spacing={2} sx={{padding: '1em 0em 0em 0em'}}>
        {!formik.values.autoRenewalCancelled && (
          <Grid item xs={3}>
            <NumericFormat
              value={formik.values.renewalTerms}
              customInput={TextField}
              allowLeadingZeros={false}
              decimalScale={0}
              decimalSeparator={getDecimalSeparator(selectedLng)}
              thousandSeparator={getThousandsSeparator(selectedLng)}
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

                const maxValue = 1000000000;

                return floatValue <= maxValue;
              }}
              InputProps={{
                name: 'renewalTerms',
                id: `renewalTerms`,
                inputMode: 'numeric',
                error: !!(
                  formik.touched.renewalTerms && formik.errors.renewalTerms
                ),
                onBlur: formik.handleBlur,
              }}
              InputLabelProps={{
                shrink: true,
              }}
              label={t('Renewal period')}
              onValueChange={(values) => {
                formik.setFieldValue('renewalTerms', Number(values.value));
              }}
              size="small"
            />
            <Typography
              variant="body2"
              color={theme.palette.text.secondary}
              sx={{padding: '0.5em 1em'}}>
              {t(
                'After the end date a new contract will be extended for indicated amount of months',
              )}
            </Typography>
          </Grid>
        )}

        <Grid item xs={2}>
          <NumericFormat
            value={formik.values.noticePeriodInMonth}
            customInput={TextField}
            allowLeadingZeros={false}
            decimalScale={0}
            decimalSeparator={getDecimalSeparator(selectedLng)}
            thousandSeparator={getThousandsSeparator(selectedLng)}
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

              const maxValue = 1000000000;

              return floatValue <= maxValue;
            }}
            InputProps={{
              name: 'noticePeriodInMonth',
              id: `noticePeriodInMonth`,
              inputMode: 'numeric',
              error: !!(
                formik.touched.noticePeriodInMonth &&
                formik.errors.noticePeriodInMonth
              ),
              onBlur: formik.handleBlur,
            }}
            InputLabelProps={{
              shrink: true,
            }}
            label={t('Notice period')}
            onValueChange={(values) => {
              formik.setFieldValue('noticePeriodInMonth', Number(values.value));
            }}
            size="small"
          />
          <Typography
            variant="body2"
            color={theme.palette.text.secondary}
            sx={{padding: '0.5em 1em'}}>
            {t('Status will indicate that a contract action is needed')}
          </Typography>
        </Grid>
        <Grid item xs={3}>
          <NumericFormat
            value={formik.values.spendingLimit}
            customInput={TextField}
            prefix={currentCurrency.symbol}
            allowLeadingZeros={false}
            decimalScale={2}
            decimalSeparator={getDecimalSeparator(selectedLng)}
            thousandSeparator={getThousandsSeparator(selectedLng)}
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

              const maxValue = 1000000000000;

              return floatValue <= maxValue;
            }}
            InputProps={{
              name: 'spendingLimit',
              id: `spendingLimit`,
              inputMode: 'numeric',
              error: !!(
                formik.touched.spendingLimit && formik.errors.spendingLimit
              ),
              onBlur: formik.handleBlur,
            }}
            InputLabelProps={{
              shrink: true,
            }}
            label={t('Spending Limit')}
            onValueChange={(values) => {
              formik.setFieldValue('spendingLimit', Number(values.value));
            }}
            size="small"
          />
          <Typography
            variant="body2"
            color={theme.palette.text.secondary}
            sx={{padding: '0.5em 1em'}}>
            {t(
              'If selected by unit, then it will be set per unit. If the spent amount is met, then indication on the contract will appear.',
            )}
          </Typography>
        </Grid>

        <Grid item xs={2}>
          <NumericFormat
            value={
              formik.values.annualPriceAdjustmentPercentage !== 0
                ? formik.values.annualPriceAdjustmentPercentage
                : 0
            }
            customInput={TextField}
            suffix="%"
            allowLeadingZeros={false}
            decimalScale={2}
            decimalSeparator={getDecimalSeparator(selectedLng)}
            thousandSeparator={getThousandsSeparator(selectedLng)}
            sx={{
              width: '100%',
              '& .MuiInputBase-root': {
                pr: 0,
              },
              '& .MuiOutlinedInput-input': {
                textAlign: 'right',
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
              name: 'annualPriceAdjustmentPercentage',
              id: `annualPriceAdjustmentPercentage`,
              inputMode: 'numeric',
            }}
            label={t('Yearly Price Adjustment')}
            InputLabelProps={{
              shrink: true,
            }}
            onValueChange={(values) => {
              const {floatValue} = values;
              formik.setFieldValue(
                'annualPriceAdjustmentPercentage',
                floatValue || 0,
              );
            }}
            size="small"
          />
          <Typography
            variant="body2"
            color={theme.palette.text.secondary}
            sx={{padding: '0.5em 1em'}}>
            {t('Applies on contract renewal')}
          </Typography>
        </Grid>
      </Grid>

      <InvoiceSetup formikContractComponents={formikContractComponents} />
    </Box>
  );
};

export default NewCustomizeContract;

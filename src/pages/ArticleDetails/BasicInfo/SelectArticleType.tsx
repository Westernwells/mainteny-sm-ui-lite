import {useTranslation} from 'react-i18next';
import useTheme from '@mui/material/styles/useTheme';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import RadioGroup from '@mui/material/RadioGroup';
import {FormikProps, getIn} from 'formik';
import {ArticleType} from 'models/article';
import {FormInput} from 'components/form/FormInput';
import {FormRadio} from 'components/form/FormRadio';
import {FormLabel} from 'components/form/FormLabel';
import {ArticleBasicFormModel} from 'models/articleForm';
import {getCurrencySymbol, useCurrentCurrency} from 'utils/currency';
import {getPercentage} from 'utils/utils';

export const articleTypes = [
  {
    value: ArticleType.LABOR,
    label: 'Labor',
    title: 'Labor Expenses / Service Fees / Work Costs',
    subTitle:
      'This category covers the costs associated with the services provided. It includes the labor hours, expertise, and any other service-related expenses incurred to fulfill the job.',
  },
  {
    value: ArticleType.MATERIAL,
    label: 'Material',
    title: 'Material Charges / Parts & Goods / Supply Costs',
    subTitle:
      'This category refers to the costs of all materials, parts, or goods used in the provision of the service. It includes items such as replacement parts, raw materials, or any other tangible items used or delivered.',
  },
  {
    value: ArticleType.PACKAGE,
    label: 'Package',
    title: 'Mix of Labor and Material',
    subTitle:
      "With the 'Package' choice, you can combine work (labor) and items (materials).",
    isPackage: true,
  },
];

export const SelectArticleType = ({
  selectedArticleType,
  formik,
}: {
  selectedArticleType: string;
  formik: FormikProps<ArticleBasicFormModel>;
}) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const currentCurrency = useCurrentCurrency();

  if (!formik.values.costPackage) {
    formik.values.costPackage = {
      labor: {
        value: 0,
        currency: 'EUR',
      },
      material: {
        value: 0,
        currency: 'EUR',
      },
    };
  }
  return (
    <RadioGroup name="radio-buttons-group" sx={{pt: 1}}>
      <FormLabel
        text="Type"
        required
        sx={{color: theme.palette.text.primary, pb: 1}}
      />
      <Box display="flex" gap={2} flexWrap="wrap">
        {articleTypes.map((articleType) => (
          <Box
            key={articleType.label}
            component="label"
            sx={{
              width: '32.3%',
              px: '1.5rem',
              py: '1rem',
              cursor: 'pointer',
              border:
                selectedArticleType === articleType.value
                  ? `1px solid ${theme.palette.eden.main}`
                  : `1px solid ${theme.palette.eden.light}`,
              borderRadius: 2,
              background:
                selectedArticleType === articleType.value
                  ? theme.palette.secondary.outlinedHoverBg
                  : '',
              color:
                selectedArticleType === articleType.value
                  ? theme.palette.text.primary
                  : theme.palette.text.secondary,
            }}>
            <FormRadio
              value={articleType.value}
              checked={selectedArticleType === articleType.value}
              handleChange={(e) => formik.setFieldValue('type', e.target.value)}
              label={
                <Typography
                  variant="h6"
                  component="span"
                  fontSize="1.125rem"
                  fontWeight={400}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                  }}>
                  {t(articleType.label)}
                </Typography>
              }
              radioProps={{
                sx: {color: theme.palette.text.secondary},
              }}
            />
            <Typography variant="body1" fontWeight={700}>
              {t(articleType.title)}
            </Typography>
            <Typography variant="body1">{t(articleType.subTitle)}</Typography>
            {articleType.isPackage && (
              <Box display="flex" justifyContent="space-between" pt="1.8rem">
                <Box>
                  <FormInput
                    containerStyles={{pr: '1rem'}}
                    props={{
                      name: 'costPackage.labor.value',
                      label: t('Labor price'),
                      placeholder: t(`e.g. 150{{currencySymbol}}`, {
                        currencySymbol: currentCurrency.symbol,
                      }),
                      inputProps: {min: 0},
                      type: 'number',
                      value:
                        formik.values.costPackage?.labor.value === 0
                          ? ''
                          : formik.values.costPackage?.labor.value,
                      error: !!getIn(formik.errors, 'costPackage.labor.value'),
                      helperText: getIn(
                        formik.errors,
                        'costPackage.labor.value',
                      ),
                      onBlur: formik.handleBlur,
                      onChange: formik.handleChange,
                      InputProps: {
                        startAdornment: (
                          <InputAdornment position="start">
                            {
                              getCurrencySymbol[
                                formik.values.costPackage?.labor.currency ??
                                  'EUR'
                              ]
                            }
                          </InputAdornment>
                        ),
                      },
                      sx: {
                        bgcolor: 'white',
                      },
                    }}
                  />
                  {!!formik.values.unitSellingAmount && (
                    <Typography
                      variant="caption"
                      color={theme.palette.primary.main}>
                      {getPercentage(
                        formik.values.costPackage?.labor.value ?? 0,
                        Number(formik.values.unitSellingAmount),
                      )}
                      {'% '}
                      {t('labor')}
                    </Typography>
                  )}
                </Box>

                <Box>
                  <FormInput
                    props={{
                      name: 'costPackage.material.value',
                      label: t('Material price'),
                      placeholder: t(`e.g. 200{{currencySymbol}}`, {
                        currencySymbol: currentCurrency.symbol,
                      }),
                      inputProps: {min: 0},
                      type: 'number',
                      value:
                        formik.values.costPackage?.material.value === 0
                          ? ''
                          : formik.values.costPackage?.material.value,
                      error: !!getIn(
                        formik.errors,
                        'costPackage.material.value',
                      ),
                      helperText: getIn(
                        formik.errors,
                        'costPackage.material.value',
                      ),
                      onBlur: formik.handleBlur,
                      onChange: formik.handleChange,
                      InputProps: {
                        startAdornment: (
                          <InputAdornment position="start">
                            {
                              getCurrencySymbol[
                                formik.values.unitPurchaseAmountCurrency
                              ]
                            }
                          </InputAdornment>
                        ),
                      },
                      sx: {
                        bgcolor: 'white',
                      },
                    }}
                  />
                  {!!formik.values.unitSellingAmount && (
                    <Typography
                      variant="caption"
                      color={theme.palette.primary.main}>
                      {getPercentage(
                        formik.values.costPackage?.material.value ?? 0,
                        Number(formik.values.unitSellingAmount),
                      )}
                      {'% '}
                      {t('material')}
                    </Typography>
                  )}
                </Box>
              </Box>
            )}
          </Box>
        ))}
      </Box>
    </RadioGroup>
  );
};

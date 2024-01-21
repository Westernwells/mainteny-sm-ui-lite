import {useTranslation} from 'react-i18next';
import useTheme from '@mui/material/styles/useTheme';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import RadioGroup from '@mui/material/RadioGroup';
import {FormikProps, getIn} from 'formik';
import {ArticleType, CostPackage} from 'models/article';
import {FormRadio} from 'components/form/FormRadio';
import {FormLabel} from 'components/form/FormLabel';
import {ArticleBasicFormModel} from 'models/articleForm';
import {useCurrentCurrency} from 'utils/currency';
import {getAmountFromPercentage} from 'utils/utils';
import {TextField} from '@mui/material';
import {NumericFormat} from 'react-number-format';
import {useContext, useEffect} from 'react';
import {LanguageContext} from 'context/LanguageProvider';

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
  articleCostPackage,
}: {
  selectedArticleType: string;
  formik: FormikProps<ArticleBasicFormModel>;
  articleCostPackage?: CostPackage;
}) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const currentCurrency = useCurrentCurrency();
  const {language: selectedLng} = useContext(LanguageContext);

  useEffect(() => {
    const defaultPackageValues = {
      laborPercentage:
        formik.values.type === ArticleType.PACKAGE
          ? articleCostPackage?.laborPercentage || 50
          : 0,
      materialPercentage:
        formik.values.type === ArticleType.PACKAGE
          ? articleCostPackage?.materialPercentage || 50
          : 0,
    };
    formik.setFieldValue('costPackage', {
      ...formik.values.costPackage,
      ...defaultPackageValues,
    });
  }, [formik.values.type]);

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
                      error: !!getIn(
                        formik.errors,
                        'costPackage.laborPercentage',
                      ),
                      onBlur: formik.handleBlur,
                      disabled: formik.values.type !== ArticleType.PACKAGE,
                    }}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    label={t('Labor')}
                    onValueChange={(values) => {
                      formik.setFieldValue(
                        'costPackage.laborPercentage',
                        Number(values.value),
                      );
                    }}
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
                      {getAmountFromPercentage(
                        Number(formik.values.costPackage?.laborPercentage),
                        Number(formik.values.unitSellingAmount),
                      ).toFixed(2)}
                      {currentCurrency.symbol ?? 'EUR'}
                    </Typography>
                  )}
                </Box>

                <Box pl={2}>
                  <NumericFormat
                    value={
                      formik.values.type === ArticleType.PACKAGE
                        ? 100 -
                          Number(formik.values.costPackage?.laborPercentage)
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
                      {(
                        Number(formik.values.unitSellingAmount) -
                        getAmountFromPercentage(
                          Number(formik.values.costPackage?.laborPercentage),
                          Number(formik.values.unitSellingAmount),
                        )
                      ).toFixed(2)}
                      {currentCurrency.symbol ?? 'EUR'}
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

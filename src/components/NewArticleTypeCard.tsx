import React, {useState, useContext, useEffect} from 'react';
import {Typography, FormControl, RadioGroup, TextField} from '@mui/material';
import {Box} from '@mui/system';
import {Button} from 'components/Button';
import CloseIcon from '@mui/icons-material/Close';
import {useTranslation} from 'react-i18next';
import {ArticleType, CostPackage} from 'models/article';
import {NumericFormat} from 'react-number-format';
import {theme} from 'theme';
import {LanguageContext} from 'context/LanguageProvider';
import {useCurrentCurrency} from 'utils/currency';
import {getAmountFromPercentage} from 'utils/utils';
import {FormRadio} from './form/FormRadio';

const defaultArticleTypes = [
  {value: ArticleType.LABOR, label: 'Labor'},
  {value: ArticleType.MATERIAL, label: 'Material'},
  {value: ArticleType.OTHER, label: 'Other'},
];

type Props = {
  onClose: () => void;
  onSave: (newType?: ArticleType, packageCost?: CostPackage) => void;
  initialValue?: ArticleType;
  articleTypes?: {value: ArticleType; label: string}[];
  packageCost?: CostPackage;
  onPackageCostChange?: (updatedPackage?: CostPackage) => void;
  unitPrice?: number;
};

const NewArticleTypeCard = ({
  onClose,
  onSave,
  initialValue = ArticleType.LABOR,
  articleTypes = defaultArticleTypes,
  packageCost,
  onPackageCostChange,
  unitPrice,
}: Props) => {
  const {t} = useTranslation();
  const {language: selectedLng} = useContext(LanguageContext);
  const currentCurrency = useCurrentCurrency();
  const [tempType, setTempType] = useState<ArticleType | undefined>(
    initialValue,
  );

  const handleLaborChange = (value: number) => {
    const newPackageCost: CostPackage = {
      laborPercentage: value,
      materialPercentage: 100 - value,
    };

    if (onPackageCostChange) {
      onPackageCostChange(newPackageCost);
    }
  };

  useEffect(() => {
    if (
      tempType === ArticleType.PACKAGE &&
      !packageCost &&
      onPackageCostChange
    ) {
      onPackageCostChange({laborPercentage: 50, materialPercentage: 50});
    }
  }, [tempType, packageCost]);

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        <Typography
          sx={{
            py: 2,
            textTransform: 'uppercase',
            color: 'text.secondary',
          }}>
          {t('Article Type')}
        </Typography>

        <Button
          buttonProps={{
            onClick: onClose,
            sx: {mx: 0, mr: -2, p: 1, minWidth: 0},
          }}>
          <CloseIcon />
        </Button>
      </Box>

      <FormControl>
        <RadioGroup name="article-type-group">
          {articleTypes.map((articleType) => (
            <Box key={articleType.value}>
              <FormRadio
                value={articleType.value}
                checked={tempType === articleType.value}
                handleChange={(e) => {
                  const selectedType = e.target.value as ArticleType;
                  setTempType(selectedType);
                }}
                label={
                  <Box sx={{display: 'flex', alignItems: 'center'}}>
                    <Typography
                      variant="h6"
                      component="span"
                      fontSize="1.125rem"
                      fontWeight={400}
                      sx={{ml: 1}}>
                      {t(articleType.label)}
                    </Typography>
                  </Box>
                }
              />

              {tempType === articleType.value &&
                articleType.value === ArticleType.PACKAGE && (
                  <Box display="flex" flexDirection="column" pt="1.8rem">
                    <Box display="flex" justifyContent="space-between">
                      <Box>
                        <NumericFormat
                          value={packageCost?.laborPercentage || ''}
                          customInput={TextField}
                          suffix="%"
                          decimalScale={2}
                          decimalSeparator={
                            selectedLng === 'DE' || selectedLng === 'SR'
                              ? ','
                              : '.'
                          }
                          thousandSeparator={
                            selectedLng === 'DE' || selectedLng === 'SR'
                              ? '.'
                              : ','
                          }
                          isAllowed={(values) => {
                            const {floatValue} = values;
                            if (floatValue === undefined) return true;
                            return floatValue >= 0 && floatValue <= 100;
                          }}
                          InputProps={{
                            name: 'packageCost.laborPercentage',
                            placeholder: t('e.g. 50%'),
                          }}
                          label={t('Labor')}
                          onValueChange={(values) => {
                            const newVal = Number(values.value);
                            handleLaborChange(newVal);
                          }}
                          size="small"
                        />

                        {!!packageCost?.laborPercentage && (
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
                              packageCost.laborPercentage,
                              unitPrice ?? 0,
                            ).toFixed(2)}
                            {currentCurrency.symbol ?? 'EUR'}
                          </Typography>
                        )}
                      </Box>

                      <Box sx={{ml: '1em'}}>
                        <NumericFormat
                          value={
                            packageCost
                              ? 100 - (packageCost.laborPercentage ?? 0)
                              : ''
                          }
                          customInput={TextField}
                          suffix="%"
                          decimalScale={2}
                          decimalSeparator={
                            selectedLng === 'DE' || selectedLng === 'SR'
                              ? ','
                              : '.'
                          }
                          thousandSeparator={
                            selectedLng === 'DE' || selectedLng === 'SR'
                              ? '.'
                              : ','
                          }
                          disabled
                          InputProps={{
                            name: 'packageCost.materialPercentage',
                            placeholder: t('e.g. 50%'),
                          }}
                          label={t('Material')}
                          size="small"
                        />

                        {!!packageCost?.laborPercentage && (
                          <Typography
                            variant="caption"
                            color={theme.palette.primary.main}
                            sx={{
                              justifyContent: 'right',
                              display: 'flex',
                              py: 1,
                            }}>
                            {(
                              (unitPrice ?? 0) -
                              getAmountFromPercentage(
                                packageCost.laborPercentage,
                                unitPrice ?? 0,
                              )
                            ).toFixed(2)}
                            {currentCurrency.symbol ?? 'EUR'}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>
                )}
            </Box>
          ))}
        </RadioGroup>
      </FormControl>

      <Box
        sx={{
          pt: 3,
          pb: 1,
          display: 'flex',
          justifyContent: 'space-between',
        }}>
        <Button label={t('Cancel')} buttonProps={{onClick: onClose}}>
          <Typography variant="subtitle2" color="text.secondary">
            {t('Cancel')}
          </Typography>
        </Button>

        <Button
          label={t('Save')}
          testId="save-article-type-card"
          buttonProps={{
            onClick: () =>
              onSave(
                tempType,
                tempType === ArticleType.PACKAGE ? packageCost : undefined,
              ),
            autoFocus: true,
            variant: 'contained',
          }}>
          <Typography variant="subtitle2">{t('Save')}</Typography>
        </Button>
      </Box>
    </>
  );
};

export default NewArticleTypeCard;

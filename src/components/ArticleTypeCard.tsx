import {Typography, FormControl, RadioGroup, TextField} from '@mui/material';
import {Box} from '@mui/system';
import {FormikProps, getIn} from 'formik';
import {ArticleType} from 'models/article';
import {useContext} from 'react';
import {NumericFormat} from 'react-number-format';
import {theme} from 'theme';
import {getAmountFromPercentage} from 'utils/utils';
import {Button} from 'components/Button';
import CloseIcon from '@mui/icons-material/Close';
import {InvoiceItemRecord} from 'models/invoice';
import {LanguageContext} from 'context/LanguageProvider';
import {useCurrentCurrency} from 'utils/currency';
import {useTranslation} from 'react-i18next';
import {FormRadio} from './form/FormRadio';

const articleTypes = [
  {
    value: ArticleType.LABOR,
    label: 'Labor',
  },
  {
    value: ArticleType.MATERIAL,
    label: 'Material',
  },
  {
    value: ArticleType.PACKAGE,
    label: 'Package',
    isPackage: true,
  },
  {
    value: ArticleType.OTHER,
    label: 'Other',
  },
];

type Props = {
  formik: FormikProps<InvoiceItemRecord>;
  unitPrice: number;
  handleClose: () => void;
};

const ArticleTypeCard = ({formik, unitPrice, handleClose}: Props) => {
  const {t} = useTranslation();
  const {language: selectedLng} = useContext(LanguageContext);
  const currentCurrency = useCurrentCurrency();

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
            onClick: handleClose,
            sx: {
              mx: 0,
              mr: -2,
              p: 1,
              minWidth: 0,
            },
          }}>
          <CloseIcon />
        </Button>
      </Box>

      <FormControl>
        <RadioGroup name="radio-buttons-group">
          {articleTypes.map((articleType) => (
            <Box key={articleType.value}>
              <FormRadio
                value={articleType.value}
                checked={formik.values.article?.type === articleType.value}
                handleChange={(e) =>
                  formik.setFieldValue('article', {
                    ...formik.values.article,
                    type: e.target.value,
                  })
                }
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
              {formik.values.article?.type === articleType.value &&
                articleType.isPackage && (
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    pt="1.8rem">
                    <Box>
                      <NumericFormat
                        value={
                          formik.values.article.costPackage?.laborPercentage
                        }
                        customInput={TextField}
                        suffix="%"
                        allowLeadingZeros={false}
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
                          name: 'article.costPackage.laborPercentage',
                          placeholder: t(`e.g. 50%`),
                          id: `costPackage.laborPercentage`,
                          inputMode: 'numeric',
                          error: !!getIn(
                            formik.errors,
                            'article.costPackage.laborPercentage',
                          ),
                          onBlur: formik.handleBlur,
                          disabled:
                            formik.values.article.type !== ArticleType.PACKAGE,
                        }}
                        InputLabelProps={{
                          shrink: true,
                        }}
                        label={t('Labor')}
                        onValueChange={(values) => {
                          formik.setFieldValue(
                            'article.costPackage.laborPercentage',
                            Number(values.value),
                          );
                        }}
                        size="small"
                      />
                      {!!formik.values.article.costPackage?.laborPercentage && (
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
                            Number(
                              formik.values.article.costPackage
                                ?.laborPercentage,
                            ),
                            Number(unitPrice),
                          ).toFixed(2)}
                          {currentCurrency.symbol ?? 'EUR'}
                        </Typography>
                      )}
                    </Box>

                    <Box sx={{ml: '1em'}}>
                      <NumericFormat
                        value={
                          formik.values.article.type === ArticleType.PACKAGE
                            ? 100 -
                              Number(
                                formik.values.article.costPackage
                                  ?.laborPercentage,
                              )
                            : 0
                        }
                        customInput={TextField}
                        suffix="%"
                        allowLeadingZeros={false}
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
                          name: 'article.costPackage.materialPercentage',
                          placeholder: t(`e.g. 20%`),
                          id: `article.costPackage.materialPercentage`,
                          inputMode: 'numeric',
                          disabled: true,
                          required: false,
                          error: !!getIn(
                            formik.errors,
                            'article.costPackage.materialPercentage',
                          ),
                          onBlur: formik.handleBlur,
                        }}
                        InputLabelProps={{
                          shrink: true,
                        }}
                        label={t('Material')}
                        onValueChange={(values) => {
                          formik.setFieldValue(
                            'article.costPackage.materialPercentage',
                            Number(values.value),
                          );
                        }}
                        size="small"
                      />

                      {!!formik.values.article.costPackage?.laborPercentage && (
                        <Typography
                          variant="caption"
                          color={theme.palette.primary.main}
                          sx={{
                            justifyContent: 'right',
                            display: 'flex',
                            py: 1,
                          }}>
                          {(
                            Number(unitPrice) -
                            getAmountFromPercentage(
                              Number(
                                formik.values.article.costPackage
                                  ?.laborPercentage,
                              ),
                              Number(unitPrice),
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
        </RadioGroup>
      </FormControl>

      <Box
        sx={{
          pt: 3,
          pb: 1,
          display: 'flex',
          justifyContent: 'space-between',
        }}>
        <Button
          label={t('Cancel')}
          buttonProps={{
            onClick: handleClose,
          }}>
          <Typography variant="subtitle2" color="text.secondary">
            {t('Cancel')}
          </Typography>
        </Button>

        <Button
          label={t('Save')}
          buttonProps={{
            onClick: () => {
              handleClose();
            },

            autoFocus: true,
            variant: 'contained',
          }}>
          <Typography variant="subtitle2">{t('Save')}</Typography>
        </Button>
      </Box>
    </>
  );
};

export default ArticleTypeCard;

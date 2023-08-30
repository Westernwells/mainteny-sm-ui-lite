import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import useTheme from '@mui/material/styles/useTheme';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import RadioGroup from '@mui/material/RadioGroup';
import {FormikProps, getIn} from 'formik';
import {ArticleType, ArticleView} from 'models/article';
import {FormInput} from 'components/form/FormInput';
import {FormRadio} from 'components/form/FormRadio';
import {FormLabel} from 'components/form/FormLabel';
import {ComboBox} from 'components/ComboBox';
import {ArticleBasicFormModel} from 'models/articleForm';
import {createEmptyResource} from 'utils/paging-utils';
import {useCacheValues} from 'hooks/reactQuery/useElevator';
import {CacheTypes, Resource} from 'models/misc';
import {getCurrencySymbol, useCurrentCurrency} from 'utils/currency';
import {getPercentage} from 'utils/utils';
import {AutoAwesome} from '@mui/icons-material';
import {Button} from '@mui/material';
import {ServiceCompanyNumberType} from 'models/service-company';
import {
  useCompanyAutoNumberConfig,
  useCompanyNextNumber,
} from 'hooks/reactQuery/useCompanies';
import {useUserSession} from 'hooks/reactQuery/useUserSession';

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
    title: 'Mix of Work and Items',
    subTitle:
      "With the 'Package' choice, you can combine work (labor) and items (materials).",
    isPackage: true,
  },
];

export const AddBasicInfoForm = ({
  containerStyles,
  formik,
  customerResource,
}: {
  containerStyles?: {[key: string]: any};
  formik: FormikProps<ArticleBasicFormModel>;
  customerResource: ArticleView[];
}) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const {user} = useUserSession();
  const currentCurrency = useCurrentCurrency();
  const [modelQuery, setModelQuery] = useState('');
  const selectedArticleType = formik.values.type;
  const {data: elevatorModelsResource = createEmptyResource<string>()} =
    useCacheValues(
      {
        pageIndex: 0,
        pageSize: 10,
        query: modelQuery,
      },
      CacheTypes.ELEVATOR_MODEL,
    );

  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [activeField, setActiveField] = useState<string>('');

  const handleFocus = (e: any) => {
    setActiveField(e.target.name);
  };

  const {data: companyAutoNumberConfig} = useCompanyAutoNumberConfig(
    user?.userAccount.serviceCompany.id,
  );

  const {data: companyNextNumber, refetch: refetchCompanyNumber} =
    useCompanyNextNumber(
      {
        type: ServiceCompanyNumberType.ARTICLE,
      },
      user?.userAccount.serviceCompany.id,
    );

  useEffect(() => {
    formik.setFieldValue('externalId', companyNextNumber?.value);
  }, [companyNextNumber]);

  return (
    <Box display="flex" flexWrap="wrap" component="form">
      <FormInput
        containerStyles={{...containerStyles}}
        props={{
          label: t('Name'),
          name: 'name',
          placeholder: t('e.g. Flat cable, 16G0.75+2x(2x0.5)'),
          type: 'text',
          required: true,
          value: formik.values.name,
          error: !!(formik.touched.name && formik.errors.name),
          onBlur: formik.handleBlur,
          onChange: formik.handleChange,
        }}
      />

      <Box width="33.3%" display="flex" flexDirection="column">
        <FormInput
          containerStyles={{...containerStyles}}
          props={{
            label: t('Number'),
            name: 'externalId',
            placeholder: t('e.g. 000001'),
            type: 'text',
            required: true,
            value: formik.values.externalId,
            error: !!(formik.touched.externalId && formik.errors.externalId),
            onBlur: formik.handleBlur,
            onChange: formik.handleChange,
            sx: {width: '100%'},
          }}
        />
        {(activeField === 'externalId' || formik.touched.externalId) &&
          formik.values.externalId &&
          customerResource.filter(
            (item) => item.externalId === formik.values.externalId,
          ).length > 0 && (
            <Typography
              color="error"
              fontSize="0.75rem"
              letterSpacing="0.03em"
              padding="0.45em 0.65em">
              {t('This ID is already taken. Please enter a different one.')}
            </Typography>
          )}
        {activeField === 'externalId' &&
        !formik.values.externalId &&
        companyAutoNumberConfig?.configRecords.find(
          (item) => item.type === ServiceCompanyNumberType.ARTICLE,
        )?.enabled ? (
          <Box
            sx={{
              borderRadius: '4px',
              boxShadow: '0px 9px 46px 8px #0000001F',
              marginTop: '0.2em',
            }}>
            <Button
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                textAlign: 'left',
                alignItems: 'flex-start',
                width: '100%',
                padding: '1em 2em',
              }}
              onClick={() => {
                refetchCompanyNumber();
                formik.setFieldValue('externalId', companyNextNumber?.value);
              }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingBottom: '0.6em',
                }}>
                <AutoAwesome />
                <Typography variant="subtitle2" sx={{paddingLeft: '0.5em'}}>
                  {t('Generate ID')}
                </Typography>
              </Box>

              <Typography variant="body2" color={theme.palette.text.secondary}>
                {t('Customizable in Settings')}
              </Typography>
            </Button>
          </Box>
        ) : (
          activeField === 'externalId' &&
          !formik.values.externalId &&
          !companyAutoNumberConfig?.configRecords.find(
            (item) => item.type === ServiceCompanyNumberType.ARTICLE,
          )?.enabled && (
            <Box
              sx={{
                borderRadius: '4px',
                boxShadow: '0px 9px 46px 8px #0000001F',
                marginTop: '0.2em',
              }}>
              <Button
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  textAlign: 'left',
                  alignItems: 'flex-start',
                  width: '100%',
                  padding: '1em 2em',
                }}
                onClick={() => setOpenDialog(true)}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingBottom: '0.6em',
                  }}>
                  <AutoAwesome />
                  <Typography variant="subtitle2" sx={{paddingLeft: '0.5em'}}>
                    {t('Enable Automatic ID Generation')}
                  </Typography>
                </Box>

                <Typography
                  variant="body2"
                  color={theme.palette.text.secondary}>
                  {t('Allows for easier number input')}
                </Typography>
              </Button>
            </Box>
          )
        )}
      </Box>

      <FormInput
        containerStyles={{...containerStyles}}
        props={{
          label: t('Category'),
          name: 'category',
          placeholder: t('e.g. Cable'),
          type: 'text',
          required: true,
          value: formik.values.category,
          error: !!(formik.touched.category && formik.errors.category),
          onBlur: formik.handleBlur,
          onChange: formik.handleChange,
        }}
      />
      <FormInput
        containerStyles={{...containerStyles}}
        props={{
          name: 'manufacturer',
          label: t('Manufacturer'),
          placeholder: t('e.g. Meier'),
          variant: 'outlined',
          type: 'text',
          value: formik.values.manufacturer,
          helperText: formik.errors.manufacturer,
          onBlur: formik.handleBlur,
          onChange: formik.handleChange,
        }}
      />
      <FormInput
        containerStyles={{...containerStyles}}
        props={{
          name: 'model',
          label: t('Model'),
          placeholder: t('e.g. 16G0.75+2x(2x0.5)'),
          variant: 'outlined',
          type: 'text',
          value: formik.values.model,
          helperText: formik.errors.model,
          onBlur: formik.handleBlur,
          onChange: formik.handleChange,
        }}
      />

      <Box
        display="flex"
        justifyContent="space-between"
        sx={{...containerStyles}}>
        <FormInput
          containerStyles={{pr: '1rem'}}
          props={{
            name: 'unitPurchaseVat',
            label: t('Purchase VAT'),
            placeholder: '19%',
            inputProps: {min: 0, max: 100},
            type: 'number',
            required: true,
            disabled: true,
            value: formik.values.unitPurchaseVat,
            InputProps: {
              startAdornment: (
                <InputAdornment position="start">%</InputAdornment>
              ),
            },
          }}
        />

        <FormInput
          props={{
            name: 'unitSellingVat',
            label: t('Selling VAT'),
            placeholder: '19%',
            variant: 'outlined',
            inputProps: {min: 0, max: 100},
            type: 'number',
            required: true,
            disabled: true,
            value: formik.values.unitSellingVat,
            InputProps: {
              startAdornment: (
                <InputAdornment position="start">%</InputAdornment>
              ),
            },
          }}
        />
      </Box>

      <ComboBox
        containerStyles={{...containerStyles}}
        options={elevatorModelsResource.data.map((item) => ({
          label: item,
          value: item,
        }))}
        getValue={(item) => formik.setFieldValue('unit', item?.value)}
        initialValue={
          formik.values.unit
            ? {
                label: formik.values.unit,
                value: formik.values.unit,
              }
            : null
        }
        initialQuery={formik.values.unit}
        getQuery={(item) => setModelQuery(item || '')}
        textFieldProps={{
          name: 'unit',
          label: t('Unit'),
          required: true,
          placeholder: t('Select Unit'),
          error: !!(formik.touched.unit && formik.errors.unit),
        }}
      />

      <FormInput
        containerStyles={{...containerStyles}}
        props={{
          name: 'storageLocation',
          label: t('Storage Location'),
          placeholder: t('e.g. Rack 20, Box 4'),
          variant: 'outlined',
          type: 'text',
          value: formik.values.storageLocation,
          helperText: formik.errors.storageLocation,
          onBlur: formik.handleBlur,
          onChange: formik.handleChange,
        }}
      />

      <Box
        display="flex"
        justifyContent="space-between"
        sx={{...containerStyles}}>
        <FormInput
          containerStyles={{pr: '1rem'}}
          props={{
            name: 'unitPurchaseAmount',
            label: t('Purchase Price'),
            placeholder: t(`e.g. 150{{currencySymbol}}`, {
              currencySymbol: currentCurrency.symbol,
            }),
            inputProps: {min: 0},
            type: 'number',
            value: formik.values.unitPurchaseAmount,
            helperText: formik.errors.unitPurchaseAmount,
            onBlur: formik.handleBlur,
            onChange: formik.handleChange,
            InputProps: {
              startAdornment: (
                <InputAdornment position="start">
                  {getCurrencySymbol[formik.values.unitPurchaseAmountCurrency]}
                </InputAdornment>
              ),
            },
          }}
        />

        <FormInput
          props={{
            name: 'unitSellingAmount',
            label: t('Selling Price'),
            placeholder: t(`e.g. 200{{currencySymbol}}`, {
              currencySymbol: currentCurrency.symbol,
            }),
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
            onChange: formik.handleChange,
            InputProps: {
              startAdornment: (
                <InputAdornment position="start">
                  {getCurrencySymbol[formik.values.unitPurchaseAmountCurrency]}
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

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
              sx={{
                width: '32.3%',
                px: '1.5rem',
                py: '1rem',
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
                handleChange={(e) =>
                  formik.setFieldValue('type', e.target.value)
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
                        value: formik.values.costPackage?.labor.value,
                        error: !!getIn(
                          formik.errors,
                          'costPackage.labor.value',
                        ),
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
                          formik.values.unitSellingAmount,
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
                        value: formik.values.costPackage?.material.value,
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
                          formik.values.unitSellingAmount,
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
    </Box>
  );
};

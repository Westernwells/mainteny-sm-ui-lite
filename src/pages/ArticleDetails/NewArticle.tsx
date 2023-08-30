import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import useTheme from '@mui/material/styles/useTheme';
import Divider from '@mui/material/Divider';
import _ from 'lodash';
import cloneDeep from 'lodash/cloneDeep';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {FlexContainer} from 'components/FlexContainer';
import {useArticles, useCreateArticle} from 'hooks/reactQuery/useArticle';
import {Stepper} from 'components/Stepper';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {PageCard} from 'components/PageCard';
import {FormInput} from 'components/form/FormInput';
import {Button} from 'components/Button';
import {ArticleType, ArticleView, SupplierRecord} from 'models/article';
import {ArticleBasicFormModel, ArticleStockFormModel} from 'models/articleForm';
import {Money} from 'models/misc';
import {
  amountRecordForBackend,
  currencyFactor,
  makeAmountRecord,
  useCurrentCurrency,
} from 'utils/currency';
import {createEmptyResource} from 'utils/paging-utils';
import {SupplierItem} from './Suppliers/SupplierItem';
import {AddBasicInfoForm} from './BasicInfo/AddBasicInfoForm';
import {AddStockForm} from './Stock/AddStockForm';

interface TestContextExtended {
  from: [
    {
      value: Money;
    },
    {
      value: {
        labor: Money;
        material: Money;
      };
    },
    {
      value: ArticleBasicFormModel;
    },
  ];
}

const validationSchema = Yup.object().shape({
  category: Yup.string().nullable().required('Category is required'),
  name: Yup.string().nullable().required('Name is required'),
  externalId: Yup.string().nullable().required('External Id is required'),
  type: Yup.string().nullable().required('Type is required'),
  unit: Yup.string().nullable().required('Unit is required'),
  unitSellingVat: Yup.number().nullable().required('Selling VAT is required'),
  unitSellingAmount: Yup.number()
    .nullable()
    .required('Selling price is required'),
  costPackage: Yup.object().shape({
    labor: Yup.object().shape({
      // amount should be required and sum of labor and material should be less than unitSellingAmount
      value: Yup.number()
        .required('Labor price is required')
        .test(
          'value',
          'The sum of labor and material prices should be less than Selling price',
          (value, context) => {
            const {from} = context as Yup.TestContext & TestContextExtended;
            const main = from[2];
            if (value && main.value.unitSellingAmount) {
              return (
                value + (main.value.costPackage?.material?.value ?? 0) <=
                main.value.unitSellingAmount
              );
            }
            return true;
          },
        ),
    }),
  }),
});

export const NewArticle = () => {
  const [activeStep, setActiveStep] = useState(0);
  const {user} = useUserSession();
  const navigate = useNavigate();
  const theme = useTheme();
  const {t} = useTranslation();
  const currentCurrency = useCurrentCurrency();
  const {mutateAsync: createArticle} = useCreateArticle(
    t('Article created successfully'),
  );
  const [description, setDescription] = useState('');
  const [suppliers, setSuppliers] = useState<SupplierRecord[]>([
    {
      name: '',
      number: '',
      email: '',
      phone: '',
      website: '',
      address: {
        fullName: '',
        countryCode: 'DE',
        location: {
          longitude: -1,
          latitude: -1,
        },
      },
      isPreferred: true,
    },
  ]);
  const [disableNextBtn, setDisableNextBtn] = useState(false);

  const steps = [
    t('Add basic info'),
    t('Add description'),
    t('Add stock & suppliers'),
  ];

  const percentageVat =
    user?.userAccount?.serviceCompany?.settings?.percentageVat ?? 0;

  const formik = useFormik<ArticleBasicFormModel>({
    initialValues: {
      category: '',
      manufacturer: '',
      model: '',
      name: '',
      externalId: '',
      storageLocation: '',
      type: ArticleType.LABOR,
      unit: '',
      unitPurchaseVat: percentageVat,
      unitPurchaseAmount: 0,
      unitPurchaseAmountCurrency: currentCurrency.code,
      unitSellingVat: percentageVat,
      unitSellingAmount: 0,
      unitSellingAmountCurrency: currentCurrency.code,
      costPackage: {
        labor: {
          value: 0,
          currency: currentCurrency.code,
        },
        material: {
          value: 0,
          currency: currentCurrency.code,
        },
      },
    },
    onSubmit: () => {},
    validationSchema,
  });

  const formikStock = useFormik<ArticleStockFormModel>({
    initialValues: {
      currentStock: 0,
      maxStock: 0,
      minOrderQuantity: 0,
      minStock: 0,
    },
    onSubmit: () => {},
  });

  useEffect(() => {
    if (activeStep === 0) {
      return setDisableNextBtn(
        !!Object.keys(formik.errors).length ||
          !formik.values.type ||
          formik.values.unitSellingVat > 100 ||
          formik.values.unitPurchaseVat > 100,
      );
    }
    return setDisableNextBtn(false);
  }, [activeStep, formik, suppliers]);

  useEffect(() => {
    // whenever unitSellingAmount changes, update costPackage labor and material to 50% 50% of unitSellingAmount
    formik.setFieldValue('costPackage', {
      labor: {
        value: formik.values.unitSellingAmount * 0.5,
        currency: currentCurrency.code,
      },
      material: {
        value: formik.values.unitSellingAmount * 0.5,
        currency: currentCurrency.code,
      },
    });
  }, [formik.values.unitSellingAmount]);

  const handleCancel = () => {
    setActiveStep(0);
  };

  const createNewArticle = async () => {
    const factor = currencyFactor({currency: currentCurrency.code});
    const article = {
      category: formik.values.category,
      description,
      manufacturer: formik.values.manufacturer,
      model: formik.values.model,
      name: formik.values.name,
      externalId: formik.values.externalId,
      pictureUrls: [],
      serviceCompanyId: user?.userAccount.serviceCompany.id!,
      stock: {
        currentStock: formikStock.values.currentStock,
        maxStock: formikStock.values.maxStock,
        minOrderQuantity: formikStock.values.minOrderQuantity,
        minStock: formikStock.values.minStock,
      },
      storageLocation: formik.values.storageLocation,
      subCategory: '',
      suppliers,
      type: formik.values.type.toUpperCase(),
      unit: formik.values.unit,
      unitPurchaseAmount: amountRecordForBackend(
        makeAmountRecord(
          formik.values.unitPurchaseAmount,
          formik.values.unitPurchaseAmountCurrency,
          formik.values.unitPurchaseVat,
        ),
      ),
      unitSellingAmount: amountRecordForBackend(
        makeAmountRecord(
          formik.values.unitSellingAmount,
          formik.values.unitSellingAmountCurrency,
          formik.values.unitSellingVat,
        ),
      ),
      costPackage: {
        ...formik.values.costPackage,
        labor: {
          ...formik.values.costPackage?.labor,
          value: (formik.values.costPackage?.labor?.value ?? 0) * factor,
          currency: currentCurrency.code,
        },
        material: {
          ...formik.values.costPackage?.material,
          value: (formik.values.costPackage?.material?.value ?? 0) * factor,
          currency: currentCurrency.code,
        },
      },
    };
    const result = await createArticle(article);
    navigate(`/articles/details/${result.value}`);
  };

  const addSupplier = () => {
    const origin = cloneDeep(suppliers);
    const supplier = {
      name: '',
      number: '',
      email: '',
      phone: '',
      website: '',
      address: {
        fullName: '',
        countryCode: 'DE',
        location: {
          longitude: -1,
          latitude: -1,
        },
      },
      isPreferred: false,
    };
    origin.push(supplier);
    setSuppliers(origin);
  };

  const updateSupplier = (item: SupplierRecord) => {
    if (item.isPreferred) {
      _.chain(suppliers)
        .filter((it) => it !== item)
        .each((it) => {
          it.isPreferred = false;
        })
        .value();
    }
    const modified = cloneDeep(suppliers);
    setSuppliers(modified);
  };

  const supplierItem = _.map(suppliers, (supplier, key) => (
    <Box key={key}>
      <SupplierItem
        supplier={supplier}
        updateSupplier={updateSupplier}
        containerStyles={{width: '33%', pr: '1rem', my: '1rem'}}
        useCheckBox={suppliers.length === 1}
      />
      {suppliers.length > 1 && key !== suppliers.length - 1 && (
        <Divider sx={{my: '1rem'}} />
      )}
    </Box>
  ));

  const [type, setType] = useState<ArticleType[]>([]);

  const {
    data: articleResource = createEmptyResource<ArticleView>(10),
    isIdle,
    isLoading,
    isFetching,
    isFetched,
  } = useArticles(
    {
      pageIndex: 0,
      pageSize: 500,
      query: formik.values.externalId,
      type,
    },
    {keepPreviousData: true},
    true,
  );

  console.log(articleResource, 'articleResource');

  return (
    <Stepper
      handleCancel={handleCancel}
      handleSubmit={async () => createNewArticle()}
      getActiveStep={(val) => setActiveStep(val)}
      disableNextBtn={disableNextBtn}
      steps={steps}
      stepperStyles={{width: '100%'}}
      containerStyles={{
        flexGrow: 1,
        ml: '0',
        display: 'flex',
        flexDirection: 'column',
      }}>
      <FlexContainer
        containerStyle={{mt: '1em', overflowY: 'scroll', height: 0}}>
        {activeStep === 0 && (
          <FlexContainer containerStyle={{mt: '2em'}}>
            <PageCard headerLabel={t('Basic Information')} minHeight="100%">
              <AddBasicInfoForm
                formik={formik}
                containerStyles={{
                  width: '33%',
                  pr: '1rem',
                  mr: '0.25rem',
                  my: '1rem',
                }}
                customerResource={articleResource.data}
              />
            </PageCard>
          </FlexContainer>
        )}
        {activeStep === 1 && (
          <FlexContainer containerStyle={{mt: '2em'}}>
            <PageCard headerLabel={t('Description')} minHeight="100%">
              <FormInput
                containerStyles={{width: '60%'}}
                props={{
                  id: 'description',
                  label: t('Description'),
                  placeholder: t(
                    'e.g. Flat cable used for door engines from the following suppliers.....',
                  ),
                  value: description,
                  variant: 'outlined',
                  multiline: true,
                  rows: 10,
                  minRows: 5,
                  type: 'text',
                  onChange: (e) => setDescription(e.target.value),
                }}
              />
            </PageCard>
          </FlexContainer>
        )}
        {activeStep === 2 && (
          <FlexContainer containerStyle={{mt: '2em'}}>
            <PageCard headerLabel={t('Stock Information')} minHeight="100%">
              <AddStockForm
                formik={formikStock}
                containerStyles={{display: 'flex', flexDirection: 'row'}}
              />
              <Box
                display="flex"
                flexDirection="column"
                sx={{
                  boxShadow:
                    suppliers.length > 1 ? '0 2px 5px -3px gray' : 'none',
                }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: theme.palette.text.primary,
                    minHeight: '2rem',
                    mt: '2em',
                    boxShadow:
                      suppliers.length > 1 ? '0 2px 5px -3px gray' : 'none',
                  }}>
                  {t('Suppliers Information')}
                </Typography>
                <Box sx={{height: '210px', overflowY: 'auto'}} component="form">
                  {supplierItem}
                </Box>
              </Box>
              <Box display="flex">
                <Button
                  label={t('+ Add Supplier')}
                  style={{mt: '0.5rem'}}
                  buttonProps={{
                    onClick: () => addSupplier(),
                    variant: 'outlined',
                  }}
                />
              </Box>
            </PageCard>
          </FlexContainer>
        )}
      </FlexContainer>
    </Stepper>
  );
};

export default NewArticle;

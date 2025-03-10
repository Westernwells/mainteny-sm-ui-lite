import AddIcon from '@mui/icons-material/Add';
import LocalShipping from '@mui/icons-material/LocalShipping';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import useTheme from '@mui/material/styles/useTheme';
import {Button} from 'components/Button';
import {FlexContainer} from 'components/FlexContainer';
import {PageCard} from 'components/PageCard';
import {Stepper} from 'components/Stepper';
import {useFormik} from 'formik';
import {useArticles, useCreateArticle} from 'hooks/reactQuery/useArticle';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {useVats} from 'hooks/reactQuery/useVats';
import cloneDeep from 'lodash/cloneDeep';
import {ArticleType, ArticleView} from 'models/article';
import {ArticleBasicFormModel, ArticleStockFormModel} from 'models/articleForm';
import {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useLocation, useNavigate} from 'react-router-dom';
import {getArticleTypes} from 'utils/article-utils';
import {
  amountRecordForBackendWithVatId,
  makeAmountRecordWithVatId,
  useCurrentCurrency,
} from 'utils/currency';
import {createEmptyResource} from 'utils/paging';
import {getUniqueId} from 'utils/utils';
import * as Yup from 'yup';
import RichTextField from '../../components/RichTextField';
import {ExtendedSupplierRecord} from '../../models/supplier';
import {AddBasicInfoForm} from './BasicInfo/AddBasicInfoForm';
import {AddStockForm} from './Stock/AddStockForm';
import {SupplierItem} from './Suppliers/SupplierItem';

const isExternalIdUnique = async (resource: ArticleView[], value?: string) => {
  if (!value) {
    return true;
  }

  try {
    return !(resource && resource.some((item) => item.externalId === value));
  } catch (error) {
    console.error('Error checking externalId uniqueness:', error);
    return true;
  }
};

export const NewArticle = () => {
  const [activeStep, setActiveStep] = useState(0);
  const {user} = useUserSession();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const articleName = searchParams.get('articleName') || '';
  const theme = useTheme();
  const {t} = useTranslation();
  const currentCurrency = useCurrentCurrency();
  const {mutateAsync: createArticle} = useCreateArticle(
    t('Article created successfully'),
  );
  const [description, setDescription] = useState<string>('');
  const [externalIdValue, setExternalIdValue] = useState<string>('');
  const [suppliers, setSuppliers] = useState<ExtendedSupplierRecord[]>([
    {
      id: getUniqueId(),
      supplierId: '',
      number: '',
      isPreferred: true,
    },
  ]);
  const [disableNextBtn, setDisableNextBtn] = useState(false);
  const {data: taxRates} = useVats();

  const steps = [
    t('Add basic info'),
    t('Add description'),
    t('Add stock & suppliers'),
  ];

  const {data: articleResource = createEmptyResource<ArticleView>(10)} =
    useArticles(
      {
        pageIndex: 0,
        pageSize: 500,
        query: externalIdValue,
        type: getArticleTypes({excludeTypes: [ArticleType.MIX]}),
      },
      {keepPreviousData: true},
      true,
    );

  const validationSchema = Yup.object().shape({
    category: Yup.string().nullable().required('Category is required'),
    name: Yup.string().nullable().required('Name is required'),
    externalId: Yup.string()
      .required('Article Number is required')
      .test(
        'checkExternalId',
        'This ID is already taken. Please enter a different one.',
        async (value) => isExternalIdUnique(articleResource.data, value),
      ),
    suppliers: Yup.array().of(
      Yup.object().shape({
        supplierId: Yup.string().uuid().required('Supplier is required'),
      }),
    ),
    type: Yup.string().nullable().required('Type is required'),
    unit: Yup.string().nullable().required('Unit is required'),
    unitPurchaseVat: Yup.string().required('Purchase VAT is required'),
    unitSellingVat: Yup.string().required('Selling VAT is required'),
    unitSellingAmount: Yup.number()
      .nullable()
      .required('Selling price is required'),
    laborPercentage: Yup.number(),
  });

  const formik = useFormik<ArticleBasicFormModel>({
    initialValues: {
      category: '',
      manufacturer: '',
      model: '',
      name: articleName || '',
      externalId: '',
      storageLocation: '',
      type: ArticleType.LABOR,
      unit: '',
      unitPurchaseVat: '',
      unitPurchaseAmount: 0,
      unitPurchaseAmountCurrency: currentCurrency.code,
      unitSellingVat: '',
      unitSellingAmount: 0,
      unitSellingAmountCurrency: currentCurrency.code,
      costPackage: {
        laborPercentage: 0,
        materialPercentage: 0,
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
    setExternalIdValue(formik.values.externalId);
  }, [formik]);

  useEffect(() => {
    if (activeStep === 0) {
      return setDisableNextBtn(
        !!Object.keys(formik.errors).length ||
          !formik.values.type ||
          formik.values.unitSellingVat === '' ||
          formik.values.unitPurchaseVat === '',
      );
    }
    if (activeStep === 2) {
      const schema = Yup.object().shape({
        supplierId: Yup.string().uuid(),
      });
      return setDisableNextBtn(
        suppliers.some(
          (s) =>
            s.supplierId && !schema.isValidSync({supplierId: s.supplierId}),
        ),
      );
    }
    return setDisableNextBtn(false);
  }, [activeStep, formik, suppliers]);

  const handleCancel = () => {
    setActiveStep(0);
  };

  const createNewArticle = async () => {
    const unitPurchaseVat = taxRates?.find(
      (rate) => rate.id === formik.values.unitPurchaseVat,
    );

    const unitSellingVat = taxRates?.find(
      (rate) => rate.id === formik.values.unitSellingVat,
    );

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
      suppliers: suppliers.filter((s) => !!s.supplierId),
      type: formik.values.type.toUpperCase(),
      unit: formik.values.unit,
      unitPurchaseAmount: amountRecordForBackendWithVatId(
        makeAmountRecordWithVatId(
          Number(formik.values.unitPurchaseAmount),
          formik.values.unitPurchaseAmountCurrency,
          unitPurchaseVat?.percentage ?? 0,
          unitPurchaseVat?.id ?? '',
          unitPurchaseVat?.name ?? '',
        ),
      ),
      unitSellingAmount: amountRecordForBackendWithVatId(
        makeAmountRecordWithVatId(
          Number(formik.values.unitSellingAmount),
          formik.values.unitSellingAmountCurrency,
          unitSellingVat?.percentage ?? 0,
          unitSellingVat?.id ?? '',
          unitSellingVat?.name ?? '',
        ),
      ),
      costPackage: {
        ...formik.values.costPackage,
        laborPercentage: formik.values.costPackage?.laborPercentage,
        materialPercentage: formik.values.costPackage?.materialPercentage,
      },
    };
    const result = await createArticle(article);
    navigate(`/articles/details/${result.value}`);
  };

  const addSupplier = () => {
    const origin = cloneDeep(suppliers);
    const supplier: ExtendedSupplierRecord = {
      id: getUniqueId(),
      supplierId: '',
      number: '',
      isPreferred: false,
    };
    origin.push(supplier);
    setSuppliers(origin);
  };

  const updateSupplier = (item: ExtendedSupplierRecord) => {
    setSuppliers(suppliers.map((s) => (s.id === item.id ? item : s)));
  };

  const setIsPreferred = (id: string) => {
    setSuppliers(
      suppliers.map((supplier) => ({
        ...supplier,
        isPreferred: supplier.id === id,
      })),
    );
  };

  const removeSupplier = (id: string) => {
    setSuppliers(suppliers.filter((supplier) => supplier.id !== id));
  };

  const supplierItem = suppliers.map((supplier, index) => (
    <SupplierItem
      index={index}
      key={supplier.id}
      supplier={supplier}
      updateSupplier={updateSupplier}
      setIsPreferred={setIsPreferred}
      removeSupplier={removeSupplier}
      containerStyles={{width: '50%', pr: '1rem', mt: '1rem', mb: '0.5rem'}}
      showRemoveButton={suppliers.length > 1}
    />
  ));

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
              />
            </PageCard>
          </FlexContainer>
        )}
        {activeStep === 1 && (
          <FlexContainer containerStyle={{mt: '2em'}}>
            <PageCard headerLabel={t('Description')} minHeight="100%">
              <RichTextField
                label={t('Description')}
                html={description}
                minRows={5}
                placeholder={t(
                  'e.g. Flat cable used for door engines from the following suppliers.....',
                )}
                updateHtml={(h) => setDescription(h)}
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
                justifyContent="space-between"
                alignItems="center"
                pt={3}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: theme.palette.text.primary,
                    minHeight: '2rem',
                    mt: '2em',
                  }}>
                  {t('Suppliers Information')}
                </Typography>
                <Button
                  style={{
                    color: theme.palette.primary.light,
                  }}
                  buttonProps={{
                    startIcon: <LocalShipping color="primary" />,
                    onClick: () =>
                      window.open('/articles/newSupplier', '_blank'),
                  }}>
                  {t('Create Supplier')}
                </Button>
              </Box>
              <Box component="form">{supplierItem}</Box>
              <Box display="flex">
                <Button
                  label="Add Supplier"
                  style={{mt: '0.5rem'}}
                  buttonProps={{
                    onClick: () => addSupplier(),
                    variant: 'outlined',
                    startIcon: <AddIcon />,
                    size: 'medium',
                    sx: {
                      background: 'transparent',
                    },
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

import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import useTheme from '@mui/material/styles/useTheme';
import _ from 'lodash';
import cloneDeep from 'lodash/cloneDeep';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {FlexContainer} from '../../components/FlexContainer';
import {useCreateArticle} from '../../hooks/reactQuery/useArticle';
import {Stepper} from '../../components/Stepper';
import {useUserSession} from '../../hooks/reactQuery/useUserSession';
import {ArticleType, SupplierRecord} from '../../models/article';
import {PageCard} from '../../components/PageCard';
import {FormInput} from '../../components/form/FormInput';
import {Button} from '../../components/Button';
import {ArticleSupplierItemForm} from './Suppliers/ArticleSupplierItemForm';
import {
  ArticleBasicFormModel,
  ArticleStockFormModel,
} from '../../models/articleForm';
import {ArticleBasicInfoForm} from './BasicInfo/ArticleBasicInfoForm';
import {ArticleStockForm} from './Stock/ArticleStockForm';

const steps = ['Add basic info', 'Add description', 'Add stock & suppliers'];

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
});

export const NewArticle = () => {
  const [activeStep, setActiveStep] = useState(0);
  const {user} = useUserSession();
  const navigate = useNavigate();
  const theme = useTheme();
  const {mutateAsync: createArticle} = useCreateArticle('Article is created');
  const [description, setDescription] = useState('');
  const [suppliers, setSuppliers] = useState<SupplierRecord[]>([]);
  const [disableNextBtn, setDisableNextBtn] = useState(false);

  const formik = useFormik<ArticleBasicFormModel>({
    initialValues: {
      category: '',
      manufacturer: '',
      model: '',
      name: '',
      externalId: '',
      storageLocation: '',
      type: '',
      unit: '',
      unitPurchaseVat: 0,
      unitPurchaseAmount: 0,
      unitSellingVat: 0,
      unitSellingAmount: 0,
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
          (!!formik.values.type &&
            formik.values.type.toUpperCase() === ArticleType.PACKAGE),
      );
    }
    return setDisableNextBtn(false);
  }, [activeStep, formik]);

  const handleCancel = () => {
    setActiveStep(0);
  };

  const createNewArticle = async () => {
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
      unitPurchaseAmount: {
        currency: 'EUR',
        netAmount: formik.values.unitPurchaseAmount,
        percentageVat: formik.values.unitPurchaseVat,
      },
      unitSellingAmount: {
        currency: 'EUR',
        netAmount: formik.values.unitSellingAmount,
        percentageVat: formik.values.unitSellingVat,
      },
    };
    const result = await createArticle(article);
    navigate(`/articles/details/${result.value}`);
  };

  const addSupplier = () => {
    const origin = cloneDeep(suppliers);
    const supplier = {
      id: (origin.length + 1).toString(),
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
    <ArticleSupplierItemForm
      key={key}
      supplier={supplier}
      updateSupplier={updateSupplier}
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
      <FlexContainer>
        {activeStep === 0 && (
          <FlexContainer containerStyle={{mt: '2em'}}>
            <PageCard headerLabel="Basic Information" minHeight="100%">
              <ArticleBasicInfoForm
                formik={formik}
                containerStyles={{width: '33%', pr: '1rem'}}
              />
            </PageCard>
          </FlexContainer>
        )}
        {activeStep === 1 && (
          <FlexContainer containerStyle={{mt: '2em'}}>
            <PageCard headerLabel="Description" minHeight="100%">
              <FormInput
                containerStyles={{width: '60%'}}
                props={{
                  id: 'description',
                  label: 'description',
                  placeholder:
                    'e.g. Flat cable used for door engines from the following suppliers.....',
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
            <PageCard headerLabel="Stock Information" minHeight="100%">
              <ArticleStockForm
                formik={formikStock}
                containerStyles={{display: 'flex', flexDirection: 'row'}}
              />
              <Box display="flex" flexDirection="column">
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: theme.palette.text.primary,
                    minHeight: '2rem',
                    my: '2em',
                  }}>
                  Suppliers Information
                </Typography>
                <Box sx={{height: '160px', overflowY: 'auto'}} component="form">
                  {supplierItem}
                </Box>
              </Box>
              <Box display="flex">
                <Button
                  label="+ Add Supplier"
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

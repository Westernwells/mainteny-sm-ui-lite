import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import {phoneValidationRE} from 'pages/NewEmployee/BasicEmployeeForm';
import {PageCard} from 'components/PageCard';
import {FormInput} from 'components/form/FormInput';
import {AddressAutoComplete} from 'components/AddressAutoComplete';
import {useCreateArticleSupplier} from 'hooks/reactQuery/useArticle';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {CreateArticleSupplierRecord} from 'models/article';

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  externalId: Yup.string().nullable().required('External Id is required'),
  email: Yup.string()
    .email('Enter a valid email')
    .required('Email is required'),
  phone: Yup.string()
    .required('Phone number is required')
    .matches(phoneValidationRE, 'Phone number is not valid'),
  address: Yup.object().nullable().required('Address is required'),
  url: Yup.string().nullable(),
  category: Yup.string().nullable(),
});

const NewSupplier = () => {
  const {user} = useUserSession();
  const navigate = useNavigate();
  const {t} = useTranslation();
  const {mutateAsync: createSupplier} = useCreateArticleSupplier(
    'New supplier created successfully!',
  );

  const formik = useFormik<CreateArticleSupplierRecord>({
    initialValues: {
      serviceCompanyId: user?.userAccount.serviceCompany.id ?? '',
      name: '',
      externalId: '',
      email: '',
      phone: '',
      address: {
        fullName: '',
        countryCode: 'DE',
        location: {
          longitude: -1,
          latitude: -1,
        },
      },
      url: '',
      category: '',
    },
    onSubmit: (values) =>
      createSupplier(values, {
        onSuccess: (result) => navigate(`/articles/supplier/${result.value}`),
      }),
    validationSchema,
  });

  const handleCancel = () => {
    navigate(-1);
  };

  const defaultProps = {
    InputLabelProps: {shrink: true},
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
  };

  return (
    <>
      <PageCard
        headerLabel="Basic Information"
        containerStyles={{flexGrow: 1}}
        headerStyles={{mt: '1rem'}}>
        <Grid container spacing={3} component="form">
          <Grid item md={4}>
            <FormInput
              props={{
                label: 'Name',
                name: 'name',
                placeholder: 'e.g. Würth',
                type: 'text',
                required: true,
                value: formik.values.name,
                helperText: formik.touched.name && formik.errors.name,
                error: !!(formik.touched.name && formik.errors.name),
                ...defaultProps,
              }}
            />
          </Grid>

          <Grid item md={4}>
            <FormInput
              props={{
                label: 'ID',
                name: 'externalId',
                placeholder: 'e.g. 000001',
                type: 'text',
                required: true,
                value: formik.values.externalId,
                helperText:
                  formik.touched.externalId && formik.errors.externalId,
                error: !!(
                  formik.touched.externalId && formik.errors.externalId
                ),
                ...defaultProps,
              }}
            />
          </Grid>

          <Grid item md={4}>
            <FormInput
              props={{
                label: 'Email',
                name: 'email',
                placeholder: 'e.g johndoe@example.com',
                required: true,
                value: formik.values.email,
                helperText: formik.touched.email && formik.errors.email,
                error: !!(formik.touched.email && formik.errors.email),
                ...defaultProps,
              }}
            />
          </Grid>

          <Grid item md={4}>
            <FormInput
              props={{
                label: 'Phone',
                name: 'phone',
                placeholder: 'e.g. 49 173 12345678',
                type: 'text',
                required: true,
                value: formik.values.phone,
                helperText: formik.touched.phone && formik.errors.phone,
                error: !!(formik.touched.phone && formik.errors.phone),
                ...defaultProps,
              }}
            />
          </Grid>

          <Grid item md={4}>
            <AddressAutoComplete
              initialValue={formik.values.address?.fullName || ''}
              inputError={
                formik.errors.address?.fullName && formik.touched.address
                  ? formik.errors.address.fullName
                  : ''
              }
              handleBlur={formik.handleBlur}
              textFieldProps={{
                InputLabelProps: {shrink: true},
                placeholder: 'e.g. Karl-Liebknecht-Str. 32, 10178 Berlin',
                required: true,
              }}
              getAddress={(address) => formik.setFieldValue('address', address)}
            />
          </Grid>

          <Grid item md={4}>
            <FormInput
              props={{
                label: 'Website',
                name: 'url',
                placeholder: 'e.g. www.web.com',
                type: 'text',
                value: formik.values.url,
                helperText: formik.touched.url && formik.errors.url,
                error: !!(formik.touched.url && formik.errors.url),
                ...defaultProps,
              }}
            />
          </Grid>

          <Grid item md={4}>
            <FormInput
              props={{
                label: 'Category',
                name: 'category',
                placeholder: 'e.g. Fastening technology',
                type: 'text',
                value: formik.values.category,
                helperText: formik.touched.category && formik.errors.category,
                error: !!(formik.touched.category && formik.errors.category),
                ...defaultProps,
              }}
            />
          </Grid>
        </Grid>
      </PageCard>

      <Grid alignSelf="flex-end" pt={2}>
        <Button
          variant="outlined"
          size="large"
          onClick={handleCancel}
          sx={{mr: '1rem'}}>
          {t('Cancel')}
        </Button>
        <Button
          variant="contained"
          size="large"
          disabled={!formik.isValid || formik.isSubmitting}
          onClick={() => formik.handleSubmit()}>
          {t('Create Supplier')}
        </Button>
      </Grid>
    </>
  );
};

export default NewSupplier;

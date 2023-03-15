import {FormikProps} from 'formik';
import Grid from '@mui/material/Grid';
import {FormInput} from 'components/form/FormInput';
import {AddressAutoComplete} from 'components/AddressAutoComplete';
import {UpdateArticleSupplierRecord} from 'models/article';

export const EditBasicInfoForm = ({
  formik,
}: {
  formik: FormikProps<UpdateArticleSupplierRecord>;
}) => {
  const defaultProps = {
    InputLabelProps: {shrink: true},
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
  };

  return (
    <Grid container component="form" spacing={3} pt={2}>
      <Grid item xs={6}>
        <FormInput
          props={{
            label: 'Name',
            name: 'name',
            placeholder: 'e.g. Flat cable, 16G0.75+2x(2x0.5)',
            type: 'text',
            required: true,
            value: formik.values.name,
            helperText: formik.touched.name && formik.errors.name,
            error: !!(formik.touched.name && formik.errors.name),
            ...defaultProps,
          }}
        />
      </Grid>

      <Grid item xs={6}>
        <FormInput
          props={{
            label: 'ID',
            name: 'externalId',
            placeholder: 'e.g. 000001',
            type: 'text',
            required: true,
            value: formik.values.externalId,
            helperText: formik.touched.externalId && formik.errors.externalId,
            error: !!(formik.touched.externalId && formik.errors.externalId),
            ...defaultProps,
          }}
        />
      </Grid>

      <Grid item xs={6}>
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

      <Grid item xs={6}>
        <FormInput
          props={{
            label: 'Phone',
            name: 'phone',
            placeholder: 'e.g.',
            type: 'text',
            required: true,
            value: formik.values.phone,
            helperText: formik.touched.phone && formik.errors.phone,
            error: !!(formik.touched.phone && formik.errors.phone),
            ...defaultProps,
          }}
        />
      </Grid>

      <Grid item xs={6}>
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

      <Grid item xs={6}>
        <FormInput
          props={{
            label: 'Website',
            name: 'url',
            placeholder: 'e.g. www.web.com',
            type: 'text',
            required: true,
            value: formik.values.url,
            helperText: formik.touched.url && formik.errors.url,
            error: !!(formik.touched.url && formik.errors.url),
            ...defaultProps,
          }}
        />
      </Grid>

      <Grid item xs={6}>
        <FormInput
          props={{
            label: 'Category',
            name: 'category',
            placeholder: 'e.g. Cable',
            type: 'text',
            required: true,
            value: formik.values.category,
            helperText: formik.touched.category && formik.errors.category,
            error: !!(formik.touched.category && formik.errors.category),
            ...defaultProps,
          }}
        />
      </Grid>
    </Grid>
  );
};

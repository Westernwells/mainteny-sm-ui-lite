import Grid from '@mui/material/Grid';
import {Box} from '@mui/system';
import {FormInput} from 'components/form/FormInput';
import {FormikErrors, useFormik} from 'formik';
import {useEffect} from 'react';
import InputAdornment from '@mui/material/InputAdornment';
import * as Yup from 'yup';
import {ServiceOrderArticleView} from 'models/service-order';
import {getCurrencySymbol} from 'utils/currency';
import {EditArticleFormModel} from './models';

interface Props {
  serviceOrderArticle: ServiceOrderArticleView;
  getFormikErrors?: (val: FormikErrors<EditArticleFormModel>) => void;
  getFormikValues?: (val: EditArticleFormModel) => void;
}

const validationSchema = Yup.object().shape({
  name: Yup.string().nullable().required('Name is required'),
  unitPrice: Yup.string().nullable().required('Unit price is required'),
  quantity: Yup.string().nullable().required('Quantity is required'),
});

export const EditArticleForm = ({
  serviceOrderArticle,
  getFormikErrors,
  getFormikValues,
}: Props) => {
  const formik = useFormik<EditArticleFormModel>({
    initialValues: {
      name: serviceOrderArticle.name,
      description: serviceOrderArticle.description,
      unitPrice:
        serviceOrderArticle.unitAmount.netAmount /
        10 ** serviceOrderArticle.unitAmount.fractionDigits!,
      quantity: serviceOrderArticle.quantity,
    },
    onSubmit: () => {},
    validationSchema,
  });

  useEffect(() => {
    if (getFormikErrors) {
      getFormikErrors(formik.errors);
    }

    if (getFormikValues) {
      getFormikValues(formik.values);
    }
  }, [formik]);

  return (
    <Box sx={{mt: '0.5em'}} component="form">
      <Grid container spacing={2}>
        <Grid item sm={12}>
          <FormInput
            props={{
              placeholder: 'e.g. Cable xyz',
              label: 'Name',
              name: 'name',
              value: formik.values.name,
              onBlur: formik.handleBlur,
              error: !!(formik.touched.name && formik.errors.name),
              helperText:
                formik.touched.name && formik.errors.name
                  ? formik.errors.name
                  : '',
              onChange: formik.handleChange,
              required: true,
            }}
          />
        </Grid>
        <Grid item sm={12}>
          <FormInput
            props={{
              placeholder:
                'e.g. Flat cables used for door engine from the following suppliers...',
              label: 'Description',
              name: 'description',
              value: formik.values.description,
              onBlur: formik.handleBlur,
              onChange: formik.handleChange,
              multiline: true,
              rows: 4,
            }}
          />
        </Grid>
        <Grid item sm={12}>
          <FormInput
            props={{
              placeholder: 'e.g. 200',
              label: 'Unit Price',
              name: 'unitPrice',
              value: formik.values.unitPrice,
              onBlur: formik.handleBlur,
              onChange: formik.handleChange,
              error: !!(formik.touched.unitPrice && formik.errors.unitPrice),
              helperText:
                formik.touched.unitPrice && formik.errors.unitPrice
                  ? formik.errors.unitPrice
                  : '',
              required: true,
              type: 'number',
              InputProps: {
                startAdornment: (
                  <InputAdornment position="start">
                    {getCurrencySymbol[serviceOrderArticle.unitAmount.currency]}
                  </InputAdornment>
                ),
              },
            }}
          />
        </Grid>
        <Grid item sm={12}>
          <FormInput
            props={{
              placeholder: 'e.g. 200',
              label: 'Quantity',
              name: 'quantity',
              value: formik.values.quantity,
              onBlur: formik.handleBlur,
              onChange: formik.handleChange,
              error: !!(formik.touched.quantity && formik.errors.quantity),
              helperText:
                formik.touched.quantity && formik.errors.quantity
                  ? formik.errors.quantity
                  : '',
              required: true,
              type: 'number',
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

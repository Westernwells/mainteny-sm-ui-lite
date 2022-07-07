import {Box} from '@mui/system';
import Grid from '@mui/material/Grid';
import {FormikErrors, useFormik} from 'formik';
import {CustomerFormModel} from 'models/unitForm';
import * as Yup from 'yup';
import {useEffect, useState} from 'react';
import {PageCard} from 'components/PageCard';
import {PropertyOwnerView} from 'models/propertyManager';
import {CustomerAutoComplete} from 'components/CustomerAutocomplete';
import {useTranslation} from 'react-i18next';

interface Props {
  getCustomerFormErrors?: (val: FormikErrors<CustomerFormModel>) => void;
  getCustomerFormValues?: (val: CustomerFormModel) => void;
  initialValues?: CustomerFormModel;
  initialCustomer?: PropertyOwnerView;
  getCustomer?: (val?: PropertyOwnerView) => void;
}

const validationSchema = Yup.object().shape({
  propertyOwnerId: Yup.string().nullable().required('Customer is required'),
});

export const CustomerForm = ({
  getCustomerFormErrors,
  getCustomerFormValues,
  initialValues,
  initialCustomer,
  getCustomer,
}: Props) => {
  const {t} = useTranslation();
  const [customer, setCustomer] = useState(initialCustomer);

  const formik = useFormik<CustomerFormModel>({
    initialValues: {
      propertyOwnerId: initialValues?.propertyOwnerId || '',
    },
    onSubmit: () => {},
    validationSchema,
  });

  useEffect(() => {
    if (getCustomerFormErrors) {
      getCustomerFormErrors(formik.errors);
    }

    if (getCustomerFormValues) {
      getCustomerFormValues(formik.values);
    }
  }, [formik]);

  useEffect(() => {
    if (getCustomer) {
      getCustomer(customer);
    }
  }, [customer]);

  return (
    <PageCard
      headerLabel="Customer"
      containerStyles={{flexGrow: 1}}
      headerStyles={{mt: '0.5em'}}>
      <Box sx={{mt: '0.5em'}} component="form">
        <Grid container>
          <Grid item sm={4} md={4}>
            <CustomerAutoComplete
              getCustomer={(value) => {
                formik.setValues({
                  ...formik.values,
                  propertyOwnerId: value ? value.id : '',
                });
                if (value) {
                  setCustomer(value);
                }
              }}
              initialValue={initialCustomer || null}
              textFieldProps={{
                error: !!(
                  formik.errors.propertyOwnerId &&
                  formik.touched.propertyOwnerId
                ),
                helperText:
                  formik.errors.propertyOwnerId &&
                  formik.touched.propertyOwnerId
                    ? t(formik.errors.propertyOwnerId)
                    : '',
                label: t('Customer Name'),
                name: 'propertyOwnerId',
                onBlur: formik.handleBlur,
              }}
            />
          </Grid>
        </Grid>
      </Box>
    </PageCard>
  );
};

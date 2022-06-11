/* eslint-disable */
import {Box} from '@mui/system';
import {AddressAutoComplete} from 'components/AddressAutoComplete';
import {FormInput} from 'components/form/FormInput';
import Grid from '@mui/material/Grid';
import {FormikErrors, FormikProps, FormikValues, useFormik} from 'formik';
import {CustomerFormModel, PriorityTechnicianFormModel} from 'models/unitForm';
import * as Yup from 'yup';
import {useEffect, useState} from 'react';
import {PageCard} from 'components/PageCard';
import useTheme from '@mui/material/styles/useTheme';
import {TechnicianAutoComplete} from 'components/TechnicianAutoComplete';
import {Button} from 'components/Button';
import {TechnicianView} from 'models/technician';
import {PropertyOwnerView} from 'models/propertyManager';
import {CustomerAutoComplete} from 'components/CustomerAutocomplete';

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
  const theme = useTheme();
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
        <Grid item md={4}>
          <CustomerAutoComplete
            getCustomer={(value) => {
              formik.setValues({
                ...formik.values,
                propertyOwnerId: value ? value.id : '',
              });
              if (value) {
                setCustomer(customer);
              }
            }}
            initialValue={initialCustomer || null}
            // initialValue={formik.values.technician}
            textFieldProps={{
              error: !!(
                formik.errors.propertyOwnerId && formik.touched.propertyOwnerId
              ),
              helperText:
                formik.errors.propertyOwnerId && formik.touched.propertyOwnerId
                  ? formik.errors.propertyOwnerId
                  : '',
              label: 'Customer Name',
              name: 'propertyOwnerId',
              onBlur: formik.handleBlur,
            }}
          />
        </Grid>
      </Box>
    </PageCard>
  );
};

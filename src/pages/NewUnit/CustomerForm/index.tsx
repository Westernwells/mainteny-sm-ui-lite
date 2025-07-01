import {Box} from '@mui/system';
import Grid from '@mui/material/Grid';
import {FormikErrors, useFormik} from 'formik';
import {CustomerFormModel} from 'models/unitForm';
import * as Yup from 'yup';
import {useEffect, useState} from 'react';
import {PageCard} from 'components/PageCard';
import {
  PropertyOwnerSimpleView,
  PropertyOwnerView,
} from 'models/propertyManager';
import {CustomerAutoComplete} from 'components/CustomerAutocomplete';
import {useTranslation} from 'react-i18next';

interface Props {
  getCustomerFormErrors?: (val: FormikErrors<CustomerFormModel>) => void;
  getCustomerFormValues?: (val: CustomerFormModel) => void;
  initialValues?: CustomerFormModel;
  initialCustomer?: PropertyOwnerView | PropertyOwnerSimpleView;
  getCustomer?: (val?: PropertyOwnerView | PropertyOwnerSimpleView) => void;
  shouldSetEmpty?: boolean;
}

const validationSchema = Yup.object().shape({
  propertyOwnerId: Yup.string()
    .nullable()
    .required(
      "Please select an existing customer. To add a new one, go to the 'Customers' section",
    ),
});

export const CustomerForm = ({
  getCustomerFormErrors,
  getCustomerFormValues,
  initialValues,
  initialCustomer,
  shouldSetEmpty = false,
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
                if (shouldSetEmpty || value) {
                  setCustomer(value || undefined);
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
                label: t('Search Customer Name'),
                name: 'propertyOwnerId',
                onBlur: formik.handleBlur,
              }}
              searchOnlyCustomerName
            />
          </Grid>
        </Grid>
      </Box>
    </PageCard>
  );
};

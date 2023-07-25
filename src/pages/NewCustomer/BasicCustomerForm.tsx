import {useEffect} from 'react';
import {FormikProps} from 'formik';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import {Email, Phone} from '@mui/icons-material';
import {PageCard} from 'components/PageCard';
import {MultipleSelectCheckmarks} from 'components/MultipleSelectCheckmarks';
import {FormInput} from 'components/form/FormInput';
import {DatePicker} from 'components/DatePicker';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {useCompanyNextNumber} from 'hooks/reactQuery/useCompanies';
import {ServiceCompanyType} from 'models/service-company';
import {CustomerBasicInfoFormModel} from './model';

interface Props {
  formik: FormikProps<CustomerBasicInfoFormModel>;
}

export const BasicCustomerForm = ({formik}: Props) => {
  const defaultProps = {
    InputLabelProps: {shrink: true},
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
  };

  const {user} = useUserSession();

  const {data: companyNextNumber, isLoading: isLoadingCompanyNextNumber} =
    useCompanyNextNumber(
      {
        type: ServiceCompanyType.PROPERTY_OWNER,
      },
      user?.userAccount.serviceCompany.id,
    );

  useEffect(() => {
    formik.setFieldValue('externalId', companyNextNumber?.value);
  }, [companyNextNumber]);

  return (
    <PageCard
      headerLabel="Basic Information"
      containerStyles={{flexGrow: 1}}
      headerStyles={{mt: '0.5em'}}>
      <Box sx={{mt: '0.5em'}} component="form">
        <Grid container spacing={3}>
          <Grid item md={4}>
            <FormInput
              props={{
                size: 'small',
                placeholder: 'e.g Mainteny GmbH',
                label: 'Customer Name',
                name: 'name',
                value: formik.values.name,
                helperText: formik.touched.name && formik.errors.name,
                error: !!formik.errors.name && formik.touched.name,
                required: true,
                ...defaultProps,
              }}
            />
          </Grid>
          <Grid item md={4}>
            <FormInput
              props={{
                size: 'small',
                placeholder: 'e.g johndoe@example.com',
                label: 'Email',
                name: 'email',
                value: formik.values.email,
                helperText: formik.touched.email && formik.errors.email,
                error: !!formik.errors.email && formik.touched.email,
                InputProps: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <Email />
                    </InputAdornment>
                  ),
                },
                ...defaultProps,
              }}
            />
          </Grid>
          <Grid item md={4}>
            <FormInput
              props={{
                size: 'small',
                placeholder: 'e.g johndoe@example.com',
                label: 'Billing Email Address',
                name: 'billingEmail',
                value: formik.values.billingEmail,
                helperText:
                  formik.touched.billingEmail && formik.errors.billingEmail,
                error:
                  !!formik.errors.billingEmail && formik.touched.billingEmail,
                InputProps: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <Email />
                    </InputAdornment>
                  ),
                },
                ...defaultProps,
              }}
            />
          </Grid>
          <Grid item md={4}>
            <FormInput
              props={{
                size: 'small',
                placeholder: 'e.g +34 12345678',
                label: 'Phone',
                name: 'phone',
                value: formik.values.phone,
                helperText: formik.errors.phone,
                error: !!formik.errors.phone,
                InputProps: {
                  startAdornment: (
                    <InputAdornment position="start"> + </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Phone />
                    </InputAdornment>
                  ),
                },
                ...defaultProps,
              }}
            />
          </Grid>
          <Grid item md={4}>
            <FormInput
              props={{
                size: 'small',
                placeholder: 'e.g +34 12345678',
                label: '2nd Phone',
                name: 'secondaryPhoneNumber',
                value: formik.values.secondaryPhoneNumber,
                helperText: formik.errors.secondaryPhoneNumber,
                error: !!formik.errors.secondaryPhoneNumber,
                InputProps: {
                  startAdornment: (
                    <InputAdornment position="start"> + </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Phone />
                    </InputAdornment>
                  ),
                },
                ...defaultProps,
              }}
            />
          </Grid>
          <Grid item md={4}>
            <FormInput
              props={{
                size: 'small',
                placeholder: 'e.g mainteny.com',
                label: 'Website/URL',
                name: 'url',
                value: formik.values.url,
                helperText: formik.errors.url,
                error: !!formik.errors.url,
                ...defaultProps,
              }}
            />
          </Grid>
          <Grid item md={4}>
            <FormInput
              props={{
                size: 'small',
                placeholder: 'e.g 1234',
                label: 'Customer Number',
                disabled:
                  !!companyNextNumber?.value || isLoadingCompanyNextNumber,
                name: 'externalId',
                value: formik.values.externalId,
                helperText:
                  formik.touched.externalId && formik.errors.externalId,
                error: !!formik.errors.externalId && formik.touched.externalId,
                ...defaultProps,
              }}
            />
          </Grid>
          <Grid item md={4}>
            <DatePicker
              getSelectedDate={(newValue) => {
                if (newValue)
                  formik.setFieldValue('registrationDate', newValue);
              }}
              textFieldProps={{
                label: 'Customer Since',
                placeholder: 'Select date',
                ...defaultProps,
              }}
            />
          </Grid>
          <Grid item md={4}>
            <FormInput
              props={{
                size: 'small',
                placeholder: 'e.g 000 000 000',
                label: 'Cost Center',
                name: 'costCenter',
                value: formik.values.costCenter,
                helperText: formik.errors.costCenter,
                error: !!formik.errors.costCenter,
                ...defaultProps,
              }}
            />
          </Grid>
          <Grid item md={4}>
            <Box display="flex" gap="1em">
              <MultipleSelectCheckmarks
                label="Priority"
                options={['A', 'B', 'C', 'NONE']}
                getSelectedValue={(item: string[]) =>
                  formik.setFieldValue('priority', item[0])
                }
                initialSelectedItems={
                  formik.values.priority ? [formik.values.priority] : ['NONE']
                }
                disableClearBtn
                multiple={false}
                containerStyles={{width: '100%'}}
                formControlStyles={{width: '100%'}}
              />
            </Box>
          </Grid>
          <Grid item md={4}>
            <FormInput
              props={{
                size: 'small',
                label: 'VAT/Tax number',
                name: 'taxNumber',
                value: formik.values.taxNumber,
                helperText: formik.touched.taxNumber && formik.errors.taxNumber,
                error: !!formik.errors.taxNumber && formik.touched.taxNumber,
                ...defaultProps,
              }}
            />
          </Grid>
        </Grid>
      </Box>
    </PageCard>
  );
};

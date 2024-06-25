import {FormikProps, getIn} from 'formik';
import {FormControl, Grid, InputAdornment} from '@mui/material';
import {FormInput} from 'components/form/FormInput';
import {MultipleSelectCheckmarks} from 'components/MultipleSelectCheckmarks';
import {convertToMacro, convertToText} from 'utils/utils';
import {
  CustomerContactPersonFormModel,
  PropertyContactPersonRole,
  propertyContactPersonRoleOptions,
} from './model';

interface Props {
  formik: FormikProps<CustomerContactPersonFormModel>;
}

export const EditContactForm = ({formik}: Props) => {
  const defaultProps = {
    InputLabelProps: {shrink: true},
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
  };

  const {
    firstName,
    lastName,
    contact: {email, phone},
  } = formik.values.userAccount;
  const {roles, secondaryPhone} = formik.values.propertyContactPerson;

  const {
    firstNameHelperText,
    lastNameHelperText,
    emailHelperText,
    phoneHelperText,
    secondaryPhoneHelperText,
  } = {
    firstNameHelperText:
      formik.touched.userAccount?.firstName &&
      getIn(formik.errors, 'userAccount.firstName'),
    lastNameHelperText:
      formik.touched.userAccount?.lastName &&
      getIn(formik.errors, 'userAccount.lastName'),
    emailHelperText:
      formik.touched.userAccount?.contact?.email &&
      getIn(formik.errors, 'userAccount.contact.email'),
    phoneHelperText:
      formik.touched.userAccount?.contact?.phone &&
      getIn(formik.errors, 'userAccount.contact.phone'),
    secondaryPhoneHelperText:
      formik.touched.propertyContactPerson?.secondaryPhone &&
      getIn(formik.errors, 'propertyContactPerson.secondaryPhone'),
  };

  return (
    <Grid container spacing={2} sx={{mt: '0.5rem'}}>
      <Grid item md={6}>
        <FormInput
          fieldProps={{
            size: 'small',
            placeholder: 'e.g. John',
            label: 'First Name',
            name: 'userAccount.firstName',
            value: firstName,
            helperText: firstNameHelperText,
            error: !!firstNameHelperText,
            required: true,
            sx: {
              mb: '0.5em',
            },
            ...defaultProps,
          }}
        />
      </Grid>
      <Grid item md={6}>
        <FormInput
          fieldProps={{
            size: 'small',
            placeholder: 'e.g. Meier',
            label: 'Last Name',
            name: 'userAccount.lastName',
            value: lastName,
            helperText: lastNameHelperText,
            error: !!lastNameHelperText,
            required: true,
            sx: {
              mb: '0.5em',
            },
            ...defaultProps,
          }}
        />
      </Grid>
      <Grid item md={6}>
        <FormControl fullWidth>
          <MultipleSelectCheckmarks
            label="Role"
            options={propertyContactPersonRoleOptions}
            getSelectedValue={(item: string[]) =>
              formik.setFieldValue('propertyContactPerson.roles', [
                convertToMacro(item[0]),
              ])
            }
            initialSelectedItems={[
              convertToText(
                roles?.length
                  ? roles[0]
                  : PropertyContactPersonRole.CONTACT_PERSON,
              ),
            ]}
            required
            multiple={false}
            containerStyles={{width: '100%'}}
            formControlStyles={{width: '100%'}}
            disableClearBtn
          />
        </FormControl>
      </Grid>
      <Grid item md={6}>
        <FormInput
          fieldProps={{
            id: 'email',
            name: 'userAccount.contact.email',
            label: 'Email',
            placeholder: 'e.g johndoe@example.com',
            value: email,
            helperText: emailHelperText,
            error: !!emailHelperText,
            ...defaultProps,
          }}
        />
      </Grid>
      <Grid item md={6}>
        <FormInput
          fieldProps={{
            id: 'phone',
            name: 'userAccount.contact.phone',
            label: 'Phone',
            placeholder: 'e.g. +49 173 12345678',
            value: phone,
            InputProps: {
              startAdornment: (
                <InputAdornment position="start"> + </InputAdornment>
              ),
            },
            helperText: phoneHelperText,
            error: !!phoneHelperText,
            required: false,
            ...defaultProps,
          }}
        />
      </Grid>
      <Grid item md={6}>
        <FormInput
          fieldProps={{
            id: 'secondaryPhone',
            name: 'propertyContactPerson.secondaryPhone',
            label: '2nd Phone',
            placeholder: 'e.g. +49 173 12345678',
            value: secondaryPhone,
            InputProps: {
              startAdornment: (
                <InputAdornment position="start"> + </InputAdornment>
              ),
            },
            helperText: secondaryPhoneHelperText,
            error: !!secondaryPhoneHelperText,
            required: false,
            ...defaultProps,
          }}
        />
      </Grid>
    </Grid>
  );
};

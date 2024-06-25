import {FormikProps, getIn} from 'formik';
import {FormControl, Grid, InputAdornment} from '@mui/material';
import {FormInput} from 'components/form/FormInput';
import {MultipleSelectCheckmarks} from 'components/MultipleSelectCheckmarks';
import {convertToMacro, convertToText} from 'utils/utils';
import {
  CustomerContactPersonsFormModel,
  PropertyContactPersonRole,
  propertyContactPersonRoleOptions,
} from '../../NewCustomer/model';

interface Props {
  formik: FormikProps<CustomerContactPersonsFormModel>;
  index: number;
}

export const EditContactForm = ({formik, index}: Props) => {
  const defaultProps = {
    InputLabelProps: {shrink: true},
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
  };

  const contactPerson = formik.values.contactPersons[index];

  const {
    firstName,
    lastName,
    contact: {email, phone},
  } = contactPerson.userAccount;
  const {roles, secondaryPhone} = contactPerson.propertyContactPerson;

  const touchedContactPerson = formik.touched.contactPersons?.[index];
  const {
    firstNameHelperText,
    lastNameHelperText,
    emailHelperText,
    phoneHelperText,
    secondaryPhoneHelperText,
  } = {
    firstNameHelperText:
      touchedContactPerson?.userAccount?.firstName &&
      getIn(formik.errors, `contactPersons[${index}].userAccount.firstName`),
    lastNameHelperText:
      touchedContactPerson?.userAccount?.lastName &&
      getIn(formik.errors, `contactPersons[${index}].userAccount.lastName`),
    emailHelperText:
      touchedContactPerson?.userAccount?.contact?.email &&
      getIn(
        formik.errors,
        `contactPersons[${index}].userAccount.contact.email`,
      ),
    phoneHelperText:
      touchedContactPerson?.userAccount?.contact?.phone &&
      getIn(
        formik.errors,
        `contactPersons[${index}].userAccount.contact.phone`,
      ),
    secondaryPhoneHelperText:
      touchedContactPerson?.propertyContactPerson?.secondaryPhone &&
      getIn(
        formik.errors,
        `contactPersons[${index}].propertyContactPerson.secondaryPhone`,
      ),
  };

  return (
    <Grid container spacing={2} sx={{mt: '0.5rem'}}>
      <Grid item md={6}>
        <FormInput
          fieldProps={{
            size: 'small',
            placeholder: 'e.g. John',
            label: 'First Name',
            name: `contactPersons[${index}].userAccount.firstName`,
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
            name: `contactPersons[${index}].userAccount.lastName`,
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
              formik.setFieldValue(
                `contactPersons[${index}].propertyContactPerson.roles`,
                [convertToMacro(item[0])],
              )
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
            name: `contactPersons[${index}].userAccount.contact.email`,
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
            name: `contactPersons[${index}].userAccount.contact.phone`,
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
            name: `contactPersons[${index}].propertyContactPerson.secondaryPhone`,
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

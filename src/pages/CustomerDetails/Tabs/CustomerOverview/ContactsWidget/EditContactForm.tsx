import {FormikProps} from 'formik';
import {FormControl, Grid, InputAdornment} from '@mui/material';
import Box from '@mui/material/Box';

import {FormInput} from 'components/form/FormInput';
import {ContactFormModel} from 'models/contacts';
import {MultipleSelectCheckmarks} from 'components/MultipleSelectCheckmarks';
import {convertToText} from 'utils/utils';
import {propertyContactPersonRoleOptions} from 'pages/NewCustomer/model';
import {InfoBanner} from 'components/InfoBanner';

interface Props {
  formik: FormikProps<ContactFormModel>;
  typeAction?: 'edit' | 'create' | 'invite';
}

export const EditContactForm = ({formik, typeAction}: Props) => {
  const defaultProps = {
    InputLabelProps: {shrink: true},
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
  };

  return (
    <Box sx={{mt: '0.5em'}}>
      <Grid container spacing={2}>
        {typeAction === 'invite' && (
          <Grid item xs={12} sx={{marginBottom: '0.7em'}}>
            <InfoBanner
              title="Invite the Contact Person"
              body="To invite this contact an email address is required to send the invitation with a password"
            />
          </Grid>
        )}
        <Grid item md={6}>
          <FormInput
            props={{
              size: 'small',
              placeholder: 'e.g. John',
              label: 'First Name',
              name: 'firstName',
              value: formik.values.firstName,
              helperText: formik.touched.firstName && formik.errors.firstName,
              error: !!formik.errors.firstName && formik.touched.firstName,
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
            props={{
              size: 'small',
              placeholder: 'e.g. Meier',
              label: 'Last Name',
              name: 'lastName',
              value: formik.values.lastName,
              helperText: formik.touched.lastName && formik.errors.lastName,
              error: !!formik.errors.lastName && formik.touched.lastName,
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
                formik.setFieldValue('roles', item[0])
              }
              initialSelectedItems={
                formik.values.roles ? [convertToText(formik.values.roles)] : []
              }
              required
              multiple={false}
              containerStyles={{width: '100%'}}
              formControlStyles={{width: '100%'}}
              disableClearBtn
            />
          </FormControl>
        </Grid>
        <Grid item md={6}>
          {[
            {
              id: 'email',
              label: 'Email',
              placeholder: 'e.g johndoe@example.com',
              value: formik.values.email,
              helperText: formik.touched.email && formik.errors.email,
              error: !!formik.errors.email && formik.touched.email,
              required: typeAction === 'invite',
            },
          ].map((item, index) => (
            <FormInput
              key={index}
              props={{
                ...item,
                ...defaultProps,
              }}
            />
          ))}
        </Grid>
        {[
          {
            id: 'phone',
            label: 'Phone',
            placeholder: 'e.g. +49 173 12345678',
            value: formik.values.phone,
            InputProps: {
              startAdornment: (
                <InputAdornment position="start"> + </InputAdornment>
              ),
            },
            helperText: formik.touched.phone && formik.errors.phone,
            error: !!formik.errors.phone && formik.touched.phone,
            required: false,
          },
          {
            id: 'secondaryPhone',
            label: '2nd Phone',
            placeholder: 'e.g. +49 173 12345678',
            value: formik.values.secondaryPhone,
            InputProps: {
              startAdornment: (
                <InputAdornment position="start"> + </InputAdornment>
              ),
            },
            helperText:
              formik.touched.secondaryPhone && formik.errors.secondaryPhone,
            error:
              !!formik.errors.secondaryPhone && formik.touched.secondaryPhone,
            required: false,
          },
        ].map((item, index) => (
          <Grid item md={6}>
            <FormInput
              key={index}
              props={{
                ...item,
                ...defaultProps,
              }}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

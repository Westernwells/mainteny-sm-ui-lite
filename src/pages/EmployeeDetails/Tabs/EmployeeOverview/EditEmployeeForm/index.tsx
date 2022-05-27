import React from 'react';
import {useFormikContext} from 'formik';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';
import PhoneIcon from '@mui/icons-material/Phone';
import {Role} from 'models/user';
import {FormInput} from 'components/form/FormInput';
import {Button} from 'components/Button';
import {SelectShift} from './SelectShift';
import {EmployeeAccountData} from './model';
import {SelectAddress} from './SelectAddress';
import {SelectEmployeeRole} from './SelectEmployeeRole';
import {SelectServiceOrderTypes} from './SelectServiceOrderTypes';

export const EditEmployeeForm = () => {
  const [isVisible, setIsVisible] = React.useState(false);
  const {
    values,
    touched,
    errors,
    handleChange,
    handleBlur,
    handleSubmit,
    handleReset,
  } = useFormikContext<EmployeeAccountData>();

  const defaultProps = {
    onChange: handleChange,
    onBlur: handleBlur,
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      height="100%"
      display="flex"
      flexDirection="column"
      justifyContent="space-between">
      <Box flexGrow={1}>
        {[
          {
            id: 'username',
            label: 'Login Username',
            value: values.username,
            helperText:
              "Uh oh! This can't be changed, sorry. We use this to identify you.",
            disabled: true,
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

        <Box display="flex" gap="1em">
          {[
            {
              id: 'firstName',
              label: 'First Name',
              placeholder: 'Blake',
              value: values.firstName,
              helperText: touched.firstName && errors.firstName,
              error: !!errors.firstName && touched.firstName,
            },
            {
              id: 'lastName',
              label: 'Last Name',
              placeholder: 'Norton',
              value: values.lastName,
              helperText: touched.lastName && errors.lastName,
              error: !!errors.lastName && touched.lastName,
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
        </Box>
        {[
          {
            id: 'phone',
            label: 'Phone',
            placeholder: '49 17163 995801',
            value: values.phone,
            InputProps: {
              startAdornment: (
                <InputAdornment position="start"> + </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <PhoneIcon />
                </InputAdornment>
              ),
            },
            helperText: touched.phone && errors.phone,
            error: !!errors.phone && touched.phone,
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

        {values.roles.includes(Role.SERVICE_MANAGER) && <SelectEmployeeRole />}

        {values.roles.includes(Role.TECHNICIAN) && (
          <>
            {isVisible || !values.address?.fullName ? (
              <SelectAddress setIsVisible={setIsVisible} />
            ) : (
              <>
                <Typography variant="caption" color="textSecondary">
                  Address
                </Typography>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center">
                  <Typography>{values.addressFullName}</Typography>
                  <Button
                    label="Change"
                    buttonProps={{
                      onClick: () => setIsVisible(true),
                    }}
                  />
                </Box>
              </>
            )}

            <Typography variant="h6" my=".75em">
              Order Types
            </Typography>
            <SelectServiceOrderTypes />
            <Typography variant="h6" my=".75em">
              Shift Time
            </Typography>
            <SelectShift />
          </>
        )}
      </Box>
      <Box display="flex" justifyContent="end" gap="1em">
        <Button
          label="Reset"
          buttonProps={{
            onClick: handleReset,
            sx: {color: 'text.secondary'},
          }}
        />
        <Button
          label="Save Changes"
          buttonProps={{
            variant: 'contained',
            type: 'submit',
          }}
        />
      </Box>
    </Box>
  );
};

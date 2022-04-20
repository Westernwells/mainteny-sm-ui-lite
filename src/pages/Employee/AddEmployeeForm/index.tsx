import {useState} from 'react';
import {useFormikContext} from 'formik';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import EyeIcon from '@mui/icons-material/RemoveRedEye';
import {Role} from 'models/user';
import {FormInput} from './FormInput';
import {SelectShift} from './SelectShift';
import {EmployeeAccountData} from './model';
import {SelectEmployeeRole} from './SelectEmployeeRole';
import {SelectAddress} from './SelectAddress';
import {SelectServiceOrderTypes} from './SelectServiceOrderTypes';

export const AddEmployeeForm = () => {
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);

  const {
    values,
    touched,
    errors,
    handleChange,
    handleBlur,
    handleSubmit,
    handleReset,
    isValid,
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
            id: 'username',
            label: 'Email',
            placeholder: 'blake@mainteny.com',
            value: values.username,
            type: 'email',
            InputProps: {
              endAdornment: (
                <InputAdornment position="end">
                  <EmailIcon />
                </InputAdornment>
              ),
            },
            helperText: touched.username && errors.username,
            error: !!errors.username && touched.username,
          },
          {
            id: 'phone',
            label: 'Phone',
            placeholder: '49 987654987654',
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
          {
            id: 'password',
            label: 'Password',
            placeholder: 'Enter password',
            type: isPasswordVisible ? 'text' : 'password',
            value: values.password,
            InputProps: {
              endAdornment: (
                <InputAdornment
                  position="end"
                  onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  sx={{cursor: 'pointer'}}>
                  <EyeIcon />
                </InputAdornment>
              ),
            },
            helperText: touched.password && errors.password,
            error: !!errors.password && touched.password,
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
        <SelectEmployeeRole />

        {values.roles.includes(Role.TECHNICIAN) && (
          <>
            <SelectAddress />

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
        <Button onClick={handleReset} sx={{color: 'text.secondary'}}>
          Clear
        </Button>
        <Button
          variant="contained"
          type="submit"
          disabled={
            !isValid ||
            values.roles.length === 0 ||
            (!values.address &&
              !(
                values.roles.length === 1 &&
                values.roles.includes('SERVICE_MANAGER')
              ))
          }>
          Add Employee
        </Button>
      </Box>
    </Box>
  );
};

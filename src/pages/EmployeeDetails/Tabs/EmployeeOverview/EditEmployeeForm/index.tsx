import React from 'react';
import {useFormikContext} from 'formik';
import {useTranslation} from 'react-i18next';
import Box from '@mui/material/Box';
import useTheme from '@mui/material/styles/useTheme';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';
import PhoneIcon from '@mui/icons-material/Phone';
import {Email} from '@mui/icons-material';

import {FormInput} from 'components/form/FormInput';
import {Dialog} from 'components/Dialog';
import {Role} from 'models/user';
import {SelectShift} from './SelectShift';
import {EmployeeAccountData} from './model';
import {SelectAddress} from './SelectAddress';
import {SelectEmployeeRole} from './SelectEmployeeRole';
import {SelectServiceOrderTypes} from './SelectServiceOrderTypes';

interface Props {
  openDialog: boolean;
  onClose: () => void;
}

export const EditEmployeeForm = ({openDialog, onClose}: Props) => {
  const theme = useTheme();

  const {
    values,
    touched,
    errors,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    submitForm,
  } = useFormikContext<EmployeeAccountData>();

  const defaultProps = {
    onChange: handleChange,
    onBlur: handleBlur,
  };

  const {t} = useTranslation();

  return (
    <Dialog
      title="Edit Basic Information"
      onCancel={onClose}
      onSave={submitForm}
      disableSaveBtn={!!Object.keys(errors).length}
      dialogProps={{
        maxWidth: 'md',
        open: openDialog || false,
      }}>
      <Box
        component="form"
        onSubmit={handleSubmit}
        height="100%"
        display="flex"
        flexDirection="column"
        justifyContent="space-between">
        <Box flexGrow={1}>
          <Box display="flex" gap="1em" justifyContent="space-between">
            <Box>
              <Box
                display="flex"
                gap="1em"
                sx={{marginBlock: '0.5em', marginBottom: '24px'}}>
                {[
                  {
                    id: 'firstName',
                    label: t('First Name'),
                    placeholder: 'Blake',
                    value: values.firstName,
                    helperText: touched.firstName && errors.firstName,
                    error: !!errors.firstName && touched.firstName,
                    required: true,
                  },
                  {
                    id: 'lastName',
                    label: t('Last Name'),
                    placeholder: 'Norton',
                    value: values.lastName,
                    helperText: touched.lastName && errors.lastName,
                    error: !!errors.lastName && touched.lastName,
                    required: true,
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
              <Box display="flex" flexDirection="column" gap="1em">
                {[
                  {
                    id: 'phone',
                    label: t('Phone'),
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
                    required: true,
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
                <SelectAddress />
                {[
                  {
                    id: 'team',
                    label: t('Team'),
                    placeholder: '100',
                    value: values.team,
                    helperText: touched.team && errors.team,
                    error: !!errors.team && touched.team,
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
            </Box>
            <Box
              display="flex"
              flexDirection="column"
              sx={{minWidth: '450px'}}
              gap="1em">
              <SelectEmployeeRole />
              {[
                {
                  id: 'email',
                  label: t('Email'),
                  placeholder: 'john@astralift.com',
                  InputProps: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <Email />
                      </InputAdornment>
                    ),
                  },
                  value: values.email,
                  helperText: touched.email && errors.email,
                  error: !!errors.email && touched.email,
                  required: true,
                },
                {
                  id: 'employeeId',
                  label: t('Employee ID'),
                  placeholder: '12345678',
                  value: values.employeeId,
                  helperText: touched.employeeId && errors.employeeId,
                  error: !!errors.employeeId && touched.employeeId,
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
          </Box>
          {values.roles.includes(Role.TECHNICIAN) && (
            <>
              <Typography
                variant="h6"
                my=".75em"
                sx={{color: theme.palette.text.primary}}>
                {t('Order Types')}
              </Typography>
              <SelectServiceOrderTypes
                values={values}
                setFieldValue={setFieldValue}
              />
            </>
          )}
          <Typography
            variant="h6"
            my=".75em"
            sx={{color: theme.palette.text.primary}}>
            {t('Shift Time')}
            <Typography component="span" sx={{color: 'red'}}>
              *
            </Typography>
          </Typography>
          <SelectShift values={values} setFieldValue={setFieldValue} />
        </Box>
      </Box>
    </Dialog>
  );
};

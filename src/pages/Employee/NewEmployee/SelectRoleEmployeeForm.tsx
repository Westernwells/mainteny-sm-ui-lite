import {useEffect, useState} from 'react';
import {Box} from '@mui/system';
import Grid from '@mui/material/Grid';
import {FormControl, SelectChangeEvent} from '@mui/material';
import {useFormik} from 'formik';

import {PageCard} from 'components/PageCard';
import {RoleEmployeeFormModel} from 'models/employee';
import {getRole} from 'pages/EmployeeDetails/Tabs/EmployeeOverview/EditEmployeeForm/SelectEmployeeRole';
import {FormSelect} from 'components/form/FormSelect';

interface Props {
  getRoleEmployeeFormValues?: (val: RoleEmployeeFormModel) => void;
  initialValues?: RoleEmployeeFormModel;
}

export const SelectRoleEmployeeForm = ({
  getRoleEmployeeFormValues,
  initialValues,
}: Props) => {
  const formik = useFormik<RoleEmployeeFormModel>({
    initialValues: {
      roles: initialValues?.roles || [],
    },
    onSubmit: () => {},
  });

  const [role, setRole] = useState<string>(getRole(formik.values.roles) || '');

  useEffect(() => {
    if (getRoleEmployeeFormValues) {
      getRoleEmployeeFormValues(formik.values);
    }
  }, [formik]);

  const handleRoleChange = (event: SelectChangeEvent<string | string[]>) => {
    const {
      target: {value},
    } = event;
    let selectedRole: string[] = [value as string];
    if (value === 'BOTH') {
      selectedRole = ['TECHNICIAN', 'SERVICE_MANAGER'];
    }
    setRole(value as string);
    formik.setFieldValue('roles', selectedRole);
  };

  return (
    <PageCard
      headerLabel="Role"
      containerStyles={{flexGrow: 1}}
      headerStyles={{mt: '0.5em'}}>
      <Box component="form">
        <Grid container spacing={2}>
          <Grid item md={4}>
            <Box display="flex" gap="1em">
              <FormControl fullWidth>
                <FormSelect
                  labelId="roleFilter-label"
                  label="Role"
                  options={[
                    {
                      label: 'Technician',
                      value: 'TECHNICIAN',
                    },
                    {
                      label: 'Service Manager',
                      value: 'SERVICE_MANAGER',
                    },
                    {
                      label: 'Both Technician & Service Manager',
                      value: 'BOTH',
                    },
                  ]}
                  labelStyles={{backgroundColor: 'transparent'}}
                  selectStyles={{
                    backgroundColor: 'white',
                  }}
                  selectProps={{
                    labelId: 'roleFilter-label',
                    value: role,
                    onChange: handleRoleChange,
                    name: 'roleFilter',
                    multiple: false,
                  }}
                />
              </FormControl>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </PageCard>
  );
};

import {useEffect} from 'react';
import {Box} from '@mui/system';
import Grid from '@mui/material/Grid';
import {FormControl} from '@mui/material';
import {useFormik} from 'formik';

import {PageCard} from 'components/PageCard';
import {RoleEmployeeFormModel} from 'models/employee';
import {MultipleSelectCheckmarks} from 'components/MultipleSelectCheckmarks';

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

  useEffect(() => {
    if (getRoleEmployeeFormValues) {
      getRoleEmployeeFormValues(formik.values);
    }
  }, [formik]);

  const handleRoleChange = (value: string[]) => {
    formik.setFieldValue('roles', value);
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
                <MultipleSelectCheckmarks
                  label="Role"
                  options={[
                    'Technician',
                    'Service Manager',
                    'Contractor',
                    'Both Technician & Service Manager',
                  ]}
                  containerStyles={{
                    minWidth: '21.875em',
                    marginRight: '0.438em',
                    alignItems: 'center',
                  }}
                  formControlStyles={{
                    width: '100%',
                  }}
                  initialSelectedItems={formik.values.roles}
                  getSelectedValue={(item) => handleRoleChange(item)}
                  multiple={false}
                />
              </FormControl>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </PageCard>
  );
};

import {useState} from 'react';
import {useFormikContext} from 'formik';
import {useTranslation} from 'react-i18next';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';

import {EmployeeAccountData} from './model';

export type EmployeeRolesType = {
  id: string;
  value: string;
  label: string;
};

export const employeeRoles: EmployeeRolesType[] = [
  {
    id: '1',
    value: 'TECHNICIAN',
    label: 'Technician',
  },
  {
    id: '2',
    value: 'SERVICE_MANAGER',
    label: 'Service Manager',
  },
  {
    id: '3',
    value: 'BOTH',
    label: 'Both Technician & Service Manager',
  },
];

export const getRole = (initialRole: string | string[]) => {
  if (initialRole.length > 1) {
    return 'BOTH';
  }
  return initialRole[0] || '';
};

export const SelectEmployeeRole = () => {
  const {values, setFieldValue} = useFormikContext<EmployeeAccountData>();

  const [role, setRole] = useState<string>(
    (values.roles && getRole(values.roles)) || '',
  );

  const handleRoleChange = (event: SelectChangeEvent) => {
    const {
      target: {value},
    } = event;
    let selectedRole: string[] = [value];
    if (value === 'BOTH') {
      selectedRole = ['TECHNICIAN', 'SERVICE_MANAGER'];
    }
    setRole(value);
    setFieldValue('roles', selectedRole);
  };

  const {t} = useTranslation();

  return (
    <FormControl fullWidth sx={{marginBlock: '0.5em'}}>
      <InputLabel
        id="roleSelect-label"
        sx={{
          bgcolor: 'white',
          color: 'text.primary',
          paddingInline: '.5em',
        }}>
        {t('Role')}
      </InputLabel>
      <Select
        labelId="roleSelect-label"
        id="roleSelect"
        value={role}
        label="Role"
        size="small"
        onChange={(event: SelectChangeEvent) => {
          handleRoleChange(event);
        }}>
        {employeeRoles.map((item: EmployeeRolesType) => (
          <MenuItem value={item.value} key={item.id}>
            {t(item.label)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

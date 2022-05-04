import {useEffect, useState} from 'react';
import {useFormikContext} from 'formik';
import {SelectChangeEvent} from '@mui/material';
import {Role} from 'models/user';
import {convertToMacro, convertToText} from 'utils/utils';
import {FormSelect} from 'components/form/FormSelect';
import {EmployeeAccountData} from './model';

export const SelectEmployeeRole = () => {
  const [roles, setRoles] = useState<string[]>([]);

  const {setFieldValue} = useFormikContext<EmployeeAccountData>();

  const handleRoleChange = (event: SelectChangeEvent<string[]>) => {
    const {
      target: {value},
    } = event;
    setRoles(typeof value === 'string' ? value.split(',') : value);
  };

  useEffect(() => {
    setFieldValue(
      'roles',
      roles.map((item) => convertToMacro(item)),
    );
  }, [roles]);

  return (
    <FormSelect
      labelId="rolesSelect-label"
      id="rolesSelect"
      label="Roles"
      value={roles}
      options={Object.keys(Role)
        .filter((role) => role !== 'ADMIN')
        .map((role) => convertToText(role))}
      onChange={handleRoleChange}
    />
  );
};

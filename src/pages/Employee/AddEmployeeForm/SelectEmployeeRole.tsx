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
      label="Roles"
      options={Object.keys(Role)
        .filter((role) => role !== 'ADMIN')
        .map((role) => ({
          label: convertToText(role),
          value: convertToText(role),
        }))}
      selectProps={{
        id: 'rolesSelect',
        value: roles,
        onChange: handleRoleChange,
        multiple: true,
        name: 'role',
      }}
    />
  );
};

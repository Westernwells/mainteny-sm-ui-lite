import {ChangeEvent} from 'react';
import {FormRadio} from 'components/form/FormRadio';
import Box from '@mui/material/Box';
import {ContractTypes} from 'models/contract';

interface Props {
  label?: string;
  name?: string;
  value: ContractTypes;
  checked?: boolean;
  handleChange: (value: ChangeEvent<any>) => void;
}

export const ContractTypeRadio = ({
  label,
  name,
  value,
  checked,
  handleChange,
}: Props) => (
  <Box>
    <FormRadio
      label={label}
      name={name}
      value={value}
      checked={checked}
      handleChange={handleChange}
    />
  </Box>
);

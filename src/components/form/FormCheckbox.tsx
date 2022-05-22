import React, {ChangeEvent} from 'react';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

interface Props {
  value?: string;
  handleChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  label?: string | JSX.Element;
  checked?: boolean;
  name?: string;
}

export const FormCheckbox = ({
  value,
  handleChange,
  label = '',
  checked,
  name,
}: Props) => (
  <FormControlLabel
    control={
      <Checkbox
        checked={checked}
        value={value}
        onChange={handleChange}
        name={name}
      />
    }
    label={label}
  />
);

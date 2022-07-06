import React, {ChangeEvent} from 'react';
import FormControlLabel, {
  FormControlLabelProps,
} from '@mui/material/FormControlLabel';
import Checkbox, {CheckboxProps} from '@mui/material/Checkbox';
import {TypographyProps} from '@mui/material';

interface Props extends Omit<FormControlLabelProps, 'control' | 'label'> {
  value?: string;
  handleChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  label?: string | JSX.Element;
  checked?: boolean;
  name?: string;
  typographyProps?: TypographyProps<'span', {}> | undefined;
  checkboxProps?: CheckboxProps | undefined;
}

export const FormCheckbox = ({
  value,
  handleChange,
  label = '',
  checked,
  name,
  typographyProps = {},
  checkboxProps = {},
  ...props
}: Props) => (
  <FormControlLabel
    {...props}
    control={
      <Checkbox
        {...checkboxProps}
        checked={checked}
        value={value}
        onChange={handleChange}
        name={name}
      />
    }
    label={label}
    componentsProps={{
      typography: {
        ...typographyProps,
      },
    }}
  />
);

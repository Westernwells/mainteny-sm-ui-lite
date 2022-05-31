import React, {ChangeEvent} from 'react';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio, {RadioProps} from '@mui/material/Radio';

interface Props {
  value?: string;
  handleChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  label?: string | JSX.Element;
  checked?: boolean;
  disabled?: boolean;
  name?: string;
  radioProps?: RadioProps;
}

export const FormRadio = ({
  value,
  handleChange,
  label = '',
  checked,
  disabled,
  name,
  radioProps,
}: Props) => (
  <FormControlLabel
    value={value}
    control={
      <Radio
        value={value}
        checked={checked}
        disabled={disabled}
        name={name}
        onChange={handleChange}
        {...radioProps}
      />
    }
    label={label}
  />
);

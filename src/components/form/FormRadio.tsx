import {ChangeEvent} from 'react';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio, {RadioProps} from '@mui/material/Radio';
import {Typography, TypographyProps} from '@mui/material';

interface Props {
  value?: string;
  handleChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  label?: string | JSX.Element;
  checked?: boolean;
  disabled?: boolean;
  name?: string;
  radioProps?: RadioProps;
  labelProps?: TypographyProps;
  formControlLabelStyles?: {[key: string]: any};
}

export const FormRadio = ({
  value,
  handleChange,
  label = '',
  checked,
  disabled,
  name,
  radioProps,
  labelProps,
  formControlLabelStyles,
}: Props) => (
  <FormControlLabel
    value={value}
    sx={formControlLabelStyles}
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
    label={<Typography {...labelProps}>{label}</Typography>}
  />
);

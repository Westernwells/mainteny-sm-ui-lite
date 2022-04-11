import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import TextField from '@mui/material/TextField';

interface Props {
  id: string;
  label: string;
  placeholder: string;
  value?: string | number;
  inputProps?: any;
  params?: any;
}

export const FormInput = ({
  id,
  label,
  placeholder,
  value,
  inputProps,
  params,
}: Props) => (
  <FormControl sx={{marginBlock: '.75em'}} fullWidth>
    <InputLabel
      id={`${id}-label`}
      shrink
      sx={{
        bgcolor: 'white',
        color: 'text.primary',
        paddingInline: '.5em',
      }}>
      {label}
    </InputLabel>
    <TextField
      size="small"
      placeholder={placeholder}
      id={id}
      value={value}
      InputProps={inputProps}
      {...params}
    />
  </FormControl>
);

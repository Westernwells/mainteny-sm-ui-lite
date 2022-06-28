import FormControl from '@mui/material/FormControl';
import TextField, {TextFieldProps} from '@mui/material/TextField';

interface Props {
  containerStyles?: {[key: string]: any};
  props?: TextFieldProps;
}

export const FormInput = ({props, containerStyles}: Props) => (
  <FormControl sx={{...containerStyles}} fullWidth>
    <TextField
      InputLabelProps={{
        shrink: true,
      }}
      sx={{
        '& input[type=number]::-webkit-outer-spin-button': {
          '-webkit-appearance': 'none',
          margin: 0,
        },
        '& input[type=number]::-webkit-inner-spin-button': {
          '-webkit-appearance': 'none',
          margin: 0,
        },
      }}
      size="small"
      {...props}
    />
  </FormControl>
);

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
      size="small"
      {...props}
    />
  </FormControl>
);

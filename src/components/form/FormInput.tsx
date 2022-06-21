import FormControl from '@mui/material/FormControl';
import TextField, {TextFieldProps} from '@mui/material/TextField';

interface Props {
  props?: TextFieldProps;
}

export const FormInput = ({props}: Props) => (
  <FormControl fullWidth>
    <TextField size="small" {...props} />
  </FormControl>
);

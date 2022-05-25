import FormControl from '@mui/material/FormControl';
import TextField, {TextFieldProps} from '@mui/material/TextField';

interface Props {
  props?: TextFieldProps;
}

export const FormInput = ({props}: Props) => (
  <FormControl sx={{marginBlock: '.5em'}} fullWidth>
    <TextField
      size="small"
      InputLabelProps={{shrink: true}}
      {...props}
      id="22"
    />
  </FormControl>
);

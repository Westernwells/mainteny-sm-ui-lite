import FormControl from '@mui/material/FormControl';
import {InputLabelProps} from '@mui/material/InputLabel';
import TextField, {TextFieldProps} from '@mui/material/TextField';
import {useTranslation} from 'react-i18next';

interface Props {
  containerStyles?: {[key: string]: any};
  props?: TextFieldProps;
  inputLabelProps?: InputLabelProps;
}

export const FormInput = ({props, containerStyles, inputLabelProps}: Props) => {
  const {t} = useTranslation();
  return (
    <FormControl sx={{...containerStyles}} fullWidth>
      <TextField
        InputLabelProps={{
          shrink: true,
          ...inputLabelProps,
        }}
        size="small"
        {...props}
        label={t(props!.label as string)}
        helperText={t(props!.helperText as string)}
        placeholder={t(props!.placeholder as string)}
      />
    </FormControl>
  );
};

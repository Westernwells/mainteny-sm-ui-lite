import FormControl from '@mui/material/FormControl';
import TextField, {TextFieldProps} from '@mui/material/TextField';
import {useTranslation} from 'react-i18next';

interface Props {
  containerStyles?: {[key: string]: any};
  props?: TextFieldProps;
}

export const FormInput = ({props, containerStyles}: Props) => {
  const {t} = useTranslation();
  return (
    <FormControl sx={{...containerStyles}} fullWidth>
      <TextField
        InputLabelProps={{
          shrink: true,
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

import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import {InputLabelProps} from '@mui/material/InputLabel';
import TextField, {TextFieldProps} from '@mui/material/TextField';
import {forwardRef, useState} from 'react';
import {useTranslation} from 'react-i18next';

interface Props {
  containerStyles?: {[key: string]: any};
  props?: TextFieldProps;
  inputLabelProps?: InputLabelProps;
  handleFocus?: (e: any) => void;
  fullWidth?: boolean;
}

const PasswordInput = forwardRef(
  (
    {
      props,
      containerStyles,
      inputLabelProps,
      handleFocus,
      fullWidth = true,
    }: Props,
    ref,
  ) => {
    const {t} = useTranslation();
    const [showPassword, setShowPassword] = useState(false);

    return (
      <FormControl sx={{...containerStyles}} fullWidth={fullWidth}>
        <TextField
          InputLabelProps={{
            shrink: true,

            ...inputLabelProps,
          }}
          size="small"
          {...props}
          type={showPassword ? 'text' : 'password'}
          InputProps={{
            endAdornment: (
              <InputAdornment
                position="end"
                onClick={() => setShowPassword(!showPassword)}
                sx={{cursor: 'pointer'}}>
                {showPassword ? (
                  <VisibilityIcon fill="#8F9BB3" />
                ) : (
                  <VisibilityOffIcon fill="#8F9BB3" />
                )}
              </InputAdornment>
            ),
          }}
          inputRef={ref}
          label={t(props!.label as string)}
          helperText={t(props!.helperText as string)}
          placeholder={t(props!.placeholder as string)}
          onFocus={handleFocus}
        />
      </FormControl>
    );
  },
);

export default PasswordInput;

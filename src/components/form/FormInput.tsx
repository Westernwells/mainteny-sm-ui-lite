import FormControl from '@mui/material/FormControl';
import {InputLabelProps} from '@mui/material/InputLabel';
import TextField, {TextFieldProps} from '@mui/material/TextField';
import {LanguageContext} from 'context/LanguageProvider';
import {useContext} from 'react';
import {useTranslation} from 'react-i18next';
import {NumericFormat} from 'react-number-format';

interface Props {
  containerStyles?: {[key: string]: any};
  props?: TextFieldProps;
  inputLabelProps?: InputLabelProps;
  handleFocus?: (e: any) => void;
  onValueChange?: (values: {name?: string; value?: number}) => void;
  inputType?: 'text' | 'currency';
}

export const FormInput = ({
  props,
  containerStyles,
  inputLabelProps,
  onValueChange,
  handleFocus,
  inputType = 'text',
}: Props) => {
  const {t} = useTranslation();
  const {language: selectedLng} = useContext(LanguageContext);

  return (
    <FormControl sx={{...containerStyles}} fullWidth>
      {inputType === 'currency' ? (
        <NumericFormat
          value={Number(props!.value)}
          onValueChange={(values) => {
            if (onValueChange) {
              onValueChange({
                value: values.floatValue,
                name: props!.name,
              });
            }
          }}
          onBlur={props!.onBlur}
          label={t(props!.label as string)}
          helperText={props!.helperText}
          placeholder={props!.placeholder}
          error={props!.error}
          decimalScale={2}
          fixedDecimalScale
          inputProps={props!.inputProps} // eslint-disable-next-line react/jsx-no-duplicate-props
          InputProps={props!.InputProps}
          customInput={TextField}
          decimalSeparator={
            selectedLng === 'DE' || selectedLng === 'SR' ? ',' : '.'
          }
          thousandSeparator={
            selectedLng === 'DE' || selectedLng === 'SR' ? '.' : ','
          }
          size="small"
          sx={props!.sx}
        />
      ) : (
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
          onFocus={handleFocus}
        />
      )}
    </FormControl>
  );
};

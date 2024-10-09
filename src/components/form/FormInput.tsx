import {InfoOutlined} from '@mui/icons-material';
import {IconButton, Tooltip} from '@mui/material';
import FormControl from '@mui/material/FormControl';
import {InputLabelProps} from '@mui/material/InputLabel';
import TextField, {TextFieldProps} from '@mui/material/TextField';
import {Box} from '@mui/system';

import {LanguageContext} from 'context/LanguageProvider';
import {forwardRef, useContext, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {NumericFormat, NumericFormatProps} from 'react-number-format';

interface Props {
  containerStyles?: {[key: string]: any};
  fieldProps?: TextFieldProps;
  inputLabelProps?: InputLabelProps;
  handleFocus?: (e: any) => void;
  onValueChange?: (values: {name?: string; value?: number}) => void;
  inputType?: 'text' | 'currency';
  fullWidth?: boolean;
  numericFormatProps?: NumericFormatProps<TextFieldProps>;
  labelTooltip?: string;
}

export const FormInput = forwardRef(
  (
    {
      fieldProps,
      containerStyles,
      inputLabelProps,
      onValueChange,
      handleFocus,
      labelTooltip,
      fullWidth = true,
      inputType = 'text',
      numericFormatProps,
    }: Props,
    ref,
  ) => {
    const {t} = useTranslation();
    const {language: selectedLng} = useContext(LanguageContext);
    const [isOpen, setIsOpen] = useState(false);

    const renderLabel = () => {
      if ((labelTooltip?.trim().length ?? 0) > 0) {
        return (
          <Box display="flex">
            <span>{t(fieldProps!.label as string)}</span>
            <Tooltip
              onOpen={() => {
                setIsOpen(true);
              }}
              onClose={() => {
                setIsOpen(false);
              }}
              title={t(labelTooltip!)}
              placement="top"
              arrow>
              <IconButton
                sx={{
                  color: isOpen ? 'action.active' : 'secondary.mainLight',
                  p: 0,
                  ml: 0.3,
                  mb: 0.5,
                }}>
                <InfoOutlined sx={{width: 17, height: 17}} />
              </IconButton>
            </Tooltip>
          </Box>
        );
      }

      return t(fieldProps!.label as string);
    };

    return (
      <FormControl sx={{...containerStyles}} fullWidth={fullWidth}>
        {inputType === 'currency' ? (
          <NumericFormat
            value={Number(
              fieldProps?.inputProps?.defaultValue || fieldProps!.value,
            )}
            onValueChange={(values) => {
              if (onValueChange) {
                onValueChange({
                  value: values.floatValue,
                  name: fieldProps?.name,
                });
              }
            }}
            onBlur={fieldProps?.onBlur}
            label={
              fieldProps?.label ? t(fieldProps.label as string) : undefined
            } // MUI label field has a complex type (react component, string) TODO extract to new prop for keys ex keys: {label: string, placeholder: string, helperText: string}
            helperText={fieldProps?.helperText}
            placeholder={
              fieldProps?.placeholder ? t(fieldProps.placeholder) : undefined
            }
            error={fieldProps?.error}
            decimalScale={2}
            inputProps={fieldProps?.inputProps} // eslint-disable-next-line react/jsx-no-duplicate-props
            InputProps={fieldProps?.InputProps}
            getInputRef={ref}
            customInput={TextField}
            decimalSeparator={
              selectedLng === 'DE' || selectedLng === 'SR' ? ',' : '.'
            }
            thousandSeparator={
              selectedLng === 'DE' || selectedLng === 'SR' ? '.' : ','
            }
            size="small"
            sx={fieldProps?.sx}
            {...numericFormatProps}
          />
        ) : (
          <TextField
            InputLabelProps={{
              shrink: true,

              ...inputLabelProps,
            }}
            size="small"
            {...fieldProps}
            inputRef={ref}
            label={fieldProps?.label ? renderLabel() : undefined}
            helperText={
              fieldProps?.helperText
                ? t(fieldProps.helperText as string)
                : undefined
            } // MUI label field has a complex type (react component, string) TODO extract to new prop for keys ex keys: {label: string, placeholder: string, helperText: string}
            placeholder={
              fieldProps?.placeholder ? t(fieldProps.placeholder) : undefined
            }
            onFocus={handleFocus}
          />
        )}
      </FormControl>
    );
  },
);

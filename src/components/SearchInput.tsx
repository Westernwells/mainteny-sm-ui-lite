import {ChangeEvent, RefObject, useEffect, useMemo} from 'react';
import SearchIcon from '@mui/icons-material/Search';
import * as _ from 'lodash';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import {useTranslation} from 'react-i18next';

interface Props {
  placeholder?: string;
  onValueChanged?: (value: string) => void;
  width?: string;
  containerStyle?: {[key: string]: string | number};
  variant?: 'standard' | 'filled' | 'outlined' | undefined;
  label?: string;
  refInput?: RefObject<HTMLInputElement>;
  defaultValue?: string;
  debounceMs?: number;
}

// Deprecated component
export const SearchInput = ({
  placeholder,
  onValueChanged,
  width,
  containerStyle,
  variant,
  label,
  refInput,
  defaultValue = '',
  debounceMs = 300,
}: Props) => {
  const {t} = useTranslation();

  const debouncedValueChange = useMemo<_.DebouncedFunc<
    (value: string) => void
  > | null>(
    () =>
      debounceMs > 0
        ? _.debounce((v: string) => onValueChanged?.(v), debounceMs)
        : null,
    [onValueChanged, debounceMs],
  );

  useEffect(
    () => () => {
      debouncedValueChange?.cancel();
    },
    [debouncedValueChange],
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (debouncedValueChange) {
      debouncedValueChange(e.target.value);
    } else {
      onValueChanged?.(e.target.value);
    }
  };
  return (
    <TextField
      id="my-input"
      size="small"
      sx={
        variant === 'outlined'
          ? {
              width: width || '20rem',
              background: '#fff',
              '& .MuiInputAdornment-root': {
                marginRight: '-7px',
              },
              ...containerStyle,
            }
          : {
              width: width || '20rem',
              border: 'none',
              background: '#fff',
              '& .MuiOutlinedInput-root:hover': {
                '& > fieldset': {
                  borderColor: '#fff',
                },
              },
              '& .MuiOutlinedInput-root.Mui-focused': {
                '& > fieldset': {
                  borderColor: '#fff',
                },
              },
              '& .MuiOutlinedInput-notchedOutline': {
                border: '1px solid #fff',
              },
              ...containerStyle,
            }
      }
      placeholder={placeholder && t(placeholder)}
      variant={variant}
      label={label && t(label)}
      defaultValue={defaultValue}
      inputRef={refInput}
      onChange={handleChange}
      InputLabelProps={{shrink: variant === 'outlined'}}
      InputProps={{
        id: label,
        name: label,
        endAdornment: (
          <InputAdornment position="end">
            <SearchIcon />
          </InputAdornment>
        ),
      }}
    />
  );
};

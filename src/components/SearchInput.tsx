import {useCallback} from 'react';
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
}

export const SearchInput = ({
  placeholder,
  onValueChanged,
  width,
  containerStyle,
  variant,
  label,
}: Props) => {
  const {t} = useTranslation();
  const debouncedChangeHandler = useCallback(
    _.debounce((e) => {
      onValueChanged?.(e.nativeEvent.target.value);
    }, 300),
    [],
  );

  return (
    <TextField
      size="small"
      sx={
        variant === 'outlined'
          ? {
              width: width || '20rem',
              background: '#fff',
              '& .MuiOutlinedInput-root:hover': {
                '& > fieldset': {
                  borderColor: '#c4c4c4',
                },
              },
              '& .MuiOutlinedInput-root.Mui-focused': {
                '& > fieldset': {
                  borderColor: '#c4c4c4',
                },
              },
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
      onChange={debouncedChangeHandler}
      InputLabelProps={{shrink: true}}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <SearchIcon />
          </InputAdornment>
        ),
      }}
    />
  );
};

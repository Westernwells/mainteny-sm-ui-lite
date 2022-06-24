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
}

export const SearchInput = ({
  placeholder,
  onValueChanged,
  width,
  containerStyle,
}: Props) => {
  const debouncedChangeHandler = useCallback(
    _.debounce((e) => {
      onValueChanged?.(e.nativeEvent.target.value);
    }, 300),
    [],
  );

  const {t} = useTranslation();
  return (
    <TextField
      size="small"
      sx={{
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
      }}
      placeholder={placeholder && t(placeholder)}
      onChange={debouncedChangeHandler}
      InputProps={{
        endAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
      }}
    />
  );
};

import {RefObject, useEffect, useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import {debounce} from 'lodash';

type Props = {
  placeholder?: string;
  width?: string;
  containerStyle?: {[key: string]: string | number};
  label?: string;
  refInput?: RefObject<HTMLInputElement>;
  defaultValue?: string;
  onChanged?: (value: string) => void;
};

// New Search Input Component
const SearchInput = ({
  placeholder = 'Search',
  width,
  containerStyle,
  label,
  refInput,
  defaultValue = '',
  onChanged,
}: Props) => {
  const {t} = useTranslation();

  // input delay
  const debouncedChangeHandler = useMemo(
    () =>
      debounce((e) => {
        onChanged?.(e.target.value);
      }, 300),
    [onChanged],
  );

  useEffect(
    () => () => {
      debouncedChangeHandler.cancel();
    },
    [debouncedChangeHandler],
  );

  return (
    <TextField
      id="search-input"
      data-testid="search-input"
      sx={{
        width: width || '20rem',
        background: '#fff',
        '& .MuiInputAdornment-root': {
          marginRight: '-7px',
        },
        ...containerStyle,
      }}
      placeholder={placeholder && t(placeholder)}
      variant="outlined"
      label={label && t(label)}
      defaultValue={defaultValue}
      inputRef={refInput}
      onChange={debouncedChangeHandler}
      slotProps={{
        input: {
          id: label,
          name: label,
          startAdornment: (
            <InputAdornment sx={{paddingRight: '8px'}} position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        },
      }}
    />
  );
};

export default SearchInput;

import {
  KeyboardEventHandler,
  RefObject,
  SyntheticEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {useTranslation} from 'react-i18next';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import {debounce} from 'lodash';
import {IconButton} from '@mui/material';
import {useTheme} from '@mui/system';

type Props = {
  placeholder?: string;
  width?: string;
  containerStyle?: {[key: string]: string | number};
  label?: string;
  refInput?: RefObject<HTMLInputElement>;
  defaultValue?: string;
  maxLength?: number;
  onChange?: (value: string) => void;
  onKeyDown?: KeyboardEventHandler<HTMLDivElement>;
  onClick?: (e: SyntheticEvent) => void;
};

// New Search Input Component
const SearchInput = ({
  placeholder = 'Search',
  width,
  containerStyle,
  label,
  refInput,
  defaultValue = '',
  maxLength,
  onChange,
  onKeyDown,
  onClick,
}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const [value, setValue] = useState<string>(defaultValue);

  const handleChange = (e: {target: {value: string}}) => {
    setValue(e.target.value);
  };

  const handleClearClick = () => {
    setValue('');
  };

  const debouncedChangeHandler = useMemo(
    () =>
      debounce((newValue: string) => {
        onChange?.(newValue);
      }, 500),
    [onChange],
  );

  // input delay
  useEffect(() => {
    debouncedChangeHandler(value);
    return () => {
      debouncedChangeHandler.cancel();
    };
  }, [value]);

  return (
    <TextField
      id="search-input"
      data-testid="search-input"
      sx={{
        width: width || '20rem',

        background: '#fff',
        '& .MuiInputAdornment-root': {
          height: '40px',
        },
        '& .MuiInputBase-root': {
          height: '40px',
          padding: '8px',
        },
        ...containerStyle,
      }}
      value={value}
      placeholder={placeholder && t(placeholder)}
      variant="outlined"
      label={label && t(label)}
      inputRef={refInput}
      onChange={handleChange}
      onKeyDown={onKeyDown}
      onClick={onClick}
      slotProps={{
        htmlInput: {maxLength},
        input: {
          id: label,
          name: label,
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: value && (
            <InputAdornment position="end">
              <IconButton
                data-testid="search-input-clear"
                disabled={!value}
                sx={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '4px',
                }}
                onClick={handleClearClick}>
                <CloseIcon
                  sx={{
                    '&:hover': {
                      fill: theme.palette.primary,
                    },

                    width: '16px',
                    height: '16px',
                  }}
                />
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
};

export default SearchInput;

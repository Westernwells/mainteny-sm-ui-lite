import {TextFieldProps} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import {SyntheticEvent, useEffect, useState} from 'react';
import {FormInput} from './form/FormInput';

interface Option {
  label: string;
  value: string;
}

interface Props {
  options: Option[];
  getValue?: (val: Option | null) => void;
  getQuery?: (val: string | null) => void;
  initialValue?: Option | null;
  initialQuery?: string;
  textFieldProps?: TextFieldProps;
  containerStyles?: {[key: string]: any};
}

export const ComboBoxNew = ({
  options,
  getValue,
  initialValue = null,
  textFieldProps,
  containerStyles,
  initialQuery = '',
  getQuery,
}: Props) => {
  const [item, setItem] = useState<Option | null>(initialValue);
  const [query, setQuery] = useState<string>(initialQuery);

  useEffect(() => {
    if (getValue) {
      getValue(item);
    }
    if (item) {
      setQuery(item.label);
    }
  }, [item]);

  useEffect(() => {
    if (getQuery) {
      getQuery(query);
    }

    if (!query && getValue) {
      getValue(null);
    }
  }, [query]);

  const onInputChange = (
    event: SyntheticEvent,
    value: string,
    reason: string,
  ) => {
    if (reason === 'input') {
      setQuery(value);
      setItem({label: value, value});
    }
    if (reason === 'clear') {
      setQuery('');
      setItem(null);
    }
  };

  return (
    <Autocomplete
      disablePortal
      id="combo-box"
      size="small"
      inputValue={query}
      onChange={(event: any, newValue: Option | null) => {
        setItem(newValue);
      }}
      onInputChange={onInputChange}
      options={options}
      sx={{
        width: '100%',
        '& .MuiAutocomplete-popupIndicator': {
          display: 'none',
        },
        ...containerStyles,
      }}
      isOptionEqualToValue={(option, value) => option.value === value.value}
      renderInput={(params) => (
        <FormInput
          props={{
            ...params,
            ...textFieldProps,
            InputLabelProps: {
              shrink: true,
            },
          }}
        />
      )}
    />
  );
};

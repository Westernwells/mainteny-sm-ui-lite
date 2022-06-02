/* eslint-disable */
import {TextFieldProps} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import {useEffect, useState} from 'react';
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
}

export const ComboBox = ({
  options,
  getValue,
  initialValue = null,
  textFieldProps,
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

  const onInputChange = (e: any) => {
    if (e) {
      setQuery(e.target.value);
    }
  };

  return (
    <Autocomplete
      disablePortal
      id="combo-box"
      size="small"
      inputValue={query}
      onInputChange={onInputChange}
      options={options}
      onChange={(event: any, newValue: Option | null) => {
        setItem(newValue);
      }}
      sx={{width: '100%'}}
      renderInput={(params) => (
        <FormInput
          props={{
            ...params,
            ...textFieldProps,
          }}
        />
      )}
    />
  );
};

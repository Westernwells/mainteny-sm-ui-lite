import {PopperProps, TextFieldProps} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import {SyntheticEvent, useEffect, useState} from 'react';
import {FormInput} from './form/FormInput';
import CustomPopper from './CustomPopper';

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
  autoIdProps?: any;
}

export const ComboBox = ({
  options,
  getValue,
  initialValue = null,
  textFieldProps,
  containerStyles,
  initialQuery = '',
  getQuery,
  autoIdProps,
}: Props) => {
  const [item, setItem] = useState<Option | null>(initialValue);
  const [query, setQuery] = useState<string>(initialQuery);
  const [open, setOpen] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);

  useEffect(() => {
    if (textFieldProps?.value) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  }, [textFieldProps?.value]);

  useEffect(() => {
    if (getValue) {
      getValue(item);
    }
    if (item) {
      setQuery(item.label);
      setOpen(false);
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
      setOpen(true);
    }
  };

  const handleClick = () => {
    if (autoIdProps.handleAction) {
      autoIdProps.handleAction();

      if (query.trim() === '' || query.trim() === textFieldProps?.value) {
        return;
      }

      if (textFieldProps?.value && query.trim() !== '') {
        setItem({
          label: (textFieldProps?.value || '').toString(),
          value: (textFieldProps?.value || '').toString(),
        });
      }
    }
  };

  useEffect(() => {
    if (textFieldProps?.value) {
      setItem({
        label: (textFieldProps?.value || '').toString(),
        value: (textFieldProps?.value || '').toString(),
      });
    }
  }, [textFieldProps?.value]);

  const handleFocus = () => {
    setIsFocused(true);
    setOpen(true);
  };

  const handleBlur = () => {
    setOpen(false);
    setIsFocused(false);
  };

  const renderCustomPopper = (popperProps: PopperProps) => (
    <CustomPopper
      {...popperProps}
      isEnabled={autoIdProps.isEnabled!}
      handleAction={handleClick}
      query={query}
    />
  );

  return (
    <Autocomplete
      disablePortal
      open={open && isFocused}
      id="combo-box"
      size="small"
      freeSolo={
        textFieldProps?.value === 'externalId' ||
        textFieldProps?.value === 'employeeId'
      }
      inputValue={query}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onInputChange={onInputChange}
      options={options}
      onChange={(event: any, newValue: string | Option | null) => {
        if (typeof newValue === 'string') {
          setItem({label: newValue, value: newValue});
        } else {
          setItem(newValue);
        }
      }}
      sx={{
        width: '100%',
        '& .MuiAutocomplete-popupIndicator': {
          display: 'none',
        },
        ...containerStyles,
      }}
      // isOptionEqualToValue={(option, value) => option.value === value.value}
      PopperComponent={
        textFieldProps?.name === 'externalId' ||
        textFieldProps?.name === 'employeeId'
          ? renderCustomPopper
          : undefined
      }
      renderInput={(params) => (
        <FormInput
          props={{
            ...params,
            ...textFieldProps,
            InputLabelProps: {
              shrink: true,
              onFocus: handleFocus,
              onBlur: handleBlur,
            },
          }}
        />
      )}
    />
  );
};

import {PopperProps, TextFieldProps} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import {SyntheticEvent, useEffect, useState, forwardRef} from 'react';
import {t} from 'i18next';
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
  autoIdProps?: {
    isEnabled?: boolean;
    externalIdValue?: string;
    handleAction?: () => void;
  };
}

export const ComboBox = forwardRef<HTMLInputElement, Props>(
  (
    {
      options,
      getValue,
      initialValue = null,
      textFieldProps,
      containerStyles,
      initialQuery = '',
      getQuery,
      autoIdProps = {},
    }: Props,
    ref,
  ) => {
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
      if (autoIdProps?.handleAction) {
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
        sx={{width: 'max-content !important'}}
        isEnabled={autoIdProps.isEnabled || false}
        handleAction={handleClick}
        query={query}
      />
    );

    return (
      <Autocomplete
        noOptionsText={t('No options')}
        disablePortal
        id="combo-box"
        size="small"
        inputValue={query}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onInputChange={onInputChange}
        options={options}
        filterOptions={(x) => x}
        {...(textFieldProps?.name === 'externalId' ||
        textFieldProps?.name === 'employeeId'
          ? {
              open: open && isFocused,
              freeSolo: true,
              PopperComponent: renderCustomPopper,
            }
          : {})}
        ref={ref}
        sx={{
          width: '100%',
          '& .MuiAutocomplete-popupIndicator': {
            display: 'none',
          },
          ...containerStyles,
        }}
        isOptionEqualToValue={(option, value) =>
          typeof option !== 'string' && typeof value !== 'string'
            ? option.value === value.value
            : option === value
        }
        getOptionLabel={(option) =>
          typeof option === 'string' ? option : option.label
        }
        getOptionKey={(option) =>
          typeof option === 'string' ? option : option.value
        }
        onChange={(event: any, newValue: string | Option | null) => {
          if (typeof newValue === 'string') {
            setItem({label: newValue, value: newValue});
          } else {
            setItem(newValue);
          }
        }}
        renderInput={(params) => (
          <FormInput
            fieldProps={{
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
  },
);

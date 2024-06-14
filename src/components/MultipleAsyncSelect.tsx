import {Resource} from 'models/misc';
import {useCallback, useEffect, useState} from 'react';
import {TextFieldProps} from '@mui/material/TextField';
import Autocomplete, {AutocompleteProps} from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import {Control, Controller} from 'react-hook-form';
import * as _ from 'lodash';
import {Box, FilterOptionsState} from '@mui/material';
import {FormInput} from './form/FormInput';

type NestedKeys<T> = {
  [K in keyof T]: T[K] extends object
    ? (K & string) | `${K & string}.${NestedKeys<T[K]> & string}`
    : K & string;
}[keyof T];

export interface QueryProps {
  pageIndex: number;
  pageSize: number;
  query: string;
}

interface Props<T>
  extends Partial<
    Omit<
      AutocompleteProps<T, true, true, true, 'div'>,
      'renderInput' | 'loading' | 'options'
    >
  > {
  queryFn: (params: QueryProps) => Promise<Resource<T>>;
  keys: {
    label: NestedKeys<T>;
    value: NestedKeys<T>;
  };
  searchableKeys?: NestedKeys<T>[];
  textFieldProps?: TextFieldProps;
  name: string;
  control?: Control<any>;
  onInputValueChange?: (value: string) => void;
  initialValues?: {
    label: string;
    value: unknown;
  }[];
}

const MultipleAsyncSelect = <T,>({
  queryFn,
  keys: {label: labelKey, value: valueKey},
  textFieldProps,
  name,
  control,
  searchableKeys = [],
  onInputValueChange,
  initialValues,
  ...props
}: Props<T>) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<readonly T[]>(
    initialValues
      ? (initialValues.map((option) => ({
          [labelKey]: option.label,
          [valueKey]: option.value,
        })) as T[])
      : [],
  );

  const [query, setQuery] = useState<string>('');
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(open && options.length === 0);

  const getOptions = useCallback(
    async (searchText: string) => {
      setLoading(true);
      const response = await queryFn({
        pageIndex: 0,
        pageSize: 20,
        query: searchText,
      });
      const newOptions = response?.data || [];
      setOptions((prev) => {
        const existingOptions = new Set(
          prev.map((opt) => _.get(opt, valueKey)),
        );
        const filteredNewOptions = newOptions.filter(
          (option) => !existingOptions.has(_.get(option, valueKey)),
        );
        return [...prev, ...filteredNewOptions];
      });
      setLoading(false);
    },
    [queryFn],
  );

  useEffect(() => {
    let mounted = true;

    if (open && mounted) {
      getOptions(query);
    }
    return () => {
      mounted = false;
    };
  }, [open, query]);

  const debouncedChangeHandler = useCallback(
    _.debounce((searchText: string) => setQuery(searchText), 400),
    [],
  );

  const onInputChange = (searchText: string) => {
    setInputValue(searchText);
    debouncedChangeHandler(searchText);
    onInputValueChange?.(searchText);
  };

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={initialValues?.map((option) => option.value)}
      render={({field}) => {
        const {onChange, value: fieldValue} = field;

        const selectedItems = fieldValue
          ? (fieldValue as unknown as T[]).map((val) =>
              options.find((opt) => _.get(opt, valueKey) === val),
            )
          : [];

        return (
          <Autocomplete<T, true, true, true, 'div'>
            multiple
            disablePortal
            autoComplete
            filterSelectedOptions
            includeInputInList
            size="small"
            id="multiple-asynchronous-demo"
            sx={{width: '100%'}}
            open={open}
            onOpen={() => {
              setOpen(true);
            }}
            onClose={() => {
              setOpen(false);
            }}
            isOptionEqualToValue={(option, value) =>
              _.get(option, valueKey) === _.get(value, valueKey)
            }
            getOptionLabel={(option) => {
              const label = _.get(option, labelKey);
              return typeof label === 'string'
                ? label
                : (_.get(option, valueKey) as string);
            }}
            loading={loading}
            options={options}
            filterOptions={(
              optionsToFilter: T[],
              state: FilterOptionsState<T>,
            ) => {
              const searchText = state.inputValue.toLowerCase();
              return optionsToFilter.filter((option) =>
                searchableKeys.some((key) => {
                  const value = _.get(option, key)?.toString().toLowerCase();
                  return (
                    value?.includes(searchText) ||
                    searchText.includes(value as string)
                  );
                }),
              );
            }}
            {...props}
            value={selectedItems as T[]}
            inputValue={inputValue}
            onChange={(event, newValue, reason, details) => {
              if (control) {
                if (reason === 'clear') {
                  onChange([]);
                  onInputChange('');
                } else if (reason === 'createOption') {
                  const newOption = {
                    [valueKey]: inputValue,
                    [labelKey]: inputValue,
                  } as T;
                  newValue.pop();

                  setOptions((prevOptions) => [...prevOptions, newOption]);
                  onChange(
                    [...newValue, newOption].map((v) => _.get(v, valueKey)),
                  );
                  setInputValue('');
                } else {
                  onChange(
                    newValue
                      ? (newValue as T[]).map((v) => _.get(v, valueKey))
                      : [],
                  );
                }
                if (reason === 'selectOption') {
                  setInputValue('');
                }
              }
              props?.onChange?.(
                event,
                details?.option as unknown as T[],
                reason,
              );
            }}
            onInputChange={(event, newInputValue, reason) => {
              if (
                reason === 'input' ||
                reason === 'clear' ||
                (reason === 'reset' && newInputValue === '')
              ) {
                onInputChange(newInputValue);
              }
            }}
            renderInput={(params) => (
              <FormInput
                props={{
                  ...params,
                  ...textFieldProps,
                  InputLabelProps: {
                    shrink: true,
                  },
                  InputProps: {
                    ...params.InputProps,
                    sx: {
                      '.MuiAutocomplete-input': {
                        minWidth: '5px !important',
                      },
                    },
                    endAdornment: (
                      <>
                        {!loading ? params.InputProps.endAdornment : null}
                        <Box
                          sx={{
                            position: 'absolute',
                            right: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                          }}>
                          {loading ? (
                            <CircularProgress color="inherit" size={15} />
                          ) : null}
                          {textFieldProps?.InputProps?.endAdornment}
                        </Box>
                      </>
                    ),
                  },
                }}
              />
            )}
          />
        );
      }}
    />
  );
};

export default MultipleAsyncSelect;

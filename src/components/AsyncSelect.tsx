import {Resource} from 'models/misc';
import {useCallback, useEffect, useState} from 'react';
import {TextFieldProps} from '@mui/material/TextField';
import Autocomplete, {AutocompleteProps} from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import {Control, Controller} from 'react-hook-form';
import * as _ from 'lodash';
import {FormInput} from './form/FormInput';

export interface QueryProps {
  pageIndex: number;
  pageSize: number;
  query: string;
}

interface Props<T>
  extends Partial<
    Omit<
      AutocompleteProps<T, false, false, true, 'div'>,
      'renderInput' | 'loading' | 'options'
    >
  > {
  queryFn: (params: QueryProps) => Promise<Resource<T>>;
  keys: {
    label: string;
    value: string;
  };
  textFieldProps?: TextFieldProps;
  name: string;
  control?: Control<any>;
}

const AsyncSelect = <T,>({
  queryFn,
  keys: {label: labelKey, value: valueKey},
  textFieldProps,
  name,
  control,
  ...props
}: Props<T>) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<readonly T[]>([]);
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
      setOptions(response?.data || []);
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
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({field}) => {
        const {onChange, value: fieldValue} = field;

        return (
          <Autocomplete<T, false, false, true, 'div'>
            disablePortal
            autoComplete
            filterSelectedOptions
            includeInputInList
            size="small"
            id={`asynchronous-demo-${name}`}
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
            getOptionLabel={(option) => _.get(option, labelKey) as string}
            loading={loading}
            options={options}
            filterOptions={(x) => x}
            {...props}
            value={
              fieldValue
                ? options.find((o) => _.get(o, valueKey) === fieldValue) ?? null
                : null
            }
            inputValue={inputValue}
            onChange={(event, newValue, reason, details) => {
              if (control) {
                if (reason === 'clear') {
                  onChange(null);
                  onInputChange('');
                }
                onChange(newValue ? _.get(newValue, valueKey) : null);
                if (reason === 'selectOption') {
                  // onInputChange(_.get(newValue, labelKey) as string);
                  setInputValue(_.get(newValue, labelKey) as string);
                }
              }
              props?.onChange?.(event, details?.option as unknown as T, reason);
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
                fieldProps={{
                  ...params,
                  ...textFieldProps,
                  InputLabelProps: {
                    shrink: true,
                  },
                  InputProps: {
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loading ? (
                          <CircularProgress color="inherit" size={20} />
                        ) : null}
                        {params.InputProps.endAdornment}
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
export default AsyncSelect;

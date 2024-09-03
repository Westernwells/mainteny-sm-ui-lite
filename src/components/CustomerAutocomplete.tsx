import {SyntheticEvent, useCallback, useEffect, useState} from 'react';
import {TextFieldProps} from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import * as _ from 'lodash';
import {createEmptyResource} from 'utils/paging';
import {PropertyOwnerView} from 'models/propertyManager';
import {useQueryCustomers} from 'hooks/reactQuery/useCustomers';
import {FormInput} from './form/FormInput';

interface Props {
  getCustomer?: (val: PropertyOwnerView | null) => void;
  getQuery?: (val: string) => void;
  initialValue?: PropertyOwnerView | null;
  textFieldProps?: TextFieldProps;
  disabled?: boolean;
}

export const CustomerAutoComplete = ({
  getCustomer,
  getQuery = () => {},
  initialValue = null,
  textFieldProps,
  disabled,
}: Props) => {
  const [query, setQuery] = useState<string>(initialValue?.name || '');
  const [customer, setCustomer] = useState<PropertyOwnerView | null>(
    initialValue,
  );

  const {data: customerResource = createEmptyResource(10)} = useQueryCustomers({
    pageIndex: 0,
    pageSize: 20,
    query: query ? encodeURIComponent(query) : '',
  });

  // Whenever initialValue changes, update customer and query
  useEffect(() => {
    setCustomer(initialValue);
    setQuery(initialValue?.name || '');
  }, [initialValue]);

  const debouncedChangeHandler = useCallback(
    _.debounce((newValue: string) => {
      setQuery(newValue);
    }, 300),
    [],
  );

  const onInputChange = (
    e: SyntheticEvent,
    newValue: string,
    reason: string,
  ) => {
    debouncedChangeHandler(newValue);

    if (reason === 'clear') {
      setQuery('');
      setCustomer(null);
    }
  };

  useEffect(() => {
    getCustomer?.(customer);
  }, [customer]);

  useEffect(() => {
    if (!query) {
      setCustomer(null); // Reset customer if the query is cleared
    }
    getQuery?.(query);
  }, [query]);

  return (
    <Autocomplete
      size="small"
      disabled={disabled}
      clearOnBlur={false}
      disablePortal
      id="combo-box-demo"
      sx={{minHeight: 0}}
      options={customerResource.data}
      filterOptions={(options) => options}
      isOptionEqualToValue={(option, value) => option?.id === value?.id}
      getOptionLabel={(option) => option.name}
      value={customer}
      inputValue={query}
      onChange={(event: any, newValue: PropertyOwnerView | null) =>
        setCustomer(newValue)
      }
      onInputChange={onInputChange}
      renderInput={(params) => (
        <FormInput
          fieldProps={{
            name: 'customerId',
            ...params,
            ...textFieldProps,
            required: true,
            placeholder: 'Select Customer',
            InputLabelProps: {
              shrink: true,
            },
          }}
        />
      )}
    />
  );
};

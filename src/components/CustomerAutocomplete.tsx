import {SyntheticEvent, useCallback, useEffect, useMemo, useState} from 'react';
import {TextFieldProps} from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import * as _ from 'lodash';
import {PropertyOwnerView} from 'models/propertyManager';
import {useQueryCustomers} from 'hooks/reactQuery/useCustomers';
import {createEmptyResource} from 'utils/paging';
import {createNameSearchQuery} from 'utils/customer-utils';
import {t} from 'i18next';
import {FormInput} from './form/FormInput';

interface Props {
  getCustomer?: (val: PropertyOwnerView | null) => void;
  getQuery?: (val: string) => void;
  initialValue?: PropertyOwnerView | null;
  textFieldProps?: TextFieldProps;
  disabled?: boolean;
  searchOnlyCustomerName?: boolean;
}

export const CustomerAutoComplete = ({
  getCustomer,
  getQuery = () => {},
  initialValue = null,
  textFieldProps,
  disabled,
  searchOnlyCustomerName = false,
}: Props) => {
  const [query, setQuery] = useState<string>(initialValue?.name || '');
  const [customer, setCustomer] = useState<PropertyOwnerView | null>(
    initialValue,
  );

  const searchQuery = useMemo(() => {
    if (!query) return '';
    const queryValue = searchOnlyCustomerName
      ? createNameSearchQuery(query)
      : query;

    return encodeURIComponent(queryValue);
  }, [query, searchOnlyCustomerName]);

  const {data: customerResource = createEmptyResource(10)} = useQueryCustomers({
    pageIndex: 0,
    pageSize: 20,
    query: searchQuery,
  });

  // Whenever initialValue changes, update customer and query
  useEffect(() => {
    if (initialValue) {
      setCustomer(initialValue);
      setQuery(initialValue?.name || '');
    }
  }, [initialValue]);

  const debouncedChangeHandler = useCallback(
    _.debounce((newValue: string) => {
      setQuery(newValue);
    }, 50),
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
      getCustomer?.(null);
    }
  };

  useEffect(() => {
    if (customer) {
      getCustomer?.(customer);
    }
  }, [customer]);

  useEffect(() => {
    if (!query) {
      setCustomer(null); // Reset customer if the query is cleared
    }
    getQuery?.(query);
  }, [query]);

  return (
    <Autocomplete
      noOptionsText={t('No options')}
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

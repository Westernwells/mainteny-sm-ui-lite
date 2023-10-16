import {SyntheticEvent, useCallback, useEffect, useState} from 'react';
import {TextFieldProps} from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import * as _ from 'lodash';
import {createEmptyResource} from 'utils/paging-utils';
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
  const [query, setQuery] = useState<string>('');
  const [queryView, setQueryView] = useState(initialValue?.name || '');
  const [customer, setCustomer] = useState<PropertyOwnerView | null>(
    initialValue,
  );

  useEffect(() => {
    if (!customer) {
      setCustomer(initialValue);
    }
  }, [initialValue]);

  const {data: customerResource = createEmptyResource(10)} = useQueryCustomers({
    pageIndex: 0,
    pageSize: 6,
    query,
  });

  const debouncedChangeHandler = useCallback(
    _.debounce((newValue: string) => {
      setQuery(newValue);
    }, 1),
    [],
  );

  const onInputChange = (
    e: SyntheticEvent,
    newValue: string,
    reason: string,
  ) => {
    setQueryView(newValue);
    debouncedChangeHandler(newValue);
    if (reason === 'clear') {
      setQueryView('');
      setCustomer(null);
    }
  };

  useEffect(() => {
    if (getCustomer) {
      getCustomer(customer);
    }
  }, [customer]);

  useEffect(() => {
    if (getQuery) {
      getQuery(queryView);
    }

    if (!queryView) {
      setCustomer(null);
      if (getQuery) getQuery('');
    }
  }, [queryView]);

  return (
    <Autocomplete
      size="small"
      disabled={disabled}
      clearOnBlur={false}
      disablePortal
      id="combo-box-demo"
      sx={{minHeight: 0}}
      options={customerResource.data}
      onChange={(event: any, newValue: PropertyOwnerView | null) => {
        setCustomer(newValue);
      }}
      getOptionLabel={(option) => option.name}
      onInputChange={onInputChange}
      value={customer}
      inputValue={queryView}
      renderInput={(params) => (
        <FormInput
          props={{
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

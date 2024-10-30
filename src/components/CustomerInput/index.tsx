import {PropertyOwnerView} from 'models/propertyManager';
import {SyntheticEvent, useCallback, useEffect, useMemo, useState} from 'react';
import Autocomplete from 'components/Autocomplete';
import {Option} from 'models/filter';
import {Box, Typography} from '@mui/material';
import {useTranslation} from 'react-i18next';
import capitalize from 'lodash/capitalize';
import {createEmptyResource} from 'utils/paging';
import {useQueryCustomers} from 'hooks/reactQuery/useCustomers';
import {debounce} from 'lodash';

type Props = {
  selectedValue?: string;
  onChange: (value: string | undefined) => void;
};

const CustomerInput = ({selectedValue, onChange}: Props) => {
  const {t} = useTranslation();

  const [query, setQuery] = useState<string>('');
  const [queryView, setQueryView] = useState('');
  const [initialLoad, setInitialLoad] = useState<boolean>(true);

  const {
    data: customers = createEmptyResource<PropertyOwnerView>(50),
    isFetched,
  } = useQueryCustomers(
    {
      pageIndex: 0,
      pageSize: 50,
      query,
    },
    {keepPreviousData: true},
  );

  const debouncedChangeHandler = useCallback(
    debounce((newValue: string) => {
      setQuery(newValue);
    }, 250),
    [],
  );

  const handleInputChange = (
    e: SyntheticEvent,
    newValue: string,
    reason: string,
  ) => {
    if (reason === 'reset') return;
    setQueryView(newValue);
    debouncedChangeHandler(newValue);
    if (reason === 'clear') {
      setQueryView('');
      onChange(undefined);
    }
  };

  const customerOptions: Option[] = useMemo(
    () =>
      customers.data.map((customer) => ({
        label: customer.name,
        value: customer.id,
      })),
    [customers],
  );

  const handleChange = (_: SyntheticEvent, option: Option | null) => {
    onChange(option?.value ? option.value : undefined);
  };

  // set value on load
  useEffect(() => {
    if (!initialLoad || !isFetched) return;

    const foundContractId =
      customerOptions.find((customer) => customer.value === selectedValue)
        ?.label || '';
    setQueryView(foundContractId);
    setInitialLoad(false);
  }, [selectedValue, customerOptions, initialLoad, isFetched]);

  // handle reset
  useEffect(() => {
    if (selectedValue === undefined) {
      setQueryView('');
    }
  }, [selectedValue]);

  return (
    <Box sx={{display: 'flex', flexDirection: 'column'}} gap={1}>
      <Typography variant="subtitle2">{capitalize(t('CUSTOMER'))}</Typography>
      <Autocomplete
        size="small"
        options={customerOptions}
        onInputChange={handleInputChange}
        inputValue={queryView}
        sx={{
          '.MuiFormLabel-root': {
            marginTop: '-6px',
          },
        }}
        placeholderKey="Select customer"
        onChange={handleChange}
      />
    </Box>
  );
};

export default CustomerInput;

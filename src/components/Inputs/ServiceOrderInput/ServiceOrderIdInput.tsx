import {SyntheticEvent, useCallback, useEffect, useMemo, useState} from 'react';
import Autocomplete from 'components/Autocomplete';
import {Option} from 'models/filter';
import {Box, Typography} from '@mui/material';
import {useTranslation} from 'react-i18next';
import capitalize from 'lodash/capitalize';
import {createEmptyResource} from 'utils/paging';
import {debounce} from 'lodash';
import {
  ServiceOrderOrderField,
  ServiceOrderQueryParams,
  ServiceOrderView,
} from 'models/service-order';
import {Order} from 'models/pagination';
import {useServiceOrders} from 'hooks/reactQuery/useServiceOrder';

type Props = {
  selectedValue?: string;
  onChange: (value: string | undefined) => void;
  useExternalIdAsValue?: boolean;
};

const ServiceOrderIdInput = ({
  selectedValue,
  useExternalIdAsValue = false,
  onChange,
}: Props) => {
  const {t} = useTranslation();

  const [query, setQuery] = useState<string>('');
  const [queryView, setQueryView] = useState('');
  const [initialLoad, setInitialLoad] = useState<boolean>(true);

  const filters: ServiceOrderQueryParams = {
    pageIndex: 0,
    pageSize: 3,
    orderBy: ServiceOrderOrderField.CREATED_TIME,
    order: Order.DESC,
    query,
    includeArchived: true,
  };

  const {
    data: serviceOrders = createEmptyResource<ServiceOrderView>(3),
    isFetched,
  } = useServiceOrders(filters, {keepPreviousData: true});

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
      serviceOrders.data.map((serviceOrder) => ({
        label: serviceOrder.externalId,
        value: useExternalIdAsValue ? serviceOrder.externalId : serviceOrder.id,
      })),
    [serviceOrders],
  );

  const handleChange = (_: SyntheticEvent, option: Option | null) => {
    onChange(option?.value ? option.value : undefined);
  };

  // set value on load
  useEffect(() => {
    if (!initialLoad || !isFetched) return;

    const foundContractId = useExternalIdAsValue
      ? selectedValue ?? ''
      : customerOptions.find((customer) => customer.value === selectedValue)
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
    <Box sx={{display: 'flex', flexDirection: 'column', width: '100%'}} gap={1}>
      <Typography variant="subtitle2">{capitalize(t('JOB ID'))}</Typography>
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
        placeholderKey="Select job by ID"
        onChange={handleChange}
      />
    </Box>
  );
};

export default ServiceOrderIdInput;

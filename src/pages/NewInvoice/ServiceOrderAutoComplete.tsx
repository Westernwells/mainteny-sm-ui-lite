import {
  FocusEvent,
  SyntheticEvent,
  useCallback,
  useEffect,
  useState,
} from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import * as _ from 'lodash';
import {useServiceOrders} from 'hooks/reactQuery/useServiceOrder';
import {createEmptyResource} from 'utils/paging-utils';
import {ServiceOrderStatus, ServiceOrderView} from 'models/service-order';
import {endOfDay, startOfDay} from 'date-fns';
import {convertToText} from 'utils/utils';

interface Props {
  getServiceOrder?: (val: ServiceOrderView | null) => void;
  getQuery?: (val: string) => void;
  label?: string;
  fieldStyles?: {[key: string]: any};
  inputError?: string;
  handleBlur?: (e: FocusEvent<any, Element>) => void;
}

export const ServiceOrderAutoComplete = ({
  getServiceOrder,
  label = '',
  getQuery = () => {},
  fieldStyles,
  inputError,
  handleBlur,
}: Props) => {
  const [query, setQuery] = useState<string>('');
  const [queryView, setQueryView] = useState('');
  const [serviceOrder, setServiceOrder] = useState<ServiceOrderView | null>(
    null,
  );
  const [startDate] = useState(new Date(2010, 1));
  const [endDate] = useState(new Date());

  const {
    data: serviceOrderResource = createEmptyResource<ServiceOrderView>(6),
  } = useServiceOrders(
    {
      end: endOfDay(endDate).toISOString(),
      start: startOfDay(startDate).toISOString(),
      pageIndex: 0,
      pageSize: 6,
      query,
      // TODO: Fix this
      status: [ServiceOrderStatus.COMPLETED],
    },
    {keepPreviousData: true},
  );

  const debouncedChangeHandler = useCallback(
    _.debounce((newValue: string) => {
      setQuery(newValue);
    }, 1),
    [],
  );

  const onInputChange = (e: SyntheticEvent, newValue: string) => {
    setQueryView(newValue);
    debouncedChangeHandler(newValue);
  };

  useEffect(() => {
    if (getServiceOrder) {
      getServiceOrder(serviceOrder);
    }
  }, [serviceOrder]);

  useEffect(() => {
    if (getQuery) {
      getQuery(queryView);
    }
  }, [queryView]);

  return (
    <Autocomplete
      size="small"
      clearOnBlur={false}
      disablePortal
      id="autocomplete"
      sx={{minHeight: 100}}
      options={serviceOrderResource.data}
      onChange={(event: any, newValue: ServiceOrderView | null) => {
        setServiceOrder(newValue);
      }}
      getOptionLabel={(option) =>
        `${option.number}, ${convertToText(option.type)}, ${
          option.elevator.address.fullName
        }`
      }
      onInputChange={onInputChange}
      inputValue={queryView}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          name="serviceOrderId"
          sx={{...fieldStyles}}
          error={!!inputError}
          helperText={inputError}
          onBlur={handleBlur}
        />
      )}
    />
  );
};

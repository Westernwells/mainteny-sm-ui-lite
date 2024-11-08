import {SyntheticEvent, useCallback, useEffect, useMemo, useState} from 'react';
import Autocomplete from 'components/Autocomplete';
import {Option} from 'models/filter';
import {Box, Typography} from '@mui/material';
import {useTranslation} from 'react-i18next';
import capitalize from 'lodash/capitalize';
import {createEmptyResource} from 'utils/paging';
import {debounce} from 'lodash';
import {useAllElevators} from 'hooks/reactQuery/useElevator';
import {ElevatorView} from 'models/elevator';

type Props = {
  selectedValue?: string;
  onChange: (value: string | undefined) => void;
};

const UnitIdInput = ({selectedValue, onChange}: Props) => {
  const {t} = useTranslation();

  const [query, setQuery] = useState<string>('');
  const [queryView, setQueryView] = useState('');
  const [initialLoad, setInitialLoad] = useState<boolean>(true);

  const {data: units = createEmptyResource<ElevatorView>(50), isFetched} =
    useAllElevators(
      {
        pageIndex: 0,
        pageSize: 3,
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
      units.data.map((unit) => ({
        label: unit.externalId,
        value: unit.id,
      })),
    [units],
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
    <Box sx={{display: 'flex', flexDirection: 'column', width: '100%'}} gap={1}>
      <Typography variant="subtitle2">{capitalize(t('Unit ID'))}</Typography>
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
        placeholderKey="Select unit by ID"
        onChange={handleChange}
      />
    </Box>
  );
};

export default UnitIdInput;

import {SyntheticEvent, useCallback, useEffect, useMemo, useState} from 'react';
import Autocomplete from 'components/Autocomplete';
import {Option} from 'models/filter';
import {Box, Typography} from '@mui/material';
import {useTranslation} from 'react-i18next';
import capitalize from 'lodash/capitalize';
import {createEmptyResource} from 'utils/paging';
import {debounce} from 'lodash';
import {useProperties} from 'hooks/reactQuery/useProperties';
import {PropertyType} from 'models/valueProperty';

type Props = {
  selectedValue?: string;
  type: PropertyType;
  labelKey: string;
  placeholderKey: string;
  isLabelTranslatable?: boolean;
  onChange: (value: string | undefined) => void;
};

const PropertyInput = ({
  selectedValue,
  type,
  labelKey,
  placeholderKey,
  isLabelTranslatable = false,
  onChange,
}: Props) => {
  const {t} = useTranslation();

  const [query, setQuery] = useState<string>('');
  const [queryView, setQueryView] = useState('');
  const [initialLoad, setInitialLoad] = useState<boolean>(true);

  const {data: unitSerialNumbers = createEmptyResource<string>(3), isFetched} =
    useProperties(
      {
        type,
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

  const handleChange = (_: SyntheticEvent, option: Option | null) => {
    onChange(option?.value ? option.value : undefined);
  };

  const serialNumberOptions: Option[] = useMemo(
    () =>
      unitSerialNumbers.data.map((unit) => ({
        label: isLabelTranslatable ? t(unit) : unit,
        value: unit,
      })),
    [unitSerialNumbers],
  );

  // set value on load
  useEffect(() => {
    if (!initialLoad || !isFetched) return;

    const foundSerialNumberId =
      serialNumberOptions.find(
        (serialNumber) => serialNumber.value === selectedValue,
      )?.label || '';
    setQueryView(foundSerialNumberId);
    setInitialLoad(false);
  }, [selectedValue, unitSerialNumbers, initialLoad, isFetched]);

  // handle reset
  useEffect(() => {
    if (selectedValue === undefined) {
      setQueryView('');
    }
  }, [selectedValue]);

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', width: '100%'}} gap={1}>
      <Typography variant="subtitle2">{capitalize(t(labelKey))}</Typography>
      <Autocomplete
        size="small"
        options={serialNumberOptions}
        onInputChange={handleInputChange}
        inputValue={queryView}
        sx={{
          '.MuiFormLabel-root': {
            marginTop: '-6px',
          },
        }}
        placeholderKey={placeholderKey}
        onChange={handleChange}
      />
    </Box>
  );
};

export default PropertyInput;

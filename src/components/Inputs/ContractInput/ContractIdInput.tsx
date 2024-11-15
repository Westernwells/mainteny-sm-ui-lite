import {SyntheticEvent, useCallback, useEffect, useMemo, useState} from 'react';
import Autocomplete from 'components/Autocomplete';
import {Option} from 'models/filter';
import {Box, Typography} from '@mui/material';
import {useTranslation} from 'react-i18next';
import capitalize from 'lodash/capitalize';
import {createEmptyResource} from 'utils/paging';
import {ContractOrderField, ContractView} from 'models/contract';
import {useQueryContract} from 'hooks/reactQuery/useContract';
import {Order} from 'models/pagination';
import {debounce} from 'lodash';

type Props = {
  selectedValue?: string;
  onChange: (value: string | undefined) => void;
};

const ContractIdInput = ({selectedValue, onChange}: Props) => {
  const {t} = useTranslation();

  const [query, setQuery] = useState<string>('');
  const [queryView, setQueryView] = useState('');
  const [initialLoad, setInitialLoad] = useState<boolean>(true);

  const {
    data: contractResource = createEmptyResource<ContractView>(50),
    isFetched,
  } = useQueryContract(
    {
      pageIndex: 0,
      pageSize: 3,
      query,
      order: Order.DESC,
      orderBy: ContractOrderField.CREATED_TIME,
    },
    {keepPreviousData: true},
  );

  const contractOptions: Option[] = useMemo(
    () =>
      contractResource.data.map((contract) => ({
        label: contract.externalId,
        value: contract.id,
      })),
    [contractResource],
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

  // set value on load
  useEffect(() => {
    if (!initialLoad || !isFetched) return;

    const foundContractId =
      contractOptions.find((contract) => contract.value === selectedValue)
        ?.label || '';
    setQueryView(foundContractId);
    setInitialLoad(false);
  }, [selectedValue, contractOptions, initialLoad, isFetched]);

  // handle reset
  useEffect(() => {
    if (selectedValue === undefined) {
      setQueryView('');
    }
  }, [selectedValue]);

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', width: '100%'}} gap={1}>
      <Typography variant="subtitle2">
        {capitalize(t('CONTRACT ID'))}
      </Typography>
      <Autocomplete
        size="small"
        options={contractOptions}
        onInputChange={handleInputChange}
        inputValue={queryView}
        sx={{
          '.MuiFormLabel-root': {
            marginTop: '-6px',
          },
        }}
        placeholderKey="Select contract by ID"
        onChange={handleChange}
      />
    </Box>
  );
};

export default ContractIdInput;

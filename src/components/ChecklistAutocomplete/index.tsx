import {SyntheticEvent, useCallback, useEffect, useMemo, useState} from 'react';
import {TextFieldProps} from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import * as _ from 'lodash';
import {createEmptyResource, makePage} from 'utils/paging-utils';

import {useQueryChecklists} from 'hooks/reactQuery/useChecklists';
import {Resource} from 'models/misc';
import {CheckList} from 'models/checklist';
import {useTranslation} from 'react-i18next';
import {FormInput} from '../form/FormInput';

interface Props {
  onSelect?: (selectedChecklist: CheckList | null) => void;
  getQuery?: (val: string) => void;

  textFieldProps?: TextFieldProps;
  disabled?: boolean;
}

export const ChecklistAutocomplete = ({
  onSelect,
  getQuery = () => {},
  textFieldProps,
  disabled,
}: Props) => {
  const [query, setQuery] = useState<string>('');
  const [checklist, setChecklist] = useState<CheckList | null>();
  const {t} = useTranslation();

  const {data: checklistResponseRaw} = useQueryChecklists(
    makePage(0, 20),
    query ? encodeURIComponent(query) : '',
  );

  const checklistResponse: Resource<CheckList> = useMemo(
    () => checklistResponseRaw ?? createEmptyResource(10),
    [checklistResponseRaw],
  );

  const debouncedChangeHandler = useCallback(
    _.debounce((newValue: string) => {
      setQuery(newValue);
    }, 1),
    [],
  );

  const onInputChange = (
    _e: SyntheticEvent,
    newValue: string,
    reason: string,
  ) => {
    debouncedChangeHandler(newValue);

    if (reason === 'clear') {
      setQuery('');
      setChecklist(null);
    }
  };

  useEffect(() => {
    if (!query) {
      setChecklist(null);
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
      options={checklistResponse.data}
      filterOptions={(options) => options}
      isOptionEqualToValue={(option, value) => {
        const optionId = option && option.id;
        const valueId = value && value.id;
        return optionId === valueId;
      }}
      onChange={(_event, newValue: CheckList | null) => {
        onSelect?.(newValue);
      }}
      getOptionLabel={(option) => option.name}
      onInputChange={onInputChange}
      value={checklist}
      inputValue={query}
      renderInput={(params) => (
        <FormInput
          fieldProps={{
            name: 'checklistId',
            ...params,
            ...textFieldProps,
            required: true,
            placeholder: t('Find your checklist'),
            InputLabelProps: {
              shrink: true,
            },
          }}
        />
      )}
    />
  );
};

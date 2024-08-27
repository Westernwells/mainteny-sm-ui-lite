import {Box, InputAdornment} from '@mui/material';
import {FormInput} from 'components/form/FormInput';
import {Search} from '@mui/icons-material';
import {useQueryChecklists} from 'hooks/reactQuery/useChecklists';
import {createEmptyResource, makePage} from 'utils/paging';
import {ChangeEvent, useCallback, useEffect, useMemo, useState} from 'react';
import {CheckList, ServiceOrderCheckListView} from 'models/checklist';
import {Resource} from 'models/misc';
import _ from 'lodash';
import {useTranslation} from 'react-i18next';
import {ChecklistItemCard} from '../ChecklistItemCard';

interface Props {
  onCheckedChecklistChange: (newChecklist: CheckList) => void;
  checkedChecklists: CheckList[];
  onChecklistSelect: (selectedChecklist: CheckList) => void;
  selectedChecklist?: CheckList;
  serviceOrderCheckLists?: ServiceOrderCheckListView[];
}

export const FindChecklistSection = ({
  checkedChecklists,
  onCheckedChecklistChange,
  onChecklistSelect,
  selectedChecklist,
  serviceOrderCheckLists,
}: Props) => {
  const [query, setQuery] = useState<string>('');
  const {t} = useTranslation();

  const {data: checklistResponseRaw} = useQueryChecklists(
    makePage(0, 20),
    query ? encodeURIComponent(query) : '',
  );
  const checklistResponse: Resource<CheckList> = useMemo(() => {
    if (checklistResponseRaw) {
      const mapping =
        serviceOrderCheckLists?.reduce((acc, item) => {
          acc[item.checkListId] = true;
          return acc;
        }, {} as {[key: string]: boolean}) ?? {};

      const filteredData = checklistResponseRaw.data.filter(
        (item) => !mapping[item.id],
      );

      return {...checklistResponseRaw, data: filteredData};
    }

    return createEmptyResource(10);
  }, [checklistResponseRaw, serviceOrderCheckLists]);

  const debouncedChangeHandler = useCallback(
    _.debounce((newValue: string) => {
      setQuery(newValue);
    }, 1),
    [],
  );

  const onInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    debouncedChangeHandler(e.target.value);
  };

  const checkedListMapping = useMemo(
    () =>
      checkedChecklists.reduce((acc, item) => {
        acc[item.id] = true;

        return acc;
      }, {} as {[key: string]: boolean}),
    [checkedChecklists],
  );

  useEffect(() => {
    if (checklistResponse?.data.length && !selectedChecklist) {
      onChecklistSelect(checklistResponse?.data[0]);
    }
  }, [checklistResponse]);

  return (
    <Box
      width={300}
      display="flex"
      sx={{overflowY: 'hidden'}}
      flexDirection="column">
      <Box pb={1}>
        <FormInput
          fieldProps={{
            name: 'checklistId',
            onChange: onInputChange,
            required: true,
            placeholder: t('Find your checklist'),
            InputProps: {
              endAdornment: (
                <InputAdornment position="end">
                  <Search />
                </InputAdornment>
              ),
            },
            InputLabelProps: {
              shrink: true,
            },
          }}
        />
      </Box>
      <Box sx={{overflowY: 'auto'}} flex={1} px={0.5}>
        {checklistResponse.data.map((item, index) => (
          <ChecklistItemCard
            selected={selectedChecklist?.id === item.id}
            onChecked={onCheckedChecklistChange}
            key={item.id}
            onClick={onChecklistSelect}
            checked={checkedListMapping[item.id]}
            data={item}
            containerStyles={index === 0 ? {mb: 2, mt: 1} : {my: 2}}
          />
        ))}
      </Box>
    </Box>
  );
};

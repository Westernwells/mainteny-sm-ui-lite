import {
  ReactElement,
  SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {TextFieldProps} from '@mui/material/TextField';
import Autocomplete, {
  AutocompleteRenderInputParams,
} from '@mui/material/Autocomplete';
import * as _ from 'lodash';
import {createEmptyResource} from 'utils/paging';
import {useTheme} from '@mui/system';
import {t} from 'i18next';
import {useTags} from 'hooks/reactQuery/useTag';
import {Tag, TAG_COLORS, TagEntityType} from 'models/tag';
import {Box, Typography} from '@mui/material';
import FormInputLabel from 'components/FormInputLabel';
import {FormInput} from '../form/FormInput';

interface Props {
  value?: string[];
  textFieldProps?: TextFieldProps;
  disabled?: boolean;
  required?: boolean;
  enableReset?: boolean;
  renderInput?: (params: AutocompleteRenderInputParams) => ReactElement;
  size?: 'small' | 'medium';
  entityType: TagEntityType;
  onChange: (tagNames: string[]) => void;
  tagPrimaryKey?: 'id' | 'name';
}

export const TagSelect = ({
  value,
  entityType,
  textFieldProps,
  disabled,
  renderInput,
  onChange,
  tagPrimaryKey = 'id',
  required = true,
  size = 'small',
  enableReset = false,
}: Props) => {
  const theme = useTheme();
  const [query, setQuery] = useState<string>('');
  const [queryView, setQueryView] = useState('');

  const {data: tagsResource = createEmptyResource(10)} = useTags({
    pageIndex: 0,
    pageSize: 20,
    query,
    entityType,
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
    if (reason === 'reset') return;
    setQueryView(newValue);
    debouncedChangeHandler(newValue);
    if (reason === 'clear') {
      setQueryView('');
    }
  };

  const handleChange = (
    _event: SyntheticEvent<Element, Event>,
    newValue: Tag[],
  ) => {
    onChange(newValue.map((item) => item.name));
  };

  const options = useMemo(() => tagsResource.data ?? [], [tagsResource.data]);

  const valueItems = useMemo(() => {
    const optionsMap = options.reduce((acc, item) => {
      acc[item[tagPrimaryKey]] = item;
      return acc;
    }, {} as {[key: string]: Tag});

    return (
      value?.map((item) => optionsMap[item]).filter((item) => !!item) ?? []
    );
  }, [value, options]);

  // handle reset
  useEffect(() => {
    if (!enableReset) return;
    if (!value?.length) {
      setQueryView('');
    }
  }, [value, enableReset, setQueryView]);

  return (
    <Box sx={{display: 'flex', flexDirection: 'column'}}>
      <FormInputLabel label="Tags" />
      <Autocomplete
        noOptionsText={t('No options')}
        size={size}
        disabled={disabled}
        clearOnBlur={false}
        filterSelectedOptions
        multiple
        disablePortal
        id="tag-select"
        renderTags={(currentTag: readonly Tag[], getItemProps) => (
          <Box
            px={0.5}
            columnGap={1}
            rowGap={1}
            mt={0.5}
            sx={{flexDirection: 'row', display: 'flex', flexWrap: 'wrap'}}>
            {currentTag.map((option: Tag, index: number) => {
              const {key} = getItemProps({index});

              return (
                <Box
                  key={key}
                  sx={{
                    py: 0.1,
                    px: 1.5,
                    borderRadius: 10,
                    backgroundColor: `${option.color}`, // custom background
                    color: `${TAG_COLORS[option.color]}`, // custom text color
                  }}>
                  <Typography variant="helperText">{option.name}</Typography>
                </Box>
              );
            })}
          </Box>
        )}
        sx={{
          minHeight: 0,
          fontSize: '14px',
          lineHeight: '160%',
          letterSpacing: '0.1px',

          ...(size === 'small' && {
            '.MuiFormLabel-root': {
              fontSize: '14px',
              lineHeight: '160%',
              letterSpacing: '0.1px',
              color: theme.palette.text.secondary,
            },
          }),
        }}
        options={options}
        onChange={handleChange}
        value={valueItems}
        getOptionLabel={(option) => option.name}
        onInputChange={onInputChange}
        inputValue={queryView}
        renderInput={(params) =>
          renderInput ? (
            renderInput(params)
          ) : (
            <FormInput
              fieldProps={{
                name: 'technicianId',
                ...params,
                ...textFieldProps,
                required,
              }}
            />
          )
        }
      />
    </Box>
  );
};

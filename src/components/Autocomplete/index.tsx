import MuiAutocomplete, {
  AutocompleteInputChangeReason,
} from '@mui/material/Autocomplete';
import {Option, OptionWithTranslationKey} from 'models/filter';
import {SxProps, TextField, Theme} from '@mui/material';
import {useTranslation} from 'react-i18next';
import {SyntheticEvent, useMemo} from 'react';

type Props = {
  value?: Option;
  options: Option[] | OptionWithTranslationKey[];
  placeholderKey: string;
  size?: 'small' | 'medium';
  isOptionEqualToValue?: (option: Option, value: Option) => boolean;
  sx?: SxProps<Theme>;
  inputValue?: string;
  onInputChange?: (
    event: SyntheticEvent<Element, Event>,
    value: string,
    reason: AutocompleteInputChangeReason,
  ) => void;
  onChange: (event: SyntheticEvent, value: Option | null) => void;
};

const Autocomplete = ({
  value,
  options,
  placeholderKey,
  isOptionEqualToValue,
  size = 'medium',
  sx,
  onChange,
  ...props
}: Props) => {
  const {t} = useTranslation();

  const mappedOptions: Option[] = useMemo(() => {
    if (!options.length) return [];
    // Object is of Option type
    if (Object.keys(options[0]).includes('label')) return options as Option[];
    // Object is of OptionWithTranslationKey type
    return (options as OptionWithTranslationKey[]).map(
      (option: OptionWithTranslationKey) => ({
        value: option.value,
        label: t(option.labelKey),
      }),
    );
  }, [options]);

  const handleGetOptionLabel = (option: Option) => option.label;

  return (
    <MuiAutocomplete
      size={size}
      value={value}
      options={mappedOptions}
      onChange={onChange}
      sx={sx}
      getOptionLabel={handleGetOptionLabel}
      {...(isOptionEqualToValue && {
        isOptionEqualToValue,
      })}
      renderInput={(params) => (
        <TextField {...params} placeholder={t(placeholderKey)} />
      )}
      {...props}
    />
  );
};

export default Autocomplete;

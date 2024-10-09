import MuiAutocomplete from '@mui/material/Autocomplete';
import {Option, OptionWithTranslationKey} from 'models/filter';
import {TextField} from '@mui/material';
import {useTranslation} from 'react-i18next';
import {SyntheticEvent, useMemo} from 'react';

type Props = {
  value?: Option;
  options: Option[] | OptionWithTranslationKey[];
  placeholderKey: string;
  isOptionEqualToValue?: (option: Option, value: Option) => boolean;
  onChange: (event: SyntheticEvent, value: Option | null) => void;
};

const Autocomplete = ({
  value,
  options,
  placeholderKey,
  isOptionEqualToValue,
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
      value={value}
      options={mappedOptions}
      onChange={onChange}
      getOptionLabel={handleGetOptionLabel}
      {...(isOptionEqualToValue && {
        isOptionEqualToValue,
      })}
      renderInput={(params) => (
        <TextField {...params} label={t(placeholderKey)} />
      )}
      {...props}
    />
  );
};

export default Autocomplete;

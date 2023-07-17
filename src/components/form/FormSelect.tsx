import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import Select, {SelectProps} from '@mui/material/Select';
import useTheme from '@mui/material/styles/useTheme';
import {SxProps} from '@mui/system';
import {capitalize} from 'utils/utils';
import {useTranslation} from 'react-i18next';
import {FormHelperText} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';

interface Props<T> {
  labelId: string;
  label: string;
  required?: boolean;
  options: {
    label: string;
    value: string;
  }[];
  selectProps?: SelectProps<T>;
  labelStyles?: SxProps;
  selectStyles?: SxProps;
  containerStyles?: {[key: string]: any};
  errorText?: string | false;
  onClickPaymentTerms?: () => void;
}

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  variant: 'menu' as 'menu',
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

export const FormSelect = ({
  labelId,
  label,
  options,
  required = false,
  labelStyles,
  selectStyles,
  selectProps,
  errorText = '',
  containerStyles,
  onClickPaymentTerms,
}: Props<string | string[]>) => {
  const {t} = useTranslation();
  const theme = useTheme();
  return (
    <FormControl sx={{...containerStyles}} fullWidth required={required}>
      <InputLabel
        shrink
        id={labelId}
        error={!!errorText}
        sx={{
          background: '#fff',
          px: '0.2em',
          ...labelStyles,
        }}>
        {t(label)}
      </InputLabel>
      <Select
        size="small"
        labelId={labelId}
        label={t(label)}
        renderValue={() => {
          let selectValue;
          if (
            selectProps &&
            selectProps.value &&
            Array.isArray(selectProps.value)
          ) {
            const editedValues = selectProps?.value.map((item) => {
              const selectedOption = options.find(
                (option) => option.value === item,
              )?.label;
              return typeof selectedOption === 'string'
                ? t(selectedOption)
                : selectedOption;
            });

            selectValue = capitalize((editedValues as string[]) || []);
          } else {
            selectValue = options.find(
              ({value}) => value === selectProps?.value,
            )?.label;
          }
          return typeof selectValue === 'string' ? t(selectValue) : '';
        }}
        value={selectProps?.value}
        sx={selectStyles}
        MenuProps={MenuProps}
        {...selectProps}>
        [
        {options.map((option) => (
          <MenuItem
            key={option.label}
            value={option.value}
            sx={{color: theme.palette.primary.main}}>
            {selectProps?.multiple ? (
              <Checkbox
                size="small"
                checked={
                  selectProps && selectProps.value
                    ? selectProps.value.includes(option.value)
                    : false
                }
              />
            ) : null}
            {t(option.label)}
          </MenuItem>
        ))}
        {selectProps?.name === 'paymentTerms' && [
          options.length === 0 && (
            <MenuItem
              disabled
              style={{
                margin: '0.3em 0.5em 0.3em 0em',
                backgroundColor: 'white',
              }}
              key="none"
              value="none">
              {t('None')}
            </MenuItem>
          ),

          <MenuItem
            onClick={onClickPaymentTerms}
            style={{
              background: 'none',
              fontWeight: '600',
              color: theme.palette.primary.main,
            }}
            key="onClickPaymentTerms">
            <SettingsIcon
              style={{
                margin: '0.1em 0.3em 0.1em 0em',
              }}
            />{' '}
            {t('Manage Payment Terms')}
          </MenuItem>,
        ]}
        ]
      </Select>
      <FormHelperText sx={{color: 'error.main'}}>{errorText}</FormHelperText>
    </FormControl>
  );
};

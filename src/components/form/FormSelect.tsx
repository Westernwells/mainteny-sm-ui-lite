import FormControl from '@mui/material/FormControl';
import {FormHelperText} from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import Select, {SelectProps} from '@mui/material/Select';
import useTheme from '@mui/material/styles/useTheme';
import {SxProps} from '@mui/system';
import {capitalize, companyLanguageContextMap} from 'utils/utils';
import {UseTranslationOptions, useTranslation} from 'react-i18next';
import SettingsIcon from '@mui/icons-material/Settings';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {useMemo} from 'react';
import {useCompanyById} from 'hooks/reactQuery/useCompanies';

type CustomTranslationOptions = UseTranslationOptions<'translation'> & {
  lng?: string;
};

interface Props<T> {
  labelId: string;
  label: string;
  required?: boolean;
  isCompanyTranslation?: boolean;
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
  resetOption?: {
    label: string;
    value?: string | readonly string[] | number | undefined;
  };
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
  labelStyles,
  selectStyles,
  selectProps,
  containerStyles,
  resetOption,
  onClickPaymentTerms,
  errorText = '',
  required = false,
  isCompanyTranslation = false,
}: Props<string | string[]>) => {
  const {t} = useTranslation();
  const theme = useTheme();
  const {user} = useUserSession();
  const {data: company} = useCompanyById(user?.userAccount.serviceCompany.id);
  const {t: translateCompanyLanguage} = useTranslation('translation', {
    lng: companyLanguageContextMap[company?.language as string],
  } as CustomTranslationOptions);

  const translate = useMemo(
    () => (key: string) => {
      if (isCompanyTranslation && company?.language) {
        return translateCompanyLanguage(key);
      }

      return t(key);
    },
    [company?.language],
  );

  return (
    <FormControl sx={{...containerStyles}} fullWidth required={required}>
      <InputLabel
        id={labelId}
        error={!!errorText}
        sx={{
          px: '0.2em',
          ...labelStyles,
        }}
        shrink={selectProps?.notched}>
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
          return typeof selectValue === 'string' ? translate(selectValue) : '';
        }}
        value={selectProps?.value}
        sx={selectStyles}
        MenuProps={MenuProps}
        {...selectProps}>
        {resetOption && (
          <MenuItem value="" sx={{color: theme.palette.grey[500]}}>
            {translate(resetOption.label)}
          </MenuItem>
        )}
        {[
          options.map((option) => (
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
              {translate(option.label)}
            </MenuItem>
          )),
          selectProps?.name === 'paymentTermId' && [
            options.length === 0 && (
              <MenuItem
                disabled
                style={{
                  margin: '0.3em 0.5em 0.3em 0em',
                  backgroundColor: 'white',
                }}
                key="none"
                value="none">
                {translate('None')}
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
          ],
        ]}
      </Select>
      <FormHelperText sx={{color: 'error.main', mx: '0em'}}>
        {errorText}
      </FormHelperText>
    </FormControl>
  );
};

import Autocomplete, {autocompleteClasses} from '@mui/material/Autocomplete';
import React, {
  ReactElement,
  SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {useTranslation} from 'react-i18next';
import * as _ from 'lodash';
import {getUserFullName} from 'utils/utils';
import {
  Box,
  CircularProgress,
  FilterOptionsState,
  TextFieldProps,
} from '@mui/material';
import {FormInput} from 'components/form/FormInput';
import {Avatar} from 'components/Avatar';
import {queryUserAccounts} from 'hooks/reactQuery/useUserAccount';
import {EmployeesView, UserQueryParams} from 'models/employee';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {Role, UserAccountSimpleView} from 'models/user';
import {TaskAssignmentType} from 'models/tasks';
import {theme} from 'theme';
import {convertUserAccountSimpleViewToAvatar} from 'utils/account-utils';
import {getTechnicianByEmployeeId} from 'hooks/reactQuery/useTechnician';
import {queryServiceCompanyEmployees} from 'hooks/reactQuery/useEmployee';
import {useSnackbar} from 'hooks/useSnackbar';
import Footer from 'components/Dialog/Footer/Footer';

interface SelectOption {
  value: string;
  label: string;
  type?: TaskAssignmentType;
  iconComponent?: ReactElement;
}

interface Props {
  searchableKeys?: string[];
  onChange: (
    event: SyntheticEvent<Element, Event>,
    data?: {reason?: string; value?: string; item?: SelectOption},
  ) => void;
  textFieldProps?: TextFieldProps;
  value?: string;
  extraOptions?: SelectOption[];
  testId?: string;
}

const CustomListboxComponent = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>((props, ref) => (
  <>
    <ul {...props} ref={ref} />
    <Footer />
  </>
));

const UserSelect = ({
  textFieldProps,
  testId,
  searchableKeys = [],
  extraOptions = [],
  ...props
}: Props) => {
  const {t} = useTranslation();
  const [open, setOpen] = useState(false);

  const [options, setOptions] = useState<readonly SelectOption[]>([
    ...extraOptions,
  ]);
  const [loading, setLoading] = useState(open && options.length === 0);
  const [inputValue, setInputValue] = useState<string>('');
  const [query, setQuery] = useState<string>('');
  const user = useUserSession();
  const {showError} = useSnackbar();

  const valueKey = 'value';

  const formatOption = (item: EmployeesView) => ({
    label: getUserFullName(item.userAccount),
    value: item.id,
    type: TaskAssignmentType.SINGLE,
    iconComponent: (
      <Avatar
        labelStyles={{
          color: theme.palette.primary.light,
        }}
        containerSx={{width: 'auto', ml: 0.5}}
        removeNameText
        key={`task-creator-avatar-${item.id}`}
        userAccount={convertUserAccountSimpleViewToAvatar(
          item.userAccount as never as UserAccountSimpleView,
        )}
      />
    ),
  });

  const fetchData = async (searchText: string) => {
    try {
      setLoading(true);

      const params: UserQueryParams = {
        pageIndex: 0,
        pageSize: 20,
        serviceCompanyId: user.user?.userAccount.serviceCompany.id!,
        query: searchText,
        roles: [Role.CONTRACTOR, Role.SERVICE_MANAGER, Role.TECHNICIAN],
      };

      const response = await queryServiceCompanyEmployees(
        user.user?.userAccount.serviceCompany.id!,
        params,
      );
      const data = response.data ?? [];
      const dataOptions = data.map((item) => formatOption(item));

      setOptions([...dataOptions, ...extraOptions]);
    } catch (e) {
      showError(e);
    } finally {
      setLoading(false);
    }
  };

  const getOptions = useCallback(
    (searchText: string) => fetchData(searchText),
    [queryUserAccounts],
  );

  const debouncedChangeHandler = useCallback(
    _.debounce((searchText: string) => setQuery(searchText), 400),
    [],
  );

  const onInputChange = (searchText: string) => {
    setInputValue(searchText);
    debouncedChangeHandler(searchText);
  };

  const prefillInitialValue = async () => {
    if (props.value) {
      const selectedValue = await getTechnicianByEmployeeId(
        props.value as string,
      );

      setInputValue(getUserFullName(_.get(selectedValue, 'userAccount')));
      setOptions([formatOption(selectedValue)]);
    }
  };

  const foundValue = useMemo(
    () =>
      props.value
        ? options.find((o) => _.get(o, valueKey) === props.value) ?? null
        : null,
    [props.value, options],
  );

  useEffect(() => {
    prefillInitialValue();
  }, [props.value]);

  useEffect(() => {
    let mounted = true;

    if (open && mounted) {
      getOptions(query);
    }

    return () => {
      mounted = false;
    };
  }, [open, query]);

  useEffect(() => {
    setInputValue((currentValue) => {
      if (currentValue) return currentValue;

      return foundValue?.label ?? '';
    });
  }, [foundValue]);

  return (
    <Autocomplete<SelectOption, false, false, true, 'div'>
      noOptionsText={t('No options')}
      disablePortal
      autoComplete
      filterSelectedOptions
      includeInputInList
      data-testid={testId}
      size="small"
      sx={{width: '100%'}}
      open={open}
      renderOption={(optionProps, option, _state, ownerState) => {
        const {key, ...optionPropsRest} = optionProps;
        return (
          <Box
            key={key}
            columnGap={1}
            sx={{
              display: 'flex',
              flexDirection: 'row',
              borderRadius: '8px',
              margin: '5px',
              [`&.${autocompleteClasses.option}`]: {
                padding: '5px 5px',
              },
            }}
            component="li"
            {...optionPropsRest}>
            {option.iconComponent}
            {ownerState.getOptionLabel(option)}
          </Box>
        );
      }}
      slotProps={{
        paper: {
          sx: {
            '& .MuiAutocomplete-listbox': {
              paddingBottom: 0,
            },
          },
        },
        listbox: {
          component: CustomListboxComponent,
          sx: {
            paddingTop: 0,
          },
        },
      }}
      onOpen={() => {
        setOpen(true);
      }}
      onClose={() => {
        setOpen(false);
      }}
      isOptionEqualToValue={(option, value) =>
        _.get(option, valueKey) === _.get(value, valueKey)
      }
      getOptionLabel={(option) =>
        typeof option === 'string' ? option : option.label
      }
      getOptionKey={(option) =>
        typeof option === 'string' ? option : option.value
      }
      loading={loading}
      options={options}
      filterOptions={(
        optionsToFilter: SelectOption[],
        state: FilterOptionsState<SelectOption>,
      ) => {
        if (!searchableKeys.length) return optionsToFilter;
        const searchText = state.inputValue.toLowerCase();
        return optionsToFilter.filter((option) =>
          searchableKeys.some((key) => {
            const value = _.get(option, key)?.toString().toLowerCase();
            return (
              value?.includes(searchText) ||
              searchText.includes(value as string)
            );
          }),
        );
      }}
      {...props}
      value={foundValue}
      inputValue={inputValue}
      onChange={(event, newValue, reason) => {
        const fullName = _.get(newValue, 'label');

        if (reason === 'clear') {
          props?.onChange?.(event, {
            reason,
            value: typeof newValue === 'string' ? newValue : newValue?.value,
            item: undefined,
          });
          onInputChange('');

          return;
        }

        if (reason === 'selectOption') {
          setInputValue(fullName ?? '');
        }

        props?.onChange?.(event, {
          reason,
          value: typeof newValue === 'string' ? newValue : newValue?.value,
          item: newValue as SelectOption,
        });
      }}
      onInputChange={(_event, newInputValue, reason) => {
        if (
          reason === 'input' ||
          reason === 'clear' ||
          (reason === 'reset' && newInputValue === '')
        ) {
          onInputChange(newInputValue);
        }
      }}
      renderInput={(params) => (
        <FormInput
          fieldProps={{
            ...params,
            ...textFieldProps,
            InputLabelProps: {
              shrink: true,
            },
            InputProps: {
              ...params.InputProps,
              startAdornment: foundValue ? foundValue.iconComponent : undefined,
              endAdornment: (
                <>
                  {loading ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            },
          }}
        />
      )}
    />
  );
};

export default UserSelect;

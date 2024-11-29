import {
  ReactElement,
  SyntheticEvent,
  useCallback,
  useEffect,
  useState,
} from 'react';
import {TextFieldProps} from '@mui/material/TextField';
import Autocomplete, {
  AutocompleteRenderInputParams,
} from '@mui/material/Autocomplete';
import * as _ from 'lodash';
import {useQueryServiceCompanyTechnicians} from 'hooks/reactQuery/useTechnician';
import {createEmptyResource} from 'utils/paging';
import {EmployeesSimpleView, EmployeesView} from 'models/employee';
import {useTheme} from '@mui/system';
import {t} from 'i18next';
import {FormInput} from './form/FormInput';

interface Props {
  getTechnician?: (val: EmployeesView | EmployeesSimpleView | null) => void;
  selectedTechnician?: EmployeesView | EmployeesSimpleView;
  getQuery?: (val: string) => void;
  initialValue?: EmployeesView | EmployeesSimpleView | null;
  textFieldProps?: TextFieldProps;
  disabled?: boolean;
  required?: boolean;
  enableReset?: boolean;
  renderInput?: (params: AutocompleteRenderInputParams) => ReactElement;
  size?: 'small' | 'medium';
}

export const TechnicianAutoComplete = ({
  getTechnician,
  selectedTechnician,
  getQuery = () => {},
  initialValue = null,
  textFieldProps,
  disabled,
  required = true,
  size = 'small',
  enableReset = false,
  renderInput,
}: Props) => {
  const theme = useTheme();
  const [query, setQuery] = useState<string>('');
  const [queryView, setQueryView] = useState(
    initialValue
      ? `${initialValue.userAccount.firstName} ${initialValue.userAccount.lastName}`
      : '',
  );
  const [technician, setTechnician] = useState<
    EmployeesView | EmployeesSimpleView | null
  >(initialValue);

  const {data: techniciansResource = createEmptyResource(10)} =
    useQueryServiceCompanyTechnicians({
      pageIndex: 0,
      pageSize: 3,
      query,
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
      setTechnician(null);
    }
  };

  useEffect(() => {
    if (getTechnician) {
      getTechnician(technician);
    }
  }, [technician]);

  useEffect(() => {
    if (getQuery) {
      getQuery(queryView);
    }

    if (!queryView) {
      setTechnician(null);
      if (getQuery) getQuery('');
    }
  }, [queryView]);

  const handleChange = (
    event: any,
    newValue: EmployeesView | EmployeesSimpleView | null,
  ) => {
    setTechnician(newValue);
  };

  // handle reset
  useEffect(() => {
    if (!enableReset) return;
    if (!selectedTechnician) {
      setQueryView('');
    }
  }, [selectedTechnician, enableReset, setQueryView]);

  return (
    <Autocomplete
      noOptionsText={t('No options')}
      size={size}
      disabled={disabled}
      clearOnBlur={false}
      disablePortal
      id="combo-box-demo"
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
      options={techniciansResource.data}
      onChange={handleChange}
      getOptionLabel={(option) =>
        `${option.userAccount.firstName} ${option.userAccount.lastName}`
      }
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
  );
};

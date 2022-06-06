import {SyntheticEvent, useCallback, useEffect, useState} from 'react';
import {TextFieldProps} from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import * as _ from 'lodash';
import {useQueryServiceCompanyTechnicians} from 'hooks/reactQuery/useTechnician';
import {createEmptyResource} from 'utils/paging-utils';
import {TechnicianView} from 'models/technician';
import {FormInput} from './form/FormInput';

interface Props {
  getTechnician?: (val: TechnicianView | null) => void;
  getQuery?: (val: string) => void;
  initialValue?: TechnicianView | null;
  textFieldProps?: TextFieldProps;
  disabled?: boolean;
}

export const TechnicianAutoComplete = ({
  getTechnician,
  getQuery = () => {},
  initialValue = null,
  textFieldProps,
  disabled,
}: Props) => {
  const [query, setQuery] = useState<string>('');
  const [queryView, setQueryView] = useState(
    initialValue
      ? `${initialValue.userAccount.firstName} ${initialValue.userAccount.lastName}`
      : '',
  );
  const [technician, setTechnician] = useState<TechnicianView | null>(
    initialValue,
  );

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

  return (
    <Autocomplete
      size="small"
      disabled={disabled}
      clearOnBlur={false}
      disablePortal
      id="combo-box-demo"
      sx={{minHeight: 0}}
      options={techniciansResource.data}
      onChange={(event: any, newValue: TechnicianView | null) => {
        setTechnician(newValue);
      }}
      getOptionLabel={(option) =>
        `${option.userAccount.firstName} ${option.userAccount.lastName}`
      }
      onInputChange={onInputChange}
      inputValue={queryView}
      renderInput={(params) => (
        <FormInput
          props={{
            name: 'technicianId',
            ...params,
            ...textFieldProps,
          }}
        />
      )}
    />
  );
};

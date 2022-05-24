import {
  FocusEvent,
  SyntheticEvent,
  useCallback,
  useEffect,
  useState,
} from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import * as _ from 'lodash';
import {useQueryServiceCompanyTechnicians} from 'hooks/reactQuery/useTechnician';
import {createEmptyResource} from 'utils/paging-utils';
import {TechnicianView} from 'models/technician';

interface Props {
  getTechnician?: (val: TechnicianView | null) => void;
  getQuery?: (val: string) => void;
  label?: string;
  fieldStyles?: {[key: string]: any};
  inputError?: string;
  handleBlur?: (e: FocusEvent<any, Element>) => void;
}

export const TechnicianAutoComplete = ({
  getTechnician,
  label = '',
  getQuery = () => {},
  fieldStyles,
  inputError,
  handleBlur,
}: Props) => {
  const [query, setQuery] = useState<string>('');
  const [queryView, setQueryView] = useState('');
  const [technician, setTechnician] = useState<TechnicianView | null>(null);

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

  const onInputChange = (e: SyntheticEvent, newValue: string) => {
    setQueryView(newValue);
    debouncedChangeHandler(newValue);
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
  }, [queryView]);

  return (
    <Autocomplete
      size="small"
      clearOnBlur={false}
      disablePortal
      id="combo-box-demo"
      sx={{minHeight: 100}}
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
        <TextField
          {...params}
          label={label}
          name="technicianId"
          sx={{...fieldStyles}}
          error={!!inputError}
          helperText={inputError}
          onBlur={handleBlur}
        />
      )}
    />
  );
};

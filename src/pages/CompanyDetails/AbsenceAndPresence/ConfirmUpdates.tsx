import {Alert, Box, Typography} from '@mui/material';
import {useTranslation} from 'react-i18next';
import useTheme from '@mui/material/styles/useTheme';

import {Dispatch, SetStateAction} from 'react';

import {CreateEditViewMode} from 'models/misc';
import {EmployeeEventTypeRecord} from 'models/employee';
import {DataList} from './DataList';
import {FormState} from '.';

interface Props {
  dataListMode: CreateEditViewMode;
  setDataListMode: (newValue: CreateEditViewMode) => void;
  form: FormState;
  setForm: Dispatch<SetStateAction<FormState>>;
  editingEvent: {
    event?: EmployeeEventTypeRecord;
    index?: number;
  };
  setEditingEvent: Dispatch<
    SetStateAction<{
      event?: EmployeeEventTypeRecord;
      index?: number;
    }>
  >;
}

export const ConfirmUpdates = ({
  dataListMode,
  setDataListMode,
  form,
  setForm,
  editingEvent,
  setEditingEvent,
}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();

  const handleOnCancel = () => {
    setDataListMode('view');
    setForm({name: ''});
  };

  const handleOnEditStart = (event: EmployeeEventTypeRecord, index: number) => {
    setDataListMode('edit');
    setEditingEvent({event, index});
    setForm({name: event.subtype, type: event.type});
  };

  return (
    <Box sx={{flex: 1, display: 'flex', flexDirection: 'column'}}>
      <Box flex={1} display="flex" flexDirection="column">
        <Alert severity="warning">
          <Typography
            fontWeight="bold"
            variant="body1"
            color={theme.palette.info.infoAlert}>
            {t('Changes will update {{subType}} entries.', {
              subType: editingEvent.event?.subtype,
            })}
          </Typography>
          <Typography variant="body2" color={theme.palette.info.infoAlert}>
            {t(
              'Retroactive update will affect all previous data, while forward-looking update will apply to all input and exports from now on.',
            )}
          </Typography>
        </Alert>

        <Box sx={{display: 'flex', flexDirection: 'column'}}>
          <Box mt={2}>
            <DataList
              onCancel={handleOnCancel}
              onEditStart={handleOnEditStart}
              mode={dataListMode}
              data={editingEvent.event ? [editingEvent.event] : []}
              editingEvent={{event: editingEvent.event, index: 0}}
              form={form}
              setForm={setForm}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

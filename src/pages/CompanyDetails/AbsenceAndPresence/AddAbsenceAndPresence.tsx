import {Alert, Box, Button, Typography} from '@mui/material';
import {useTranslation} from 'react-i18next';
import useTheme from '@mui/material/styles/useTheme';

import {Dispatch, SetStateAction} from 'react';
import AddIcon from '@mui/icons-material/Add';

import {useGetCompanyEventTypes} from 'hooks/reactQuery/useCompanies';
import {useUserSession} from 'hooks/reactQuery/useUserSession';

import {CreateEditViewMode, DataEditingScope} from 'models/misc';
import {EmployeeEventTypeRecord} from 'models/employee';
import {getEventSubtype} from 'utils/employee';
import {EmptyContainer} from './EmptyContainer';
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
  onCreateOrUpdate: (editingScope?: DataEditingScope) => Promise<void>;
  isUpdating?: boolean;
  onDeleteStart: (event: EmployeeEventTypeRecord, index: number) => void;
}

export const AddAbsenceAndPresence = ({
  dataListMode,
  setDataListMode,
  form,
  setForm,
  editingEvent,
  setEditingEvent,
  onCreateOrUpdate,
  onDeleteStart,
  isUpdating = false,
}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();

  const {user} = useUserSession();
  const {data, isFetching} = useGetCompanyEventTypes(
    user?.userAccount.serviceCompany.id!,
  );

  const handleOnCancel = () => {
    setDataListMode('view');
    setForm({name: ''});
  };

  const handleOnCreate = async () => {
    handleOnCancel();
    onCreateOrUpdate();
  };

  const handleOnEditStart = (event: EmployeeEventTypeRecord, index: number) => {
    setDataListMode('edit');
    setEditingEvent({event, index});
    setForm({
      name: getEventSubtype({subtype: event.subtype, type: event.type}, t),
      type: event.type,
    });
  };

  return (
    <Box sx={{flex: 1, display: 'flex', flexDirection: 'column'}}>
      {!data?.length && !isFetching ? (
        <EmptyContainer />
      ) : (
        <Box flex={1} display="flex" flexDirection="column">
          {dataListMode === 'edit' ? (
            <Alert severity="warning">
              <Typography
                fontWeight="bold"
                variant="body1"
                color={theme.palette.info.infoAlert}>
                {t('Changes will update the existing type and data.')}
              </Typography>
              <Typography variant="body2" color={theme.palette.info.infoAlert}>
                {t('Choose the type of update in the next step.')}
              </Typography>
            </Alert>
          ) : (
            <Alert severity="info">
              <Typography variant="body2">
                {t('Default and configurable types of absence and presence.')}
              </Typography>
            </Alert>
          )}

          <Box sx={{display: 'flex', flexDirection: 'column'}}>
            <Box mt={2}>
              <DataList
                onCancel={handleOnCancel}
                onCreate={handleOnCreate}
                onEditStart={handleOnEditStart}
                onDeleteStart={onDeleteStart}
                loading={isFetching || isUpdating}
                mode={dataListMode}
                data={data ?? []}
                editingEvent={editingEvent}
                form={form}
                setForm={setForm}
              />
            </Box>
            {dataListMode === 'view' && (
              <Box mt={2}>
                <Button
                  disabled={dataListMode !== 'view'}
                  onClick={() => {
                    setDataListMode('create');
                  }}
                  startIcon={
                    <AddIcon
                      htmlColor={
                        dataListMode === 'view'
                          ? theme.palette.primary.light
                          : theme.palette.secondary.mainLight
                      }
                    />
                  }
                  sx={{color: theme.palette.primary.light}}
                  variant="text">
                  {t('New type')}
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

import {Alert, Box, Button, Typography} from '@mui/material';

import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {CreateEditViewMode} from 'models/misc';
import {Dispatch, SetStateAction, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import {useCompanyJobTypes} from 'hooks/reactQuery/useCompanies';
import {
  ServiceOrderTypePriority,
  ServiceOrderTypeRecord,
} from 'models/service-order';
import {UseFieldArrayReturn, UseFormReset} from 'react-hook-form';
import {serviceOrderTypeToString} from 'utils/service-order-utils';
import useTheme from '@mui/material/styles/useTheme';
import {DataList} from './DataList';
import {EmptyContainer} from './EmptyContainer';
import {FormState} from '.';

export interface JobTypeForm {
  jobTypes: {
    icon: string;
    name: string;
    priority: ServiceOrderTypePriority;
    createInAdvanceDays: number;
  }[];
}
interface Props {
  dataListMode: CreateEditViewMode;
  setDataListMode: (newValue: CreateEditViewMode) => void;
  form: FormState;
  setForm: Dispatch<SetStateAction<FormState>>;
  editingEvent: {
    event?: ServiceOrderTypeRecord;
    index?: number;
  };
  setEditingEvent: Dispatch<
    SetStateAction<{
      event?: ServiceOrderTypeRecord;
      index?: number;
    }>
  >;
  isUpdating?: boolean;
  onDeleteStart: (event: ServiceOrderTypeRecord, index: number) => void;
  fields: UseFieldArrayReturn<JobTypeForm, 'jobTypes'>['fields'];
  append: UseFieldArrayReturn<JobTypeForm, 'jobTypes'>['append'];
  reset: UseFormReset<JobTypeForm>;
  update: UseFieldArrayReturn<JobTypeForm, 'jobTypes'>['update'];
}

const AddJobType = ({
  dataListMode,
  setDataListMode,
  form,
  setForm,
  editingEvent,
  setEditingEvent,
  onDeleteStart,
  isUpdating = false,
  fields,
  append,
  reset,
  update,
}: Props) => {
  const {t} = useTranslation();
  const theme = useTheme();

  const {user} = useUserSession();

  const {data, isFetching} = useCompanyJobTypes(
    user?.userAccount.serviceCompany.id!,
  );

  useEffect(() => {
    if (data) {
      reset({
        jobTypes: data.map((item) => ({
          name: item.name,
          icon: item.icon,
          priority: item.priority,
          createInAdvanceDays: item.createInAdvanceDays || 0,
        })),
      });
    }
  }, [data, reset]);

  const handleAddNewType = () => {
    setDataListMode('create');
    setForm({
      name: '',
      icon: 'HelpOutlineOutlinedIcon',
      priority: ServiceOrderTypePriority.LOW,
      createInAdvanceDays: 0,
    });
  };

  const handleOnCancel = () => {
    setDataListMode('view');
    setForm({
      icon: '',
      name: '',
      priority: ServiceOrderTypePriority.LOW,
      createInAdvanceDays: 0,
    });
  };

  const handleOnCreate = async () => {
    if (dataListMode === 'create') {
      append(form);
    } else if (dataListMode === 'edit' && editingEvent.index !== undefined) {
      update(editingEvent.index, form);
    }

    handleOnCancel();
  };
  const handleOnEditStart = (event: ServiceOrderTypeRecord, index: number) => {
    setDataListMode('edit');
    setEditingEvent({event, index});

    setForm({
      name:
        serviceOrderTypeToString(event.name) === '-'
          ? event.name
          : serviceOrderTypeToString(event.name),
      icon: event.icon,
      priority: event.priority,
      createInAdvanceDays: event.createInAdvanceDays || 0,
    });
  };

  return (
    <Box sx={{flex: 1, display: 'flex', flexDirection: 'column'}}>
      {!data?.length && !isFetching ? (
        <EmptyContainer />
      ) : (
        <Box flex={1} display="flex" flexDirection="column">
          {dataListMode === 'edit' ? (
            <Alert severity="info">
              <Typography
                fontWeight="bold"
                variant="body1"
                color={theme.palette.info.infoAlert}>
                {t(
                  'Saved changes will be applied to all job types from this point onwards.',
                )}
              </Typography>
            </Alert>
          ) : (
            <Alert severity="info">
              <Typography variant="body1" fontWeight="bold">
                {t('Default job types for you to kickstart your work')}
              </Typography>
              <Typography variant="body2">
                {t(
                  'You can also configure and add custom job types for your specific needs.',
                )}
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
                data={fields}
                editingEvent={editingEvent}
                form={form}
                setForm={setForm}
              />
            </Box>

            {dataListMode === 'view' && (
              <Box mt={2}>
                <Button
                  disabled={dataListMode !== 'view'}
                  onClick={handleAddNewType}
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

export default AddJobType;

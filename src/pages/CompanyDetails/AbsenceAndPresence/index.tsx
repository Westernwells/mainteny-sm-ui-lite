import {Card} from 'components/Card';
import {EmptySection} from 'components/EmptySection';
import {Dialog} from 'components/Dialog';
import useTheme from '@mui/material/styles/useTheme';

import {useState} from 'react';
import {CreateEditViewMode, DataEditingScope} from 'models/misc';
import {
  EmployeeEventType,
  EmployeeEventTypeRecord,
  SaveEmployeeEventTypeRecords,
} from 'models/employee';
import {Button} from 'components/Button';
import {Box} from '@mui/system';
import {CircularProgress, TextField, Typography} from '@mui/material';
import {useTranslation} from 'react-i18next';
import {
  useGetCompanyEventTypes,
  useUpdateCompanyEventTypes,
} from 'hooks/reactQuery/useCompanies';
import {useUserSession} from 'hooks/reactQuery/useUserSession';
import {EMPLOYEE_EVENT_TYPES_TO_PRESENCE_BOOLEAN} from 'utils/constants';
import {ConfirmDelete} from 'components/ConfirmDelete';
import {CardDataListItem} from 'components/CardDataListItem';
import {convertToText} from 'utils/utils';
import {EmployeeEventTypeIcon} from 'components/EmployeeEventTypeIcon';
import {getEventSubtype} from 'utils/employee';
import {AddAbsenceAndPresence} from './AddAbsenceAndPresence';
import {ConfirmUpdates} from './ConfirmUpdates';

export interface FormState {
  name?: string;
  type?: EmployeeEventType;
}

interface DeleteEventState {
  userTypedName: string;
  isOpen?: boolean;
  event?: EmployeeEventTypeRecord;
  index?: number;
}

export const AbsenceAndPresence = () => {
  const theme = useTheme();
  const [openDialog, setOpenDialog] = useState(false);
  const [dataListMode, setDataListMode] = useState<CreateEditViewMode>('view');
  const [form, setForm] = useState<FormState>({name: ''});
  const [editingEvent, setEditingEvent] = useState<{
    event?: EmployeeEventTypeRecord;
    index?: number;
    retroactiveUpdate?: boolean;
  }>({});
  const [editingStepNo, setEditingStepNo] = useState(1);
  const {t} = useTranslation();
  const {mutateAsync: updateCompanyEventTypes, isLoading: isUpdating} =
    useUpdateCompanyEventTypes('Event type created successfully');
  const {user} = useUserSession();
  const [deleteEventState, setDeleteEventState] = useState<DeleteEventState>({
    userTypedName: '',
    isOpen: false,
  });
  const {data} = useGetCompanyEventTypes(user?.userAccount.serviceCompany.id!);

  const resetState = () => {
    setEditingEvent({});
    setForm({name: ''});
    setDataListMode('view');
    setEditingStepNo(1);
    setDeleteEventState({userTypedName: '', isOpen: false});
  };

  const handleCreateOrUpdate = async (editingScope?: DataEditingScope) => {
    const payload = {
      subtype: form.name!,
      type: form.type!,
      presence: EMPLOYEE_EVENT_TYPES_TO_PRESENCE_BOOLEAN[form.type!],
    };
    const body: SaveEmployeeEventTypeRecords = {
      added: [payload],
      updated: [],
      deleted: [],
    };

    if (deleteEventState.event) {
      body.added = [];
      body.deleted = [deleteEventState.event];
    } else if (dataListMode === 'edit') {
      setEditingEvent((prevData) => ({
        ...prevData,
        retroactiveUpdate: editingScope === DataEditingScope.ALL,
      }));

      body.added = [];
      body.updated = [
        {
          from: editingEvent.event!,
          to: payload,
          scope: editingScope!,
        },
      ];
    }

    await updateCompanyEventTypes({
      companyId: user?.userAccount.serviceCompany.id!,
      body,
    });

    resetState();
  };

  const renderRightFooterButton = () => (
    <Box>
      <Button
        testId="saveButton"
        buttonProps={{
          size: 'large',
          variant: 'outlined',
          onClick: () => {
            handleCreateOrUpdate(DataEditingScope.ALL);
          },
          autoFocus: true,
          sx: {mr: 1},
          startIcon: isUpdating && editingEvent.retroactiveUpdate && (
            <CircularProgress size={15} />
          ),
          disabled: isUpdating,
        }}>
        <Typography variant="subtitle2">{t('Retroactive update')}</Typography>
      </Button>
      <Button
        testId="saveButton"
        buttonProps={{
          size: 'large',
          variant: 'contained',
          onClick: () => {
            handleCreateOrUpdate(DataEditingScope.FUTURE);
          },
          autoFocus: true,
          startIcon: isUpdating && !editingEvent.retroactiveUpdate && (
            <CircularProgress size={15} />
          ),
          disabled: isUpdating,
        }}>
        <Typography variant="subtitle2">{t('Update changes')}</Typography>
      </Button>
    </Box>
  );

  const handleDeleteStart = (event: EmployeeEventTypeRecord, index: number) => {
    setDeleteEventState((prevData) => ({
      ...prevData,
      event,
      isOpen: true,
      userTypedName: '',
      index,
    }));
  };

  return (
    <>
      <Card
        title="Absence and Presence"
        actionHandler={() => setOpenDialog(true)}
        containerProps={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0.75,
          height: '100%',
        }}>
        {!data ? (
          <EmptySection
            label="No types defined"
            size="tiny"
            subLabel="Create your custom absence and presence types"
            containerStyle={{height: '100%', my: '2em'}}
            illustration="calendarClockGrey"
            subLabelProps={{sx: {color: '#828DA3', mt: 1}}}
          />
        ) : (
          data.map((item, index) => (
            <CardDataListItem
              key={index}
              label={getEventSubtype(
                {subtype: item.subtype, type: item.type},
                t,
              )}
              value={t(convertToText(item.type))}
              iconElement={
                <EmployeeEventTypeIcon
                  color={theme.palette.text.disabled}
                  type={item.type}
                />
              }
            />
          ))
        )}
      </Card>
      <Dialog
        title="Absence and Presence"
        onCancel={(forceClose?: boolean) => {
          if (forceClose || dataListMode !== 'edit') {
            setOpenDialog(false);
          }

          if (editingStepNo === 2) {
            setEditingStepNo(1);
            return;
          }

          resetState();
        }}
        onSave={() => {
          if (editingStepNo === 1 && dataListMode === 'edit') {
            setEditingStepNo(2);
          } else {
            setOpenDialog(false);
            resetState();
          }
        }}
        saveButtonText={dataListMode === 'edit' ? 'Next' : 'Save changes'}
        cancelButtonText={editingStepNo === 2 ? 'Back' : 'Cancel'}
        dialogProps={{
          maxWidth: 'md',
          open: openDialog || false,
        }}
        sx={{
          '& .MuiDialog-paper': {
            maxHeight: 'none',
          },
          '& .MuiDialogContent-root': {
            display: 'flex',
            flexDirection: 'column',
          },
        }}
        dialogContentTextStyles={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
        saveButtonContainerStyles={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
        }}
        dialogActionsStyles={{
          padding: '1em 24px 1em 1.5em',
        }}
        renderRightFooterButton={
          editingStepNo === 2 ? renderRightFooterButton : undefined
        }
        dialogContentStyles={{
          mx: 0,
          mt: 0,
          px: 3,
          pb: 0,
          pt: 3,
        }}>
        {editingStepNo === 1 && (
          <AddAbsenceAndPresence
            dataListMode={dataListMode}
            setDataListMode={(newValue: CreateEditViewMode) => {
              setDataListMode(newValue);
            }}
            isUpdating={isUpdating}
            onCreateOrUpdate={handleCreateOrUpdate}
            onDeleteStart={handleDeleteStart}
            editingEvent={editingEvent}
            setEditingEvent={setEditingEvent}
            form={form}
            setForm={setForm}
          />
        )}
        {editingStepNo === 2 && (
          <ConfirmUpdates
            dataListMode={dataListMode}
            setDataListMode={(newValue: CreateEditViewMode) => {
              setDataListMode(newValue);
            }}
            editingEvent={editingEvent}
            setEditingEvent={setEditingEvent}
            form={form}
            setForm={setForm}
          />
        )}
      </Dialog>
      <ConfirmDelete
        confirmText="Delete"
        saveLoading={isUpdating}
        title={t(`Delete {{presenceType}} type`, {
          presenceType: deleteEventState.event?.presence
            ? 'presence'
            : 'absence',
        })}
        body={[
          t('You are about to delete {{typeName}}', {
            typeName: deleteEventState.event?.subtype,
          }),
          t('Enter the type name to confirm deletion.'),
        ]}
        dialogContent={
          <TextField
            value={deleteEventState.userTypedName}
            onChange={(e) => {
              setDeleteEventState((prevData) => ({
                ...prevData,
                userTypedName: e.target.value,
              }));
            }}
            size="small"
            placeholder="Enter type name"
            fullWidth
            sx={{mt: 2, mb: 1}}
          />
        }
        buttonSx={{
          bgcolor: 'error.light',
          color: 'primary.contrastText',
          '&:hover': {
            bgcolor: 'error.light',
            color: 'primary.contrastText',
          },
        }}
        disableSave={
          deleteEventState.event?.subtype?.toLowerCase() !==
            deleteEventState.userTypedName?.toLowerCase() || isUpdating
        }
        open={deleteEventState.isOpen ?? false}
        onConfirm={() => {
          handleCreateOrUpdate();
        }}
        onClose={() => {
          setDeleteEventState({
            userTypedName: '',
            isOpen: false,
          });
        }}
      />
    </>
  );
};

import DeleteOutline from '@mui/icons-material/DeleteOutline';
import DeleteForever from '@mui/icons-material/DeleteForever';
import IconButton from '@mui/material/IconButton';
import React, {useState} from 'react';
import Box from '@mui/material/Box';
import {Dialog} from 'components/Dialog';
import {useTranslation} from 'react-i18next';
import {DatePicker} from 'components/DatePicker';
import Alert from '@mui/material/Alert';
import {format} from 'date-fns';
import {toDate} from 'utils/datetime';
import {Switch} from 'components/Switch';
import Typography from '@mui/material/Typography';
import {ContractElevatorView} from 'models/contract';
import {useUpdateContractElevator} from 'hooks/reactQuery/useContacts';
import {Tooltip} from '../utils/utils';

interface Props {
  elevator: ContractElevatorView;
  contractId?: string;
}

export const Actions = ({elevator, contractId}: Props) => {
  const {t} = useTranslation();
  const [switchActive, setSwitchActive] = useState(false);
  const removalDate = elevator.contracts?.find(
    (co) => co.id === contractId,
  )?.removalDate;

  const [scheduleRemovalDate, setScheduleRemovalDate] = useState('');
  const {mutateAsync: updateOrDelete, isLoading: isDeleting} =
    useUpdateContractElevator('Unit deleted successfully');
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [openRestore, setOpenRestore] = useState(false);

  return (
    <>
      <Box>
        {removalDate ? (
          <Tooltip title={t('Revert unit removal')} placement="top" arrow>
            <IconButton onClick={() => setOpenRestore(true)}>
              <DeleteForever sx={{color: 'action.active'}} />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title={t('Remove unit')} placement="top" arrow>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                setOpenDeleteConfirm(true);
              }}>
              <DeleteOutline sx={{color: 'action.active'}} />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Dialog
        title="Remove unit"
        isSaving={isDeleting}
        saveButtonProps={{
          sx: {
            backgroundColor: 'error.light',
            '&:hover': {
              backgroundColor: 'error.light',
            },
          },
        }}
        saveButtonContainerProps={{sx: {display: 'flex', gap: '10px'}}}
        onCancel={() => {
          setOpenDeleteConfirm(false);
          setSwitchActive(false);
          setScheduleRemovalDate('');
        }}
        saveButtonText="Remove unit"
        dialogProps={{
          maxWidth: 'xs',
          open: openDeleteConfirm || false,
        }}
        onSave={async () => {
          await updateOrDelete({
            elevatorId: elevator?.id,
            contractId: contractId as string,
            body: {
              removalDate:
                scheduleRemovalDate || format(new Date(), 'yyyy-MM-dd'),
            },
          });
          setOpenDeleteConfirm(false);
          setSwitchActive(false);
          setScheduleRemovalDate('');
        }}>
        <Box display="flex" flexDirection="column" gap={1}>
          <Alert severity="warning">
            {t(
              `You are about to remove the {{externalId}} unit from the contract. Are you sure about it?`,
              {
                externalId: elevator?.externalId ?? '',
              },
            )}
          </Alert>
          <Box sx={{mt: '1.5em'}}>
            <Switch
              value={switchActive}
              getValue={(value) => setSwitchActive(value)}
              label="Schedule removal date"
            />
          </Box>
          {switchActive && (
            <DatePicker
              defaultDate={
                scheduleRemovalDate ? toDate(scheduleRemovalDate) : null
              }
              containerStyles={{mr: '1em', width: '100%'}}
              getSelectedDate={(date) => {
                if (date) {
                  setScheduleRemovalDate(format(date, 'yyyy-MM-dd'));
                }
              }}
              disableMask
              textFieldProps={{
                label: t('Removal date'),
                sx: {width: '100%'},
              }}
            />
          )}
        </Box>
      </Dialog>
      <Dialog
        title="Restore unit"
        isSaving={isDeleting}
        onCancel={() => setOpenRestore(false)}
        saveButtonText="Restore unit"
        saveButtonContainerProps={{sx: {display: 'flex', gap: '10px'}}}
        dialogProps={{
          maxWidth: 'xs',
          open: openRestore || false,
        }}
        onSave={async () => {
          await updateOrDelete({
            elevatorId: elevator?.id,
            contractId: contractId as string,
            body: {removalDate: null},
          });
          setOpenRestore(false);
        }}>
        <Box display="flex" flexDirection="column" gap={1}>
          <Typography>
            {t(
              `You are about to cancel scheduled removal of unit {{externalId}} and restore it.`,
              {
                externalId: elevator?.externalId ?? '',
              },
            )}
          </Typography>
        </Box>
      </Dialog>
    </>
  );
};

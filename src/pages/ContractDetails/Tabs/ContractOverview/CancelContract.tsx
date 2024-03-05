import React, {Dispatch, FC, SetStateAction} from 'react';
import {useTranslation} from 'react-i18next';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import {Dialog} from 'components/Dialog';
import {format} from 'date-fns';
import {toDate} from 'utils/datetime';
import {DatePicker} from 'components/DatePicker';

interface Props {
  isLoading: boolean;
  openCancelContract: boolean;
  onCancelContract: () => void;
  setCancelContract: Dispatch<SetStateAction<boolean>>;
  setCancellationDate: Dispatch<SetStateAction<string>>;
  endDate?: string;
}

export const CancelContract: FC<Props> = ({
  onCancelContract,
  isLoading,
  setCancelContract,
  openCancelContract,
  setCancellationDate,
  endDate,
}) => {
  const {t} = useTranslation();

  return (
    <Dialog
      title="Cancel Contract"
      isSaving={isLoading}
      onCancel={() => setCancelContract(false)}
      saveButtonText="Confirm"
      dialogProps={{
        maxWidth: 'xs',
        open: openCancelContract || false,
      }}
      onSave={() => onCancelContract()}>
      <Box display="flex" flexDirection="column" gap={3}>
        <Alert severity="warning">
          {t(
            'You are about to cancel this contract. This action is permanent.',
          )}
        </Alert>
        <DatePicker
          defaultDate={endDate ? toDate(endDate) : null}
          containerStyles={{mr: '1em', width: '100%'}}
          getSelectedDate={(date) => {
            if (date) {
              setCancellationDate(format(date, 'yyyy-MM-dd'));
            }
          }}
          disableMask
          textFieldProps={{
            label: t('Cancellation Date'),
            sx: {width: '100%'},
          }}
        />
      </Box>
    </Dialog>
  );
};
